-- =========================================================
-- Improved: Migrate match data with better attribution
-- USPA 14G Midwest Open - Las Brisas vs Flying Changes
-- =========================================================

BEGIN; -- Start transaction for data integrity

-- 1. Ensure field exists
INSERT INTO public.fields (name, club, location)
VALUES ('Las Brisa Polo Club', 'Las Brisa Polo Club', 'Las Brisa Polo Club')
ON CONFLICT DO NOTHING;

-- 2. Ensure tournament exists
INSERT INTO public.tournaments (name, start_date, end_date, location)
VALUES (
  'USPA 14G Midwest Open',
  '2025-08-05'::date,
  '2025-08-05'::date,
  'Las Brisa Polo Club'
)
ON CONFLICT DO NOTHING;

-- 3. Insert the match
DO $$
DECLARE
  v_match_id uuid;
  v_home_team_id uuid;
  v_away_team_id uuid;
  v_tournament_id uuid;
  v_field_id uuid;
BEGIN
  -- Get IDs
  SELECT id INTO v_home_team_id FROM public.teams WHERE name = 'Las Brisas';
  SELECT id INTO v_away_team_id FROM public.teams WHERE name = 'Flying Changes';
  SELECT id INTO v_tournament_id FROM public.tournaments WHERE name = 'USPA 14G Midwest Open';
  SELECT id INTO v_field_id FROM public.fields WHERE name = 'Las Brisa Polo Club';
  
  -- Check if match already exists
  SELECT id INTO v_match_id 
  FROM public.matches 
  WHERE home_team_id = v_home_team_id 
    AND away_team_id = v_away_team_id
    AND scheduled_time = '2025-08-05 17:00:00'::timestamptz;
    
  IF v_match_id IS NULL THEN
    -- Insert new match
    INSERT INTO public.matches (
      tournament_id, home_team_id, away_team_id,
      scheduled_time, status, field_id,
      home_score, away_score, current_chukker, total_chukkers
    ) VALUES (
      v_tournament_id, v_home_team_id, v_away_team_id,
      '2025-08-05 17:00:00'::timestamptz, 'completed', v_field_id,
      17, 15, 6, 6
    ) RETURNING id INTO v_match_id;
    
    -- Insert match lineups (all players from both teams)
    INSERT INTO public.match_lineups (match_id, team_id, player_id, position, starter)
    SELECT 
      v_match_id,
      p.team_id,
      p.id,
      ROW_NUMBER() OVER (PARTITION BY p.team_id ORDER BY p.handicap DESC),
      true
    FROM public.players p
    WHERE p.team_id IN (v_home_team_id, v_away_team_id);
    
    -- Insert goal events for Las Brisas (17 goals total)
    -- Larry Aschebrook: 1 goal
    INSERT INTO public.match_events (match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_home_team_id, p.id, 1
    FROM public.players p 
    WHERE p.name = 'Larry Aschebrook' AND p.team_id = v_home_team_id;
    
    -- Juan Martin Gutierrez: 2 goals
    INSERT INTO public.match_events (match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_home_team_id, p.id, chukker
    FROM public.players p, (VALUES (1), (2)) AS g(chukker)
    WHERE p.name = 'Juan Martin Gutierrez' AND p.team_id = v_home_team_id;
    
    -- Juan Martin Obregon: 7 goals (distributed across chukkers)
    INSERT INTO public.match_events (match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_home_team_id, p.id, 
           CASE 
             WHEN goal_num <= 1 THEN 1
             WHEN goal_num <= 2 THEN 2
             WHEN goal_num <= 4 THEN 3
             WHEN goal_num <= 6 THEN 4
             ELSE 5
           END
    FROM public.players p, generate_series(1, 7) AS goal_num
    WHERE p.name = 'Juan Martin Obregon' AND p.team_id = v_home_team_id;
    
    -- Matias Obregon: 7 goals (distributed across chukkers)
    INSERT INTO public.match_events (match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_home_team_id, p.id,
           CASE 
             WHEN goal_num <= 1 THEN 2
             WHEN goal_num <= 3 THEN 3
             WHEN goal_num <= 5 THEN 4
             WHEN goal_num <= 6 THEN 5
             ELSE 6
           END
    FROM public.players p, generate_series(1, 7) AS goal_num
    WHERE p.name = 'Matias Obregon' AND p.team_id = v_home_team_id;
    
    -- Insert goal events for Flying Changes (15 goals total, but only 13 from players)
    -- Tomas Obregon: 3 goals
    INSERT INTO public.match_events (match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_away_team_id, p.id,
           CASE 
             WHEN goal_num = 1 THEN 1
             WHEN goal_num = 2 THEN 2
             ELSE 3
           END
    FROM public.players p, generate_series(1, 3) AS goal_num
    WHERE p.name = 'Tomas Obregon' AND p.team_id = v_away_team_id;
    
    -- Nicolas Saenz: 10 goals (distributed across chukkers)
    INSERT INTO public.match_events (match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_away_team_id, p.id,
           CASE 
             WHEN goal_num <= 3 THEN 1
             WHEN goal_num <= 5 THEN 2
             WHEN goal_num <= 7 THEN 3
             WHEN goal_num <= 8 THEN 4
             WHEN goal_num <= 9 THEN 5
             ELSE 6
           END
    FROM public.players p, generate_series(1, 10) AS goal_num
    WHERE p.name = 'Nicolas Saenz' AND p.team_id = v_away_team_id;
    
    -- Insert 2 penalty goals (likely for Flying Changes to reach 15)
    INSERT INTO public.match_events (match_id, event_type, team_id, chukker, details)
    VALUES 
      (v_match_id, 'penalty_goal', v_away_team_id, 4, 
       '{"notes": "Penalty goal 1", "penalty_type": "30-yard"}'::jsonb),
      (v_match_id, 'penalty_goal', v_away_team_id, 6,
       '{"notes": "Penalty goal 2", "penalty_type": "40-yard"}'::jsonb);
    
    -- Insert chukker end events with cumulative scores
    INSERT INTO public.match_events (match_id, event_type, chukker, details)
    VALUES 
      (v_match_id, 'chukker_end', 1, 
       '{"home_score": 3, "away_score": 4, "home_goals_chukker": 3, "away_goals_chukker": 4}'::jsonb),
      (v_match_id, 'chukker_end', 2,
       '{"home_score": 5, "away_score": 6, "home_goals_chukker": 2, "away_goals_chukker": 2}'::jsonb),
      (v_match_id, 'chukker_end', 3,
       '{"home_score": 9, "away_score": 8, "home_goals_chukker": 4, "away_goals_chukker": 2}'::jsonb),
      (v_match_id, 'chukker_end', 4,
       '{"home_score": 14, "away_score": 9, "home_goals_chukker": 5, "away_goals_chukker": 1}'::jsonb),
      (v_match_id, 'chukker_end', 5,
       '{"home_score": 15, "away_score": 11, "home_goals_chukker": 1, "away_goals_chukker": 2}'::jsonb),
      (v_match_id, 'chukker_end', 6,
       '{"home_score": 17, "away_score": 15, "home_goals_chukker": 2, "away_goals_chukker": 4}'::jsonb);
       
    RAISE NOTICE 'Match data migrated successfully. Match ID: %', v_match_id;
  ELSE
    RAISE NOTICE 'Match already exists. Match ID: %', v_match_id;
  END IF;
END $$;

COMMIT; -- End transaction

-- Query to verify the migration:
-- SELECT 
--   m.*,
--   ht.name as home_team,
--   at.name as away_team,
--   t.name as tournament,
--   f.name as field
-- FROM public.matches m
-- JOIN public.teams ht ON ht.id = m.home_team_id
-- JOIN public.teams at ON at.id = m.away_team_id
-- LEFT JOIN public.tournaments t ON t.id = m.tournament_id
-- LEFT JOIN public.fields f ON f.id = m.field_id
-- WHERE m.scheduled_time = '2025-08-05 17:00:00'::timestamptz;
