import { useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

interface DetectionResult {
  isCrying: boolean;
  cryType: string | null;
  confidence: number;
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
      // TODO: Replace with actual model inference
      // For now, using mock detection
      const mockConfidence = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
      const isCrying = mockConfidence > 0.6;
      
      // Mock cry types based on confidence
      const cryTypes = ['neh', 'owh', 'heh', 'eairh', 'eh'];
      const cryType = isCrying ? cryTypes[Math.floor(Math.random() * cryTypes.length)] : null;

      // Log detection to database if user is logged in
      if (user) {
        await supabase.from('cry_detections').insert({
          user_id: user.id,
          detected_cry_type: cryType,
          confidence: mockConfidence
        });

        // Refresh subscription to update usage count
        await refreshSubscription();
      }

      return {
        isCrying,
        cryType,
        confidence: mockConfidence
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
      // TODO: Load actual TensorFlow.js model
      // const model = await tf.loadLayersModel('/models/baby_cry_detector/model.json');
      // return model;
      
      console.log('Model loading placeholder - integrate actual model from /public/models/');
      return null;
    } catch (error) {
      console.error('Error loading model:', error);
      toast({
        title: "Model Loading Error",
        description: "Failed to load AI model. Using fallback detection.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  return {
    detectCry,
    loadModel,
    isLoading
  };
};
