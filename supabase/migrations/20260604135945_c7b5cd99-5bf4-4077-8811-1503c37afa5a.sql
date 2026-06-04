
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS players text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS players text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.teams ALTER COLUMN player1_name DROP NOT NULL;
ALTER TABLE public.teams ALTER COLUMN player2_name DROP NOT NULL;
ALTER TABLE public.teams ALTER COLUMN player3_name DROP NOT NULL;

UPDATE public.profiles SET players = ARRAY_REMOVE(ARRAY[player1_name, player2_name, player3_name], NULL) WHERE cardinality(players) = 0;
UPDATE public.teams SET players = ARRAY_REMOVE(ARRAY[player1_name, player2_name, player3_name], NULL) WHERE cardinality(players) = 0;
