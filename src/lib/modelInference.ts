/**
 * TensorFlow.js Model Inference for Baby Cry Detection
 * Loads the Graph model and performs inference using extracted audio features
 */

import * as tf from '@tensorflow/tfjs';
import { extractAudioFeatures } from './audioFeatureExtraction';

let model: tf.GraphModel | null = null;
let isModelLoading = false;
let loadError: string | null = null;
let loadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

/**
 * Get the last loading error
 */
export function getLoadError(): string | null {
  return loadError;
}

/**
 * Reset model state for retry
 */
export function resetModelState(): void {
  model = null;
  isModelLoading = false;
  loadError = null;
  loadAttempts = 0;
}

/**
 * Load the TensorFlow.js Graph model with retry mechanism
 */
export async function loadModel(): Promise<void> {
  if (model) {
    return; // Already loaded
  }

  if (isModelLoading) {
    // Wait for current loading to complete
    while (isModelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }

  try {
    isModelLoading = true;
    loadError = null;
    loadAttempts++;
    
    console.log(`[ML] Loading baby cry detection model (attempt ${loadAttempts}/${MAX_LOAD_ATTEMPTS})...`);
    
    const modelUrl = '/models/baby_cry_detector/model.json';
    
    // Step 1: Verify model.json is accessible
    console.log('[ML] Step 1: Verifying model.json accessibility...');
    const testFetch = await fetch(modelUrl);
    console.log('[ML] Fetch status:', testFetch.status, testFetch.statusText);
    console.log('[ML] Content-Type:', testFetch.headers.get('content-type'));
    
    if (!testFetch.ok) {
      throw new Error(`Model file not found: HTTP ${testFetch.status}`);
    }
    
    // Step 2: Verify it's actually JSON
    const contentType = testFetch.headers.get('content-type');
    const responseText = await testFetch.text();
    
    if (!contentType?.includes('application/json') && !responseText.startsWith('{')) {
      console.error('[ML] Response is not JSON. First 200 chars:', responseText.substring(0, 200));
      throw new Error('Model file returned non-JSON response (possibly HTML 404 page)');
    }
    
    // Step 3: Verify JSON is parseable
    try {
      const modelJson = JSON.parse(responseText);
      console.log('[ML] Model JSON parsed successfully');
      console.log('[ML] Model format:', modelJson.format);
      console.log('[ML] Model topology nodes:', modelJson.modelTopology?.node?.length || 'N/A');
    } catch (parseError) {
      console.error('[ML] JSON parse error:', parseError);
      throw new Error('Model JSON is malformed');
    }
    
    // Step 4: Load with TensorFlow.js
    console.log('[ML] Step 2: Loading model with TensorFlow.js...');
    model = await tf.loadGraphModel(modelUrl);
    
    console.log('[ML] Model loaded successfully!');
    console.log('[ML] Model inputs:', model.inputs);
    console.log('[ML] Model outputs:', model.outputs);
    
    isModelLoading = false;
    loadError = null;
  } catch (error) {
    isModelLoading = false;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    loadError = errorMessage;
    console.error('[ML] Error loading model:', errorMessage);
    
    // Retry with exponential backoff
    if (loadAttempts < MAX_LOAD_ATTEMPTS) {
      const delay = Math.pow(2, loadAttempts) * 1000; // 2s, 4s, 8s
      console.log(`[ML] Retrying in ${delay/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      isModelLoading = false; // Reset for retry
      return loadModel();
    }
    
    console.warn('[ML] Max attempts reached. Running in fallback mode.');
  }
}

export interface InferenceResult {
  isCrying: boolean;
  confidence: number;
  probabilities: {
    cry: number;
    noCry: number;
  };
}

/**
 * Run inference on audio data
 */
export async function detectCry(audioData: Float32Array): Promise<InferenceResult> {
  if (!model) {
    await loadModel();
  }

  // If model still not loaded, use fallback detection
  if (!model) {
    console.warn('[ML] Using fallback detection - model not available');
    return fallbackDetection(audioData);
  }

  try {
    // Extract 1024-dimensional features from audio
    const features = extractAudioFeatures(audioData, 16000);
    
    // Create input tensor with shape [1, 1024]
    const inputTensor = tf.tensor2d([Array.from(features)], [1, 1024]);
    
    // Run inference using execute for graph models
    const output = model.predict(inputTensor) as tf.Tensor;
    const predictions = await output.data();
    
    // Clean up tensors
    inputTensor.dispose();
    output.dispose();

    // Model outputs sigmoid probability (0-1) for cry detection
    // Single output: probability of crying
    const cryProbability = predictions[0];
    const noCryProbability = 1 - cryProbability;
    
    const isCrying = cryProbability > 0.5;
    const confidence = Math.max(cryProbability, noCryProbability);

    console.log('[ML] Inference result:', {
      isCrying,
      confidence: (confidence * 100).toFixed(1) + '%',
      cryProb: (cryProbability * 100).toFixed(1) + '%',
    });

    return {
      isCrying,
      confidence,
      probabilities: {
        cry: cryProbability,
        noCry: noCryProbability,
      },
    };
  } catch (error) {
    console.error('[ML] Error during inference:', error);
    console.warn('[ML] Falling back to simulated detection');
    return fallbackDetection(audioData);
  }
}

/**
 * Fallback detection when model is not available
 * Uses audio characteristics to simulate detection
 */
function fallbackDetection(audioData: Float32Array): InferenceResult {
  // Calculate RMS energy
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i] * audioData[i];
  }
  const rms = Math.sqrt(sum / audioData.length);
  
  // Simulate detection based on audio energy
  const isCrying = rms > 0.02;
  const confidence = Math.min(0.65 + rms * 10, 0.95);
  
  return {
    isCrying,
    confidence,
    probabilities: {
      cry: isCrying ? confidence : 1 - confidence,
      noCry: isCrying ? 1 - confidence : confidence,
    },
  };
}

/**
 * Dispose of the model and free memory
 */
export function disposeModel(): void {
  if (model) {
    model.dispose();
    model = null;
  }
}

/**
 * Get model info (for debugging)
 */
export function getModelInfo(): { loaded: boolean; inputShape?: number[]; outputShape?: number[]; error?: string } | null {
  if (loadError) {
    return {
      loaded: false,
      error: loadError,
    };
  }
  
  if (!model) {
    return null;
  }

  return {
    loaded: true,
    inputShape: [1, 1024],
    outputShape: [1, 1],
  };
}
