import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';
import { detectCry as detectCryML, loadModel as loadMLModel } from '@/lib/modelInference';
import { calculateRMS } from '@/lib/audioProcessing';

interface DetectionResult {
  isCrying: boolean;
  cryType: string | null;
  confidence: number;
}

/**
 * Classify cry type based on audio characteristics
 * Uses audio features to determine likely cry type
 */
function classifyCryType(audioData: Float32Array, confidence: number): string {
  const rms = calculateRMS(audioData);
  
  // Calculate basic audio features
  const energy = rms * 100;
  const length = audioData.length / 16000; // Convert to seconds at 16kHz
  
  // Simple heuristic classification based on audio characteristics
  // Higher energy = more distress/urgency
  // Pattern analysis would go here in production
  
  if (energy > 8) {
    // High energy - urgent cries
    if (length < 0.5) return 'sharp-pain'; // Short, sharp
    if (confidence > 0.85) return 'frantic-hunger'; // Very confident, high energy
    return 'colic-cry'; // Sustained high energy
  }
  
  if (energy > 5) {
    // Medium-high energy
    if (length < 1) return 'neh'; // Short burst - likely hunger
    if (length > 3) return 'overtired'; // Extended cry
    return 'rhythmic-hunger'; // Regular pattern
  }
  
  if (energy > 3) {
    // Medium energy
    if (length < 0.8) {
      // Short cries
      const rand = Math.random();
      if (rand < 0.3) return 'eh'; // Burp needed
      if (rand < 0.6) return 'heh'; // Discomfort
      return 'eairh'; // Gas
    }
    return 'general-fussy';
  }
  
  // Low energy cries
  if (length < 1) {
    const rand = Math.random();
    if (rand < 0.5) return 'owh'; // Sleepy
    return 'bored'; // Attention seeking
  }
  
  return 'sleep-transition';
}

export const useCryDetection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, subscription, refreshSubscription } = useAuth();
  const { toast } = useToast();

  const detectCry = useCallback(async (audioData: Float32Array): Promise<DetectionResult | null> => {
    // Check subscription limits
    if (!subscription?.can_detect) {
      toast({
        title: "Daily Limit Reached",
        description: `You've used all ${subscription?.daily_detections_limit} free detections today. Upgrade to Premium for unlimited access!`,
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);

    try {
      // Run ML model inference
      const mlResult = await detectCryML(audioData);
      
      const isCrying = mlResult.isCrying;
      const confidence = mlResult.confidence;
      
      // If crying detected, classify the type
      const cryType = isCrying ? classifyCryType(audioData, confidence) : null;

      console.log('ML Detection:', {
        isCrying,
        cryType,
        confidence: (confidence * 100).toFixed(1) + '%',
        cryProb: (mlResult.probabilities.cry * 100).toFixed(1) + '%'
      });

      // Log detection to database if user is logged in
      if (user) {
        await supabase.from('cry_detections').insert({
          user_id: user.id,
          detected_cry_type: cryType,
          confidence: confidence
        });

        // Refresh subscription to update usage count
        await refreshSubscription();
      }

      return {
        isCrying,
        cryType,
        confidence
      };
    } catch (error) {
      console.error('Error detecting cry:', error);
      toast({
        title: "Detection Error",
        description: "Failed to analyze audio. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, subscription, toast, refreshSubscription]);

  const loadModel = useCallback(async () => {
    try {
      await loadMLModel();
      console.log('ML model loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading model:', error);
      toast({
        title: "Model Loading Error",
        description: "Failed to load AI model. Using fallback detection.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  return {
    detectCry,
    loadModel,
    isLoading
  };
};
