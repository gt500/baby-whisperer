/**
 * TensorFlow.js Model Inference for Baby Cry Detection
 * Loads the TFLite model and performs inference
 */

import * as tf from '@tensorflow/tfjs';
import { loadTFLiteModel } from '@tensorflow/tfjs-tflite';

let model: any = null;
let isModelLoading = false;

/**
 * Load the TFLite model
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
    
    // Load TFLite model
    model = await loadTFLiteModel('/models/baby_cry_detector.tflite');
    
    console.log('Model loaded successfully');
    isModelLoading = false;
  } catch (error) {
    isModelLoading = false;
    console.error('Error loading model:', error);
    throw new Error('Failed to load cry detection model');
  }
}

/**
 * Prepare audio input for the model
 * The model expects processed audio (likely YAMNet embeddings or raw waveform)
 */
function prepareModelInput(audioData: Float32Array): tf.Tensor {
  // Based on the training code, the model expects:
  // - 16kHz audio
  // - Normalized waveform
  // - Shape: [1, samples]
  
  // Ensure audio is at least 1 second (16000 samples at 16kHz)
  const minLength = 16000;
  let processedAudio = audioData;
  
  if (audioData.length < minLength) {
    // Pad with zeros
    processedAudio = new Float32Array(minLength);
    processedAudio.set(audioData);
  } else if (audioData.length > minLength * 10) {
    // Truncate if too long (max 10 seconds)
    processedAudio = audioData.slice(0, minLength * 10);
  }

  // Create tensor with shape [1, samples]
  const tensor = tf.tensor2d([Array.from(processedAudio)]);
  
  return tensor;
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

  try {
    // Prepare input
    const inputTensor = prepareModelInput(audioData);
    
    // Run inference
    const output = model.predict(inputTensor) as tf.Tensor;
    const predictions = await output.data();
    
    // Clean up tensors
    inputTensor.dispose();
    output.dispose();

    // Binary classification output
    // predictions[0] should be probability of "cry" class
    const cryProbability = predictions[0];
    const noCryProbability = 1 - cryProbability;
    
    const isCrying = cryProbability > 0.5;
    const confidence = Math.max(cryProbability, noCryProbability);

    console.log('Inference result:', {
      isCrying,
      confidence: confidence * 100,
      cryProb: cryProbability * 100,
      noCryProb: noCryProbability * 100,
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
    throw new Error('Failed to detect cry');
  }
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
export function getModelInfo(): any {
  if (!model) {
    return null;
  }

  return {
    loaded: true,
    inputShape: model.inputs?.[0]?.shape,
    outputShape: model.outputs?.[0]?.shape,
  };
}
