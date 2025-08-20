-- =========================================================
-- Optional: Add dedicated table for chukker scores
-- This improves performance for displaying chukker-by-chukker scores
-- =========================================================

-- Create chukker_scores table for efficient score tracking
CREATE TABLE IF NOT EXISTS public.chukker_scores (
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  chukker smallint NOT NULL CHECK (chukker BETWEEN 1 AND 8),
  home_score integer NOT NULL DEFAULT 0 CHECK (home_score >= 0),
  away_score integer NOT NULL DEFAULT 0 CHECK (away_score >= 0),
  home_goals_in_chukker integer NOT NULL DEFAULT 0 CHECK (home_goals_in_chukker >= 0),
  away_goals_in_chukker integer NOT NULL DEFAULT 0 CHECK (away_goals_in_chukker >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (match_id, chukker)
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_chukker_scores_match 
  ON public.chukker_scores(match_id);

-- Enable RLS
ALTER TABLE public.chukker_scores ENABLE ROW LEVEL SECURITY;

-- Public can view chukker scores
CREATE POLICY "Public can view chukker_scores" 
  ON public.chukker_scores FOR SELECT 
  USING (true);

-- Admins can manage chukker scores
CREATE POLICY "Admins manage chukker_scores"
  ON public.chukker_scores FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Add to realtime publication
DO $$ 
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.chukker_scores';
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore if already added
END $$;

-- Function to automatically update chukker scores when goals are added
CREATE OR REPLACE FUNCTION public.update_chukker_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_home_team_id uuid;
  v_away_team_id uuid;
  v_home_goals integer;
  v_away_goals integer;
  v_cumulative_home integer := 0;
  v_cumulative_away integer := 0;
  v_chukker integer;
BEGIN
  -- Only process goal events
  IF NEW.event_type NOT IN ('goal', 'penalty_goal', 'own_goal') THEN
    RETURN NEW;
  END IF;

  -- Get match teams
  SELECT home_team_id, away_team_id 
  INTO v_home_team_id, v_away_team_id
  FROM public.matches 
  WHERE id = NEW.match_id;

  -- Calculate scores for all chukkers up to current
  FOR v_chukker IN 1..NEW.chukker LOOP
    -- Count goals in this chukker
    SELECT 
      COUNT(*) FILTER (WHERE team_id = v_home_team_id),
      COUNT(*) FILTER (WHERE team_id = v_away_team_id)
    INTO v_home_goals, v_away_goals
    FROM public.match_events
    WHERE match_id = NEW.match_id
      AND chukker = v_chukker
      AND event_type IN ('goal', 'penalty_goal')
      AND (event_type != 'own_goal' OR team_id != NEW.team_id);

    -- Add own goals (count for opposing team)
    SELECT 
      v_home_goals + COUNT(*) FILTER (WHERE team_id = v_away_team_id),
      v_away_goals + COUNT(*) FILTER (WHERE team_id = v_home_team_id)
    INTO v_home_goals, v_away_goals
    FROM public.match_events
    WHERE match_id = NEW.match_id
      AND chukker = v_chukker
      AND event_type = 'own_goal';

    -- Update cumulative scores
    v_cumulative_home := v_cumulative_home + v_home_goals;
    v_cumulative_away := v_cumulative_away + v_away_goals;

    -- Upsert chukker score
    INSERT INTO public.chukker_scores (
      match_id, chukker, 
      home_score, away_score,
      home_goals_in_chukker, away_goals_in_chukker
    ) VALUES (
      NEW.match_id, v_chukker,
      v_cumulative_home, v_cumulative_away,
      v_home_goals, v_away_goals
    )
    ON CONFLICT (match_id, chukker) 
    DO UPDATE SET
      home_score = EXCLUDED.home_score,
      away_score = EXCLUDED.away_score,
      home_goals_in_chukker = EXCLUDED.home_goals_in_chukker,
      away_goals_in_chukker = EXCLUDED.away_goals_in_chukker;
  END LOOP;

  -- Update match total scores
  UPDATE public.matches
  SET 
    home_score = v_cumulative_home,
    away_score = v_cumulative_away,
    current_chukker = NEW.chukker
  WHERE id = NEW.match_id;

  RETURN NEW;
END;
$$;

-- Create trigger for automatic updates
CREATE TRIGGER trg_update_chukker_scores
  AFTER INSERT OR UPDATE ON public.match_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chukker_scores();

-- Populate chukker scores for existing matches (if any)
INSERT INTO public.chukker_scores (
  match_id, chukker, 
  home_score, away_score,
  home_goals_in_chukker, away_goals_in_chukker
)
SELECT 
  m.id as match_id,
  cs.chukker,
  cs.cumulative_home_score,
  cs.cumulative_away_score,
  cs.home_goals_in_chukker,
  cs.away_goals_in_chukker
FROM public.matches m
CROSS JOIN LATERAL (
  SELECT 
    chukker,
    SUM(CASE 
      WHEN me.team_id = m.home_team_id AND me.event_type IN ('goal', 'penalty_goal') THEN 1
      WHEN me.team_id = m.away_team_id AND me.event_type = 'own_goal' THEN 1
      ELSE 0
    END) OVER (ORDER BY chukker) as cumulative_home_score,
    SUM(CASE 
      WHEN me.team_id = m.away_team_id AND me.event_type IN ('goal', 'penalty_goal') THEN 1
      WHEN me.team_id = m.home_team_id AND me.event_type = 'own_goal' THEN 1
      ELSE 0
    END) OVER (ORDER BY chukker) as cumulative_away_score,
    SUM(CASE 
      WHEN me.team_id = m.home_team_id AND me.event_type IN ('goal', 'penalty_goal') THEN 1
      WHEN me.team_id = m.away_team_id AND me.event_type = 'own_goal' THEN 1
      ELSE 0
    END) as home_goals_in_chukker,
    SUM(CASE 
      WHEN me.team_id = m.away_team_id AND me.event_type IN ('goal', 'penalty_goal') THEN 1
      WHEN me.team_id = m.home_team_id AND me.event_type = 'own_goal' THEN 1
      ELSE 0
    END) as away_goals_in_chukker
  FROM public.match_events me
  WHERE me.match_id = m.id
    AND me.event_type IN ('goal', 'penalty_goal', 'own_goal')
  GROUP BY me.chukker
) cs
WHERE m.status = 'completed'
ON CONFLICT (match_id, chukker) DO NOTHING;
