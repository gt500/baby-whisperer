/**
 * Audio Processing Utilities for Baby Cry Detection
 * Handles microphone access, audio recording, and preprocessing
 */

export interface AudioRecording {
  audioBlob: Blob;
  audioBuffer: AudioBuffer;
  duration: number;
}

/**
 * Request microphone permission and start recording
 */
export async function startRecording(): Promise<MediaRecorder> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000, // Model expects 16kHz
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm',
    });

    return mediaRecorder;
  } catch (error) {
    console.error('Error accessing microphone:', error);
    throw new Error('Microphone access denied. Please enable microphone permissions.');
  }
}

/**
 * Record audio for a specified duration
 */
export async function recordAudio(duration: number = 3000): Promise<AudioRecording> {
  const mediaRecorder = await startRecording();
  const audioChunks: Blob[] = [];

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        
        // Decode audio to get AudioBuffer
        const audioContext = new AudioContext({ sampleRate: 16000 });
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        resolve({
          audioBlob,
          audioBuffer,
          duration: audioBuffer.duration * 1000,
        });
      } catch (error) {
        reject(error);
      }
    };

    mediaRecorder.onerror = (error) => {
      reject(error);
    };

    // Start recording
    mediaRecorder.start();

    // Stop after specified duration
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }, duration);
  });
}

/**
 * Convert AudioBuffer to Float32Array (mono, 16kHz)
 */
export function audioBufferToFloat32Array(audioBuffer: AudioBuffer): Float32Array {
  // Get first channel (mono)
  const channelData = audioBuffer.getChannelData(0);
  return new Float32Array(channelData);
}

/**
 * Normalize audio data to [-1, 1] range
 */
export function normalizeAudio(audioData: Float32Array): Float32Array {
  const max = Math.max(...Array.from(audioData).map(Math.abs));
  if (max === 0) return audioData;
  
  return audioData.map(sample => sample / max);
}

/**
 * Calculate RMS (Root Mean Square) energy of audio
 * Useful for detecting if there's actual sound vs silence
 */
export function calculateRMS(audioData: Float32Array): number {
  const sumSquares = audioData.reduce((sum, sample) => sum + sample * sample, 0);
  return Math.sqrt(sumSquares / audioData.length);
}

/**
 * Check if audio contains sufficient energy (not silence)
 */
export function hasSignificantAudio(audioData: Float32Array, threshold: number = 0.01): boolean {
  const rms = calculateRMS(audioData);
  return rms > threshold;
}

/**
 * Resample audio to target sample rate (if needed)
 * Note: This is a simple linear interpolation. For production, use a proper resampling library.
 */
export function resampleAudio(
  audioData: Float32Array,
  originalSampleRate: number,
  targetSampleRate: number
): Float32Array {
  if (originalSampleRate === targetSampleRate) {
    return audioData;
  }

  const ratio = originalSampleRate / targetSampleRate;
  const newLength = Math.round(audioData.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const originalIndex = i * ratio;
    const index = Math.floor(originalIndex);
    const fraction = originalIndex - index;

    if (index + 1 < audioData.length) {
      // Linear interpolation
      result[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction;
    } else {
      result[i] = audioData[index];
    }
  }

  return result;
}

/**
 * Trim silence from beginning and end of audio
 */
export function trimSilence(
  audioData: Float32Array,
  threshold: number = 0.01
): Float32Array {
  let start = 0;
  let end = audioData.length - 1;

  // Find start
  while (start < audioData.length && Math.abs(audioData[start]) < threshold) {
    start++;
  }

  // Find end
  while (end > start && Math.abs(audioData[end]) < threshold) {
    end--;
  }

  return audioData.slice(start, end + 1);
}

/**
 * Get audio visualization data for waveform display
 */
export function getWaveformData(audioData: Float32Array, samples: number = 100): number[] {
  const blockSize = Math.floor(audioData.length / samples);
  const waveform: number[] = [];

  for (let i = 0; i < samples; i++) {
    const start = i * blockSize;
    const end = start + blockSize;
    const slice = audioData.slice(start, end);
    
    // Get max absolute value in this block
    const maxValue = Math.max(...Array.from(slice).map(Math.abs));
    waveform.push(maxValue);
  }

  return waveform;
}
