-- Update the can_detect_cry function to limit free users to 5 detections per day
CREATE OR REPLACE FUNCTION public.can_detect_cry(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_plan TEXT;
  daily_count INTEGER;
BEGIN
  -- Get user's plan
  SELECT plan_type INTO user_plan
  FROM public.subscriptions
  WHERE user_id = _user_id
  AND status = 'active';
  
  -- If no subscription found, default to free
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;
  
  -- Premium and lifetime users have unlimited access
  IF user_plan IN ('premium_monthly', 'lifetime') THEN
    RETURN TRUE;
  END IF;
  
  -- Free users limited to 5 per day
  daily_count := public.get_daily_detection_count(_user_id);
  RETURN daily_count < 5;
END;
$function$;