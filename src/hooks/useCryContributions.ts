import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ContributionData {
  audioBlob: Blob;
  detectedCryType: string | null;
  confidence: number;
  durationSeconds: number;
}

interface FeedbackData {
  contributionId: string;
  isCorrect: boolean;
  userVerifiedType?: string;
  babyAgeMonths?: number;
}

export const useCryContributions = () => {
  const { user } = useAuth();

  const uploadContribution = useCallback(async (data: ContributionData): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileName = `${user.id}/${Date.now()}.mp3`;
      
      // Upload audio to storage
      const { error: uploadError } = await supabase.storage
        .from('cry-contributions')
        .upload(fileName, data.audioBlob, {
          contentType: 'audio/mp3',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Get the URL
      const { data: urlData } = supabase.storage
        .from('cry-contributions')
        .getPublicUrl(fileName);

      // Insert record
      const { data: record, error: insertError } = await supabase
        .from('cry_contributions')
        .insert({
          user_id: user.id,
          audio_url: urlData.publicUrl,
          detected_cry_type: data.detectedCryType,
          confidence: data.confidence,
          duration_seconds: data.durationSeconds,
          status: 'pending',
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      console.log('Contribution uploaded:', record.id);
      return record.id;
    } catch (err) {
      console.error('Error uploading contribution:', err);
      return null;
    }
  }, [user]);

  const submitFeedback = useCallback(async (feedback: FeedbackData): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('cry_contributions')
        .update({
          is_correct: feedback.isCorrect,
          user_verified_type: feedback.userVerifiedType,
          baby_age_months: feedback.babyAgeMonths,
        })
        .eq('id', feedback.contributionId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('Feedback submitted for:', feedback.contributionId);
      return true;
    } catch (err) {
      console.error('Error submitting feedback:', err);
      return false;
    }
  }, [user]);

  return {
    uploadContribution,
    submitFeedback,
  };
};
