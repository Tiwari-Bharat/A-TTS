import { VoiceOption } from './types';

export const AVAILABLE_VOICES: VoiceOption[] = [
  { value: 'Kore', label: 'Kore (Female, Clear)', description: 'A clear, professional female voice, great for narration.' },
  { value: 'Puck', label: 'Puck (Male, Warm)', description: 'A warm and friendly male voice, perfect for conversational content.' },
  { value: 'Charon', label: 'Charon (Male, Deep)', description: 'A deep, authoritative male voice, suitable for serious topics.' },
  { value: 'Fenrir', label: 'Fenrir (Female, Crisp)', description: 'A crisp, energetic female voice that captures attention.' },
  { value: 'Zephyr', label: 'Zephyr (Female, Gentle)', description: 'A gentle and soothing female voice, ideal for calming content.' }
];

export const SOUND_EFFECTS: VoiceOption[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'auto', label: 'Auto-Emotion' },
  { value: 'whisper', label: 'Whisper' },
  { value: 'laugh', label: 'Laughing' },
  { value: 'stutter', label: 'Stuttering' },
  { value: 'excited', label: 'Excited' },
  { value: 'sad', label: 'Sad' },
  { value: 'sneeze', label: 'Sneezing' },
  { value: 'custom', label: 'Custom Effect' },
];

export const EFFECT_PROMPTS: { [key: string]: string } = {
  whisper: 'In a whispering voice, say: ',
  laugh: 'With a laugh, say: ',
  stutter: 'Stuttering, say: ',
  excited: 'Excitedly, say: ',
  sad: 'Sadly, say: ',
  sneeze: '(sneezes) and then says: ',
  normal: '',
};


export const DEFAULT_TEXT = "The character limit has been removed. Your words are now truly limitless. Craft novels, epic scripts, or any long-form content you can imagine. The only limit is your creativity.";

export const TARGET_LANGUAGES = [
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Chinese (Mandarin)', label: 'Chinese (Mandarin)' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Arabic', label: 'Arabic' },
];