
-- Create a competition_settings table for the timer
CREATE TABLE public.competition_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  end_time timestamp with time zone,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.competition_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings (needed for timer display)
CREATE POLICY "Anyone authenticated can view settings"
ON public.competition_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only admins can manage settings
CREATE POLICY "Admins can insert settings"
ON public.competition_settings
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update settings"
ON public.competition_settings
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete settings"
ON public.competition_settings
FOR DELETE
USING (is_admin());

-- Insert a default row
INSERT INTO public.competition_settings (is_active, end_time) VALUES (false, null);

-- Add trigger for updated_at
CREATE TRIGGER update_competition_settings_updated_at
BEFORE UPDATE ON public.competition_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live timer updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_settings;
