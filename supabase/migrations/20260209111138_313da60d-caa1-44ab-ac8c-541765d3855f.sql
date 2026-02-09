
-- Add certificate_id column to profiles
ALTER TABLE public.profiles ADD COLUMN certificate_id TEXT UNIQUE;

-- Create index for fast lookups on verification page
CREATE INDEX idx_profiles_certificate_id ON public.profiles(certificate_id);

-- Backfill existing profiles with certificate IDs
UPDATE public.profiles SET certificate_id = 'ITGCTF-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)) WHERE certificate_id IS NULL;

-- Make column NOT NULL after backfill
ALTER TABLE public.profiles ALTER COLUMN certificate_id SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN certificate_id SET DEFAULT 'ITGCTF-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
