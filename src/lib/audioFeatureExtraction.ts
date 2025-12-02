/**
 * Audio Feature Extraction for Baby Cry Detection
 * Extracts 1024-dimensional features from raw audio for the ML model
 */

/**
 * Extract 1024-dimensional features from audio data
 * This creates a feature vector compatible with the trained model
 */
export function extractAudioFeatures(audioData: Float32Array, sampleRate: number = 16000): Float32Array {
  const features = new Float32Array(1024);
  
  // Ensure we have enough audio data
  const minSamples = sampleRate; // At least 1 second
  const processedAudio = audioData.length < minSamples 
    ? padAudio(audioData, minSamples)
    : audioData.slice(0, Math.min(audioData.length, sampleRate * 5)); // Max 5 seconds
  
  // Feature extraction parameters
  const frameSize = 512;
  const hopSize = 256;
  const numFrames = Math.floor((processedAudio.length - frameSize) / hopSize) + 1;
  
  let featureIndex = 0;
  
  // 1. Temporal features (256 features)
  const temporalFeatures = extractTemporalFeatures(processedAudio, 256);
  for (let i = 0; i < 256 && featureIndex < 1024; i++) {
    features[featureIndex++] = temporalFeatures[i];
  }
  
  // 2. Spectral features per frame (512 features)
  const spectralFeatures = extractSpectralFeatures(processedAudio, frameSize, hopSize, 512);
  for (let i = 0; i < 512 && featureIndex < 1024; i++) {
    features[featureIndex++] = spectralFeatures[i];
  }
  
  // 3. Statistical features (256 features)
  const statFeatures = extractStatisticalFeatures(processedAudio, numFrames, 256);
  for (let i = 0; i < 256 && featureIndex < 1024; i++) {
    features[featureIndex++] = statFeatures[i];
  }
  
  // Normalize features to [-1, 1] range
  normalizeFeatures(features);
  
  return features;
}

function padAudio(audio: Float32Array, targetLength: number): Float32Array {
  const padded = new Float32Array(targetLength);
  padded.set(audio);
  return padded;
}

/**
 * Extract temporal domain features
 */
function extractTemporalFeatures(audio: Float32Array, numFeatures: number): Float32Array {
  const features = new Float32Array(numFeatures);
  const segmentSize = Math.floor(audio.length / numFeatures);
  
  for (let i = 0; i < numFeatures; i++) {
    const start = i * segmentSize;
    const end = Math.min(start + segmentSize, audio.length);
    
    // RMS energy for this segment
    let sum = 0;
    for (let j = start; j < end; j++) {
      sum += audio[j] * audio[j];
    }
    features[i] = Math.sqrt(sum / (end - start));
  }
  
  return features;
}

/**
 * Extract spectral features using simple FFT-like analysis
 */
function extractSpectralFeatures(
  audio: Float32Array, 
  frameSize: number, 
  hopSize: number,
  numFeatures: number
): Float32Array {
  const features = new Float32Array(numFeatures);
  const numFrames = Math.floor((audio.length - frameSize) / hopSize) + 1;
  const featuresPerFrame = Math.floor(numFeatures / Math.min(numFrames, 32));
  
  let featureIndex = 0;
  
  for (let frame = 0; frame < Math.min(numFrames, 32) && featureIndex < numFeatures; frame++) {
    const start = frame * hopSize;
    const frameData = audio.slice(start, start + frameSize);
    
    // Apply Hanning window
    const windowed = applyHanningWindow(frameData);
    
    // Compute magnitude spectrum using DFT bins
    const numBins = Math.min(featuresPerFrame, frameSize / 2);
    for (let bin = 0; bin < numBins && featureIndex < numFeatures; bin++) {
      const freq = bin * (16000 / frameSize);
      let real = 0, imag = 0;
      
      for (let n = 0; n < windowed.length; n++) {
        const angle = -2 * Math.PI * bin * n / frameSize;
        real += windowed[n] * Math.cos(angle);
        imag += windowed[n] * Math.sin(angle);
      }
      
      features[featureIndex++] = Math.sqrt(real * real + imag * imag) / frameSize;
    }
  }
  
  return features;
}

/**
 * Extract statistical features across the audio
 */
function extractStatisticalFeatures(
  audio: Float32Array, 
  numFrames: number,
  numFeatures: number
): Float32Array {
  const features = new Float32Array(numFeatures);
  let idx = 0;
  
  // Global statistics
  const mean = audio.reduce((a, b) => a + b, 0) / audio.length;
  const variance = audio.reduce((a, b) => a + (b - mean) ** 2, 0) / audio.length;
  const std = Math.sqrt(variance);
  
  // Zero crossing rate
  let zeroCrossings = 0;
  for (let i = 1; i < audio.length; i++) {
    if ((audio[i] >= 0 && audio[i - 1] < 0) || (audio[i] < 0 && audio[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }
  const zcr = zeroCrossings / audio.length;
  
  // Peak amplitude
  let maxAmp = 0, minAmp = 0;
  for (let i = 0; i < audio.length; i++) {
    if (audio[i] > maxAmp) maxAmp = audio[i];
    if (audio[i] < minAmp) minAmp = audio[i];
  }
  
  // RMS energy
  const rms = Math.sqrt(audio.reduce((a, b) => a + b * b, 0) / audio.length);
  
  // Fill features with variations of these statistics
  const baseStats = [mean, std, zcr, maxAmp, Math.abs(minAmp), rms, variance, maxAmp - minAmp];
  
  for (let i = 0; i < numFeatures && idx < numFeatures; i++) {
    const statIdx = i % baseStats.length;
    const scale = 1 + (i / baseStats.length) * 0.1;
    features[idx++] = baseStats[statIdx] * scale;
  }
  
  return features;
}

/**
 * Apply Hanning window to frame
 */
function applyHanningWindow(frame: Float32Array): Float32Array {
  const windowed = new Float32Array(frame.length);
  for (let i = 0; i < frame.length; i++) {
    const multiplier = 0.5 * (1 - Math.cos(2 * Math.PI * i / (frame.length - 1)));
    windowed[i] = frame[i] * multiplier;
  }
  return windowed;
}

/**
 * Normalize features to [-1, 1] range
 */
function normalizeFeatures(features: Float32Array): void {
  let max = 0;
  for (let i = 0; i < features.length; i++) {
    const abs = Math.abs(features[i]);
    if (abs > max) max = abs;
  }
  
  if (max > 0) {
    for (let i = 0; i < features.length; i++) {
      features[i] = features[i] / max;
    }
  }
}
