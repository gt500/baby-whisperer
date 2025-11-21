/**
 * TensorFlow.js Model Inference for Baby Cry Detection
 * Loads the Keras H5 model and performs inference
 */

import * as tf from '@tensorflow/tfjs';

let model: tf.LayersModel | null = null;
let isModelLoading = false;

/**
 * Load the Keras H5 model
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
    
    // Try to load the converted TensorFlow.js model
    // Note: The .h5 file must first be converted using:
    // tensorflowjs_converter --input_format=keras baby_cry_detector.h5 public/models/baby_cry_detector
    model = await tf.loadLayersModel('/models/baby_cry_detector/model.json');
    
    console.log('Model loaded successfully');
    console.log('Input shape:', model.inputs[0].shape);
    console.log('Output shape:', model.outputs[0].shape);
    
    isModelLoading = false;
  } catch (error) {
    isModelLoading = false;
    console.error('Error loading model:', error);
    console.warn('⚠️ Model not found. The .h5 file needs to be converted to TensorFlow.js format.');
    console.warn('Run: tensorflowjs_converter --input_format=keras baby_cry_detector.h5 public/models/baby_cry_detector');
    // Don't throw - allow app to continue with fallback mode
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

  // If model still not loaded (conversion needed), use fallback detection
  if (!model) {
    console.warn('Using fallback detection - model not available');
    return fallbackDetection(audioData);
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
    // For sigmoid output: predictions[0] is probability of "cry" class
    // For softmax output: predictions[0] = no_cry, predictions[1] = cry
    let cryProbability: number;
    let noCryProbability: number;
    
    if (predictions.length === 1) {
      // Sigmoid output (single value)
      cryProbability = predictions[0];
      noCryProbability = 1 - cryProbability;
    } else {
      // Softmax output (two values: [no_cry, cry])
      noCryProbability = predictions[0];
      cryProbability = predictions[1];
    }
    
    const isCrying = cryProbability > 0.5;
    const confidence = Math.max(cryProbability, noCryProbability);

    console.log('Inference result:', {
      isCrying,
      confidence: (confidence * 100).toFixed(1) + '%',
      cryProb: (cryProbability * 100).toFixed(1) + '%',
      noCryProb: (noCryProbability * 100).toFixed(1) + '%',
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
  const isCrying = rms > 0.02; // Threshold for significant audio
  const confidence = Math.min(0.65 + rms * 10, 0.95); // Simulated confidence
  
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
