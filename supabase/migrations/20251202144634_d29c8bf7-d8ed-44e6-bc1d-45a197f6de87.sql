-- Create consent_preferences table
CREATE TABLE public.consent_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  audio_collection_consent BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consent_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for consent_preferences
CREATE POLICY "Users can view own consent" ON public.consent_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent" ON public.consent_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consent" ON public.consent_preferences
FOR UPDATE USING (auth.uid() = user_id);

-- Create cry_contributions table
CREATE TABLE public.cry_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  audio_url TEXT NOT NULL,
  detected_cry_type TEXT,
  user_verified_type TEXT,
  is_correct BOOLEAN,
  baby_age_months INTEGER,
  duration_seconds NUMERIC,
  confidence NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.cry_contributions ENABLE ROW LEVEL SECURITY;

-- RLS policies for cry_contributions
CREATE POLICY "Users can view own contributions" ON public.cry_contributions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contributions" ON public.cry_contributions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all contributions" ON public.cry_contributions
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contributions" ON public.cry_contributions
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for contributions
INSERT INTO storage.buckets (id, name, public) VALUES ('cry-contributions', 'cry-contributions', false);

-- Storage policies for cry-contributions bucket
CREATE POLICY "Users can upload own contributions" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'cry-contributions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own contribution files" ON storage.objects
FOR SELECT USING (bucket_id = 'cry-contributions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all contribution files" ON storage.objects
FOR SELECT USING (bucket_id = 'cry-contributions' AND public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_consent_preferences_updated_at
BEFORE UPDATE ON public.consent_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();