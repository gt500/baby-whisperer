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

// Inline model JSON to avoid file serving issues
const MODEL_JSON = {"format": "graph-model", "generatedBy": "2.19.0", "convertedBy": "TensorFlow.js Converter v4.22.0", "signature": {"inputs": {"dense_6_input": {"name": "dense_6_input:0", "dtype": "DT_FLOAT", "tensorShape": {"dim": [{"size": "-1"}, {"size": "1024"}]}}}, "outputs": {"output_0": {"name": "Identity:0", "dtype": "DT_FLOAT", "tensorShape": {"dim": [{"size": "-1"}, {"size": "1"}]}}}}, "modelTopology": {"node": [{"name": "StatefulPartitionedCall/sequential_3_1/dense_6_1/Cast/ReadVariableOp", "op": "Const", "attr": {"value": {"tensor": {"dtype": "DT_FLOAT", "tensorShape": {"dim": [{"size": "1024"}, {"size": "256"}]}}}, "dtype": {"type": "DT_FLOAT"}}}, {"name": "StatefulPartitionedCall/sequential_3_1/dense_6_1/BiasAdd/ReadVariableOp", "op": "Const", "attr": {"value": {"tensor": {"dtype": "DT_FLOAT", "tensorShape": {"dim": [{"size": "256"}]}}}, "dtype": {"type": "DT_FLOAT"}}}, {"name": "StatefulPartitionedCall/sequential_3_1/dense_7_1/Cast/ReadVariableOp", "op": "Const", "attr": {"value": {"tensor": {"dtype": "DT_FLOAT", "tensorShape": {"dim": [{"size": "256"}, {"size": "128"}]}}}, "dtype": {"type": "DT_FLOAT"}}}, {"name": "StatefulPartitionedCall/sequential_3_1/dense_7_1/BiasAdd/ReadVariableOp", "op": "Const", "attr": {"value": {"tensor": {"dtype": "DT_FLOAT", "tensorShape": {"dim": [{"size": "128"}]}}}, "dtype": {"type": "DT_FLOAT"}}}, {"name": "StatefulPartitionedCall/sequential_3_1/dense_8_1/Cast/ReadVariableOp", "op": "Const", "attr": {"value": {"tensor": {"dtype": "DT_FLOAT", "tensorShape": {"dim": [{"size": "128"}, {"size": "1"}]}}}, "dtype": {"type": "DT_FLOAT"}}}, {"name": "StatefulPartitionedCall/sequential_3_1/dense_8_1/Add/ReadVariableOp", "op": "Const", "attr": {"value": {"tensor": {"dtype": "DT_FLOAT", "tensorShape": {"dim": [{"size": "1"}]}}}, "dtype": {"type": "DT_FLOAT"}}}, {"name": "dense_6_input", "op": "Placeholder", "attr": {"shape": {"shape": {"dim": [{"size": "-1"}, {"size": "1024"}]}}, "dtype": {"type": "DT_FLOAT"}}}, {"name": "StatefulPartitionedCall/sequential_3_1/dense_6_1/Relu", "op": "_FusedMatMul", "input": ["dense_6_input", "StatefulPartitionedCall/sequential_3_1/dense_6_1/Cast/ReadVariableOp", "StatefulPartitionedCall/sequential_3_1/dense_6_1/BiasAdd/ReadVariableOp"], "device": "/device:CPU:0", "attr": {"transpose_a": {"b": false}, "transpose_b": {"b": false}, "fused_ops": {"list": {"s": ["Qmlhc0FkZA==", "UmVsdQ=="]}}, "num_args": {"i": "1"}, "leakyrelu_alpha": {"f": 0.2}, "epsilon": {"f": 0.0}, "T": {"type": "DT_FLOAT"}}}, {"name": "StatefulPartitionedCall/sequential_3_1/dense_7_1/Relu", "op": "_FusedMatMul", "input": ["StatefulPartitionedCall/sequential_3_1/dense_6_1/Relu", "StatefulPartitionedCall/sequential_3_1/dense_7_1/Cast/ReadVariableOp", "StatefulPartitionedCall/sequential_3_1/dense_7_1/BiasAdd/ReadVariableOp"], "device": "/device:CPU:0", "attr": {"transpose_a": {"b": false}, "transpose_b": {"b": false}, "fused_ops": {"list": {"s": ["Qmlhc0FkZA==", "UmVsdQ=="]}}, "num_args": {"i": "1"}, "leakyrelu_alpha": {"f": 0.2}, "epsilon": {"f": 0.0}, "T": {"type": "DT_FLOAT"}}}, {"name": "StatefulPartitionedCall/sequential_3_1/dense_8_1/Add", "op": "_FusedMatMul", "input": ["StatefulPartitionedCall/sequential_3_1/dense_7_1/Relu", "StatefulPartitionedCall/sequential_3_1/dense_8_1/Cast/ReadVariableOp", "StatefulPartitionedCall/sequential_3_1/dense_8_1/Add/ReadVariableOp"], "device": "/device:CPU:0", "attr": {"transpose_a": {"b": false}, "transpose_b": {"b": false}, "fused_ops": {"list": {"s": ["Qmlhc0FkZA=="]}}, "num_args": {"i": "1"}, "leakyrelu_alpha": {"f": 0.2}, "epsilon": {"f": 0.0}, "T": {"type": "DT_FLOAT"}}}, {"name": "StatefulPartitionedCall/sequential_3_1/dense_8_1/Sigmoid", "op": "Sigmoid", "input": ["StatefulPartitionedCall/sequential_3_1/dense_8_1/Add"], "attr": {"T": {"type": "DT_FLOAT"}}}, {"name": "Identity", "op": "Identity", "input": ["StatefulPartitionedCall/sequential_3_1/dense_8_1/Sigmoid"], "attr": {"T": {"type": "DT_FLOAT"}}}], "library": {}, "versions": {"producer": 2129}}, "weightsManifest": [{"paths": ["group1-shard1of1.bin"], "weights": [{"name": "StatefulPartitionedCall/sequential_3_1/dense_6_1/Cast/ReadVariableOp", "shape": [1024, 256], "dtype": "float32"}, {"name": "StatefulPartitionedCall/sequential_3_1/dense_6_1/BiasAdd/ReadVariableOp", "shape": [256], "dtype": "float32"}, {"name": "StatefulPartitionedCall/sequential_3_1/dense_7_1/Cast/ReadVariableOp", "shape": [256, 128], "dtype": "float32"}, {"name": "StatefulPartitionedCall/sequential_3_1/dense_7_1/BiasAdd/ReadVariableOp", "shape": [128], "dtype": "float32"}, {"name": "StatefulPartitionedCall/sequential_3_1/dense_8_1/Cast/ReadVariableOp", "shape": [128, 1], "dtype": "float32"}, {"name": "StatefulPartitionedCall/sequential_3_1/dense_8_1/Add/ReadVariableOp", "shape": [1], "dtype": "float32"}]}]};

// Supabase storage URL for weights
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const WEIGHTS_PATH = 'ml-models/group1-shard1of1.bin';

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
 * Custom IOHandler to load model from inline JSON and Supabase storage weights
 */
function createModelIOHandler(): tf.io.IOHandler {
  return {
    async load(): Promise<tf.io.ModelArtifacts> {
      console.log('[ML] Using custom IOHandler with inline model JSON');
      
      // Try multiple weight sources
      const weightSources = [
        `${SUPABASE_URL}/storage/v1/object/public/${WEIGHTS_PATH}`,
        '/models/baby_cry_detector/group1-shard1of1.bin',
        `${window.location.origin}/models/baby_cry_detector/group1-shard1of1.bin`,
      ];
      
      let weightData: ArrayBuffer | null = null;
      
      for (const weightUrl of weightSources) {
        try {
          console.log(`[ML] Trying to fetch weights from: ${weightUrl}`);
          const response = await fetch(weightUrl);
          
          if (!response.ok) {
            console.log(`[ML] Weight fetch failed: ${response.status}`);
            continue;
          }
          
          const contentType = response.headers.get('content-type');
          console.log(`[ML] Weight content-type: ${contentType}`);
          
          // Check if response is binary (not HTML)
          if (contentType?.includes('text/html')) {
            console.log('[ML] Received HTML instead of binary, trying next source');
            continue;
          }
          
          weightData = await response.arrayBuffer();
          console.log(`[ML] Successfully loaded weights (${weightData.byteLength} bytes)`);
          break;
        } catch (e) {
          console.log(`[ML] Failed to fetch from ${weightUrl}:`, e);
        }
      }
      
      if (!weightData) {
        throw new Error('Could not load model weights from any source. Please upload group1-shard1of1.bin to ml-models storage bucket.');
      }
      
      return {
        modelTopology: MODEL_JSON.modelTopology,
        format: MODEL_JSON.format,
        generatedBy: MODEL_JSON.generatedBy,
        convertedBy: MODEL_JSON.convertedBy,
        weightSpecs: MODEL_JSON.weightsManifest[0].weights.map(w => ({
          ...w,
          dtype: w.dtype as 'float32',
        })),
        weightData,
      };
    }
  };
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
    
    // Use custom IOHandler to load from inline JSON + Supabase storage
    model = await tf.loadGraphModel(createModelIOHandler());
    
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
