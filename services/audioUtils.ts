// This tells TypeScript that 'lamejs' is a global variable from the script tag
declare var lamejs: any;

// Decodes a base64 string into a Uint8Array.
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes raw PCM audio data into an AudioBuffer.
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export async function assembleAudioTrack(
  segments: { buffer: AudioBuffer, startTime: number }[],
  ctx: AudioContext
): Promise<AudioBuffer | null> {
  if (segments.length === 0) return null;

  // Let's assume all buffers have same sample rate (ctx.sampleRate) and 1 or 2 channels.
  let channels = 1;
  let sampleRate = ctx.sampleRate;
  
  // Find longest time
  let maxTimeSeconds = 0;
  for (const seg of segments) {
    channels = Math.max(channels, seg.buffer.numberOfChannels);
    if (seg.buffer.sampleRate !== sampleRate) {
       sampleRate = seg.buffer.sampleRate; // just use the last one seen, usually 24000
    }
    const endTime = seg.startTime + seg.buffer.duration;
    if (endTime > maxTimeSeconds) {
      maxTimeSeconds = endTime;
    }
  }

  const length = Math.ceil(maxTimeSeconds * sampleRate);
  if (length === 0) return null;

  const mixedBuffer = ctx.createBuffer(channels, length, sampleRate);

  for (const seg of segments) {
    const startSample = Math.floor(seg.startTime * sampleRate);
    for (let ch = 0; ch < channels; ch++) {
      const mixedData = mixedBuffer.getChannelData(ch);
      const chData = ch < seg.buffer.numberOfChannels ? seg.buffer.getChannelData(ch) : seg.buffer.getChannelData(0);
      for (let i = 0; i < chData.length; i++) {
        if (startSample + i < length) {
           // mix by adding
           mixedData[startSample + i] += chData[i];
        }
      }
    }
  }

  return mixedBuffer;
}

export async function mixAudioBuffers(
  buffer1: AudioBuffer | null,
  buffer2: AudioBuffer | null,
  ctx: AudioContext,
  volume1: number = 1.0,
  volume2: number = 1.0
): Promise<AudioBuffer | null> {
  if (!buffer1 && !buffer2) return null;
  if (!buffer1) return buffer2;
  if (!buffer2) return buffer1;

  const length = Math.max(buffer1.length, buffer2.length);
  const sampleRate = Math.max(buffer1.sampleRate, buffer2.sampleRate);
  const channels = Math.max(buffer1.numberOfChannels, buffer2.numberOfChannels);

  // For simplicity, assuming both are at the same sample rate 
  // (WebAudio automatically handles different rates when decoding, but if manually generated they should match context rate)
  
  const mixedBuffer = ctx.createBuffer(channels, length, sampleRate);

  for (let ch = 0; ch < channels; ch++) {
    const mixedData = mixedBuffer.getChannelData(ch);
    
    const chData1 = ch < buffer1.numberOfChannels ? buffer1.getChannelData(ch) : buffer1.getChannelData(0);
    const chData2 = ch < buffer2.numberOfChannels ? buffer2.getChannelData(ch) : buffer2.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const s1 = i < chData1.length ? chData1[i] * volume1 : 0;
      const s2 = i < chData2.length ? chData2[i] * volume2 : 0;
      mixedData[i] = s1 + s2;
    }
  }

  return mixedBuffer;
}
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const aLength = buffer.length;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const dataSize = aLength * numOfChan * (bitDepth / 8);
  const fileSize = 44 + dataSize; // 44 bytes for header

  const wavBuffer = new ArrayBuffer(fileSize);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(8, 'WAVE');
  
  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Sub-chunk size
  view.setUint16(20, 1, true); // Audio format (1=PCM)
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numOfChan * (bitDepth / 8), true); // Byte rate
  view.setUint16(32, numOfChan * (bitDepth / 8), true); // Block align
  view.setUint16(34, bitDepth, true);

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM data
  let offset = 44;
  for (let i = 0; i < aLength; i++) {
    for (let channel = 0; channel < numOfChan; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

export async function audioBufferToOgg(audioBuffer: AudioBuffer): Promise<Blob> {
  const encodeOgg = (await import('@audio/encode-ogg')).default;
  const sampleRate = audioBuffer.sampleRate;
  const channels = audioBuffer.numberOfChannels;
  
  const enc = await encodeOgg({ sampleRate, channels, quality: 5 });
  
  const chunks: any[] = [];
  
  const length = audioBuffer.length;
  // encode in chunks to avoid memory spikes
  const chunkSize = 4096;
  const channelData = [];
  for (let ch = 0; ch < channels; ch++) {
    channelData.push(audioBuffer.getChannelData(ch));
  }
  
  for (let i = 0; i < length; i += chunkSize) {
    const chunkLength = Math.min(chunkSize, length - i);
    const chunkArrays = [];
    for (let ch = 0; ch < channels; ch++) {
      chunkArrays.push(channelData[ch].subarray(i, i + chunkLength));
    }
    const oggData = enc.encode(chunkArrays);
    if (oggData.length > 0) chunks.push(oggData);
  }
  
  const finalOggData = enc.flush();
  if (finalOggData.length > 0) chunks.push(finalOggData);
  
  enc.free();
  return new Blob(chunks, { type: 'audio/ogg' });
}

// Converts an AudioBuffer to an MP3 file Blob using LameJS.
export function audioBufferToMp3(audioBuffer: AudioBuffer): Blob {
  const channels = 1; // LameJS supports mono
  const sampleRate = audioBuffer.sampleRate;
  const kbps = 128; // Bitrate
  const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
  
  const pcmData = audioBuffer.getChannelData(0);
  const samples = new Int16Array(pcmData.length);
  for(let i=0; i < pcmData.length; i++) {
    samples[i] = pcmData[i] * 32767.5;
  }

  let mp3Data: any[] = [];
  const sampleBlockSize = 1152; //Can be anything but this is a typical size

  for (let i = 0; i < samples.length; i += sampleBlockSize) {
    const sampleChunk = samples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }
  }

  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
  }

  return new Blob(mp3Data, {type: 'audio/mp3'});
}