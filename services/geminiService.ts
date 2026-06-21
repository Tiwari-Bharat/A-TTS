import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData, assembleAudioTrack } from './audioUtils';
import { EFFECT_PROMPTS } from "../constants";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const SAMPLE_RATE = 24000;
const NUM_CHANNELS = 1;

export const analyzeTextEmotion = async (text: string): Promise<string> => {
  const availableEffects = Object.keys(EFFECT_PROMPTS).filter(k => k !== 'normal' && k !== 'custom').join(', ');
  
  const prompt = `Analyze the primary emotion of the following text. Respond with ONLY ONE of the following keywords that best matches the tone: ${availableEffects}, or "normal" for a neutral tone.

Text: "${text}"

Keyword:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    const resultText = response.text.trim().toLowerCase();
    
    // Return the corresponding prompt prefix
    if (EFFECT_PROMPTS.hasOwnProperty(resultText)) {
      return EFFECT_PROMPTS[resultText];
    }
    return ''; // Default to normal if the response is unexpected
} catch(error) {
    console.error("Error analyzing text emotion:", error);
    return ''; // Default to normal on error
  }
}

export const translateVideoText = async (textOrUrl: string, targetLanguage: string): Promise<string> => {
  try {
    const prompt = `The user has provided the following input:\n\n"${textOrUrl}"\n\nIf this input is a URL (such as a YouTube video link), you MUST use the Google Search tool to look up the exact URL. Find the authentic video title, channel name, and description. Do NOT hallucinate or guess the video content based on the URL string. After retrieving the true details of the video, provide a summary of its content in ${targetLanguage}, and suggest 2 realistically related videos in ${targetLanguage}. \n\nIf the input is just plain text, translate it directly to ${targetLanguage}.\n\nIMPORTANT: If the input is a transcript with timestamps (e.g. [00:00.00], 00:00:00), you MUST strictly preserve the exact timestamps and layout in your response. DO NOT invent new timestamps.\n\nFormat your response to be spoken aloud (text-to-speech) except for the timestamps. DO NOT include markdown formatting or special characters that sound awkward when spoken.`;
    try {
        const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }]
        }
        });
        return (response.text || '').trim();
    } catch (e: any) {
        const errorString = e ? (e.message || JSON.stringify(e) || e.toString()) : '';
        if (errorString.includes('PERMISSION_DENIED') || errorString.includes('403') || errorString.includes('does not have permission')) {
            console.warn("Google Search tool permission denied, falling back to direct translation");
            try {
                const fallbackPrompt = `The user has provided the following input:\n\n"${textOrUrl}"\n\nPlease translate it directly to ${targetLanguage}. Format your response to be spoken aloud.`;
                const fbResponse = await ai.models.generateContent({
                    model: 'gemini-3.5-flash',
                    contents: fallbackPrompt
                });
                return (fbResponse.text || '').trim();
            } catch (fallbackErr: any) {
                console.error("Fallback translation also failed", fallbackErr);
                throw fallbackErr;
            }
        }
        throw e;
    }
  } catch (error) {
    console.error("Error translating video/text:", error);
    if (error instanceof Error) {
        throw new Error(`Translation/Search failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during translation/search.");
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    const prompt = `Translate the following text to ${targetLanguage}. 
IMPORTANT: If the text is a transcript with timestamps (e.g. [00:00], 00:00:00, 00:02.00), you MUST strictly preserve the exact timestamps and layout in your response. DO NOT invent new timestamps.
Return ONLY the translated text, without any additional explanations or quotes.

Text: "${text}"`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    return (response.text || '').trim();
  } catch (error) {
    console.error("Error translating text:", error);
    if (error instanceof Error) {
        throw new Error(`Translation failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during translation.");
  }
};

export const generateSpeech = async (text: string, voice: string, effect: string, audioContext: AudioContext, isSsml: boolean = false): Promise<AudioBuffer> => {
  try {
    let prompt = text;
    if (!isSsml && effect) {
      prompt = `${effect}${text}`;
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const candidate = response?.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;

    if (!candidate || !part || !base64Audio) {
      if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
          throw new Error(`Speech generation failed with reason: ${candidate.finishReason}. The content may have triggered safety filters.`);
      }
      throw new Error("Invalid response from Gemini API. Audio data was missing or malformed.");
    }

    const audioBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, audioContext, SAMPLE_RATE, NUM_CHANNELS);
    
    return audioBuffer;
  } catch (error) {
    console.error("Error generating speech:", error);
    if (error instanceof Error) {
        throw new Error(`Text-to-Speech API failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API to generate speech.");
  }
};

export interface TranscriptSegment {
  timeInSeconds: number;
  text: string;
}

export const parseTranscript = (text: string): TranscriptSegment[] | null => {
  // Matches [00:00.00], 00:00:00.00, 00:00, or [00:00]
  // Allows optional hours, minutes, seconds and milliseconds
  const regex = /\[?(?:(?:(\d{1,2}):)?(\d{1,2}):)?(\d{2})(?:[.,](\d{1,3}))?\]?/g;
  
  let match;
  let lastIndex = 0;
  const segments: TranscriptSegment[] = [];
  let foundAny = false;
  
  while ((match = regex.exec(text)) !== null) {
      foundAny = true;
      const matchPos = match.index;
      if (segments.length > 0) {
         segments[segments.length - 1].text = text.substring(lastIndex, matchPos).trim();
      }
      
      const hours = match[1] ? parseInt(match[1]) : 0;
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const seconds = parseInt(match[3]);
      const millis = match[4] ? parseInt(match[4].padEnd(3, '0')) : 0;
      
      const timeInSeconds = hours * 3600 + minutes * 60 + seconds + millis / 1000;
      
      segments.push({
          timeInSeconds,
          text: "" // will be filled in next iter or at end
      });
      lastIndex = regex.lastIndex;
  }
  
  if (foundAny && segments.length > 0) {
      segments[segments.length - 1].text = text.substring(lastIndex).trim();
      
      // Filter out empty texts
      return segments.filter(s => s.text.length > 0);
  }
  
  return null;
}

export const generateTranscriptOrSpeech = async (text: string, voice: string, effect: string, audioContext: AudioContext, isSsml: boolean = false): Promise<AudioBuffer> => {
  const segments = parseTranscript(text);
  
  if (!segments || segments.length === 0) {
     return await generateSpeech(text, voice, effect, audioContext, isSsml);
  }

  // It's a transcript! Generate speech for each segment.
  const audioSegments: { buffer: AudioBuffer, startTime: number }[] = [];
  
  // We process them sequentially or in small chunks. To avoid API limits and ordering issues, let's process sequentially.
  for (const seg of segments) {
     if (!seg.text.trim()) continue;
     try {
       const segBuffer = await generateSpeech(seg.text, voice, effect, audioContext, isSsml);
       audioSegments.push({
         buffer: segBuffer,
         startTime: seg.timeInSeconds
       });
     } catch (e) {
       console.warn(`Failed to generate speech for segment: "${seg.text}"`, e);
       // continue with next segment instead of totally failing
     }
  }

  if (audioSegments.length === 0) {
    throw new Error("Failed to generate speech for any transcript segment.");
  }

  const mixed = await assembleAudioTrack(audioSegments, audioContext);
  if (!mixed) throw new Error("Failed to assemble audio track.");
  return mixed;
};