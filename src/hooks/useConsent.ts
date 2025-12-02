import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ConsentState {
  hasConsent: boolean;
  isLoading: boolean;
  consentDate: string | null;
}

export const useConsent = () => {
  const { user } = useAuth();
  const [state, setState] = useState<ConsentState>({
    hasConsent: false,
    isLoading: true,
    consentDate: null,
  });

  const fetchConsent = useCallback(async () => {
    if (!user) {
      setState({ hasConsent: false, isLoading: false, consentDate: null });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('consent_preferences')
        .select('audio_collection_consent, consent_date')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching consent:', error);
      }

      setState({
        hasConsent: data?.audio_collection_consent ?? false,
        isLoading: false,
        consentDate: data?.consent_date ?? null,
      });
    } catch (err) {
      console.error('Consent fetch error:', err);
      setState({ hasConsent: false, isLoading: false, consentDate: null });
    }
  }, [user]);

  useEffect(() => {
    fetchConsent();
  }, [fetchConsent]);

  const setConsent = useCallback(async (consent: boolean) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('consent_preferences')
        .upsert({
          user_id: user.id,
          audio_collection_consent: consent,
          consent_date: consent ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        hasConsent: consent,
        consentDate: consent ? new Date().toISOString() : null,
      }));

      return true;
    } catch (err) {
      console.error('Error setting consent:', err);
      return false;
    }
  }, [user]);

  return {
    ...state,
    setConsent,
    refreshConsent: fetchConsent,
  };
};
