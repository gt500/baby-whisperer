/**
 * TensorFlow.js Model Inference for Baby Cry Detection
 * Loads the Graph model and performs inference using extracted audio features
 */

import * as tf from '@tensorflow/tfjs';
import { extractAudioFeatures } from './audioFeatureExtraction';

let model: tf.GraphModel | null = null;
let isModelLoading = false;

/**
 * Load the TensorFlow.js Graph model
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
    console.log('Loading baby cry detection model...');
    
    // Load the Graph model (converted from Keras)
    model = await tf.loadGraphModel('/models/baby_cry_detector/model.json');
    
    console.log('Model loaded successfully');
    console.log('Model inputs:', model.inputs);
    console.log('Model outputs:', model.outputs);
    
    isModelLoading = false;
  } catch (error) {
    isModelLoading = false;
    console.error('Error loading model:', error);
    console.warn('⚠️ Model loading failed. Running in fallback mode.');
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
    console.warn('Using fallback detection - model not available');
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

    console.log('ML Inference result:', {
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
    console.error('Error during inference:', error);
    console.warn('Falling back to simulated detection');
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
export function getModelInfo(): { loaded: boolean; inputShape?: number[]; outputShape?: number[] } | null {
  if (!model) {
    return null;
  }

  return {
    loaded: true,
    inputShape: [1, 1024],
    outputShape: [1, 1],
  };
}
