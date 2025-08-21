-- =========================================================
-- Seed Additional Historical Matches - USPA 14G Midwest Open
-- Matches on 2025-08-10, 2025-08-12, 2025-08-14, 2025-08-16
-- Safe to run once as a migration; uses guards to avoid duplicates
-- =========================================================

BEGIN;

-- Ensure fields (venues)
INSERT INTO public.fields (name, club, location)
VALUES ('Las Brisa Polo Club', 'Las Brisa Polo Club', 'Las Brisa Polo Club')
ON CONFLICT DO NOTHING;

INSERT INTO public.fields (name, club, location)
VALUES ('Passion For Polo', 'Passion For Polo', 'Passion For Polo')
ON CONFLICT DO NOTHING;

-- Ensure tournament
INSERT INTO public.tournaments (name, start_date, end_date, location)
VALUES (
  'USPA 14G Midwest Open',
  '2025-08-05'::date,
  '2025-08-05'::date,
  'Las Brisa Polo Club'
)
ON CONFLICT DO NOTHING;

-- Ensure teams
INSERT INTO public.teams (name) VALUES
  ('Passion For Polo'),
  ('CD Peacock'),
  ('Beaver Creek'),
  ('Flying Changes'),
  ('Las Brisas')
ON CONFLICT DO NOTHING;

-- Ensure players and link to teams when missing team_id

-- Passion For Polo players
DO $$
DECLARE v_team uuid;
BEGIN
  SELECT id INTO v_team FROM public.teams WHERE name = 'Passion For Polo';
  IF v_team IS NULL THEN RAISE EXCEPTION 'Team not found: Passion For Polo'; END IF;

  INSERT INTO public.players(name, team_id) SELECT 'Michael Romero', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Michael Romero');
  INSERT INTO public.players(name, team_id) SELECT 'Matias Gonzalez', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Matias Gonzalez');
  INSERT INTO public.players(name, team_id) SELECT 'Anthony Garcia', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Anthony Garcia');
  INSERT INTO public.players(name, team_id) SELECT 'Mariano Obregon', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Mariano Obregon');

  UPDATE public.players SET team_id = v_team WHERE name='Michael Romero' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Matias Gonzalez' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Anthony Garcia' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Mariano Obregon' AND team_id IS NULL;
END $$;

-- CD Peacock players
DO $$
DECLARE v_team uuid;
BEGIN
  SELECT id INTO v_team FROM public.teams WHERE name = 'CD Peacock';
  IF v_team IS NULL THEN RAISE EXCEPTION 'Team not found: CD Peacock'; END IF;

  INSERT INTO public.players(name, team_id) SELECT 'Vance Miller', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Vance Miller');
  INSERT INTO public.players(name, team_id) SELECT 'Thomas Rubenacker', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Thomas Rubenacker');
  INSERT INTO public.players(name, team_id) SELECT 'Jack Kiely', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Jack Kiely');
  INSERT INTO public.players(name, team_id) SELECT 'Vaughn Miller Jr.', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Vaughn Miller Jr.');

  UPDATE public.players SET team_id = v_team WHERE name='Vance Miller' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Thomas Rubenacker' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Jack Kiely' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Vaughn Miller Jr.' AND team_id IS NULL;
END $$;

-- Beaver Creek players
DO $$
DECLARE v_team uuid;
BEGIN
  SELECT id INTO v_team FROM public.teams WHERE name = 'Beaver Creek';
  IF v_team IS NULL THEN RAISE EXCEPTION 'Team not found: Beaver Creek'; END IF;

  INSERT INTO public.players(name, team_id) SELECT 'Chris Vangel', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Chris Vangel');
  INSERT INTO public.players(name, team_id) SELECT 'Will Mudra', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Will Mudra');
  INSERT INTO public.players(name, team_id) SELECT 'Bautista Bayugar', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Bautista Bayugar');
  INSERT INTO public.players(name, team_id) SELECT 'Lindor Novillo Corvalan', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Lindor Novillo Corvalan');

  UPDATE public.players SET team_id = v_team WHERE name='Chris Vangel' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Will Mudra' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Bautista Bayugar' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Lindor Novillo Corvalan' AND team_id IS NULL;
END $$;

-- Flying Changes players
DO $$
DECLARE v_team uuid;
BEGIN
  SELECT id INTO v_team FROM public.teams WHERE name = 'Flying Changes';
  IF v_team IS NULL THEN RAISE EXCEPTION 'Team not found: Flying Changes'; END IF;

  INSERT INTO public.players(name, team_id) SELECT 'Sawyer Leffingwell', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Sawyer Leffingwell');
  INSERT INTO public.players(name, team_id) SELECT 'Tomas Obregon', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Tomas Obregon');
  INSERT INTO public.players(name, team_id) SELECT 'Nicolas Saenz', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Nicolas Saenz');
  INSERT INTO public.players(name, team_id) SELECT 'Mariano Gutierrez', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Mariano Gutierrez');

  UPDATE public.players SET team_id = v_team WHERE name='Sawyer Leffingwell' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Tomas Obregon' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Nicolas Saenz' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Mariano Gutierrez' AND team_id IS NULL;
END $$;

-- Las Brisas players
DO $$
DECLARE v_team uuid;
BEGIN
  SELECT id INTO v_team FROM public.teams WHERE name = 'Las Brisas';
  IF v_team IS NULL THEN RAISE EXCEPTION 'Team not found: Las Brisas'; END IF;

  INSERT INTO public.players(name, team_id) SELECT 'Larry Aschebrook', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Larry Aschebrook');
  INSERT INTO public.players(name, team_id) SELECT 'Juan Martin Gutierrez', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Juan Martin Gutierrez');
  INSERT INTO public.players(name, team_id) SELECT 'Juan Martin Obregon', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Juan Martin Obregon');
  INSERT INTO public.players(name, team_id) SELECT 'Matias Obregon', v_team
    WHERE NOT EXISTS (SELECT 1 FROM public.players WHERE name='Matias Obregon');

  UPDATE public.players SET team_id = v_team WHERE name='Larry Aschebrook' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Juan Martin Gutierrez' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Juan Martin Obregon' AND team_id IS NULL;
  UPDATE public.players SET team_id = v_team WHERE name='Matias Obregon' AND team_id IS NULL;
END $$;

-- Helper sanity: ensure we can read tournament/fields
DO $$
DECLARE v_field_las_brisa uuid; v_field_pfp uuid; v_tournament uuid;
BEGIN
  SELECT id INTO v_field_las_brisa FROM public.fields WHERE name='Las Brisa Polo Club';
  SELECT id INTO v_field_pfp FROM public.fields WHERE name='Passion For Polo';
  SELECT id INTO v_tournament FROM public.tournaments WHERE name='USPA 14G Midwest Open';
  IF v_field_las_brisa IS NULL OR v_field_pfp IS NULL OR v_tournament IS NULL THEN
    RAISE EXCEPTION 'Missing prerequisite data (fields/tournament)';
  END IF;
END $$;

-- =========================================================
-- Match 1: 2025-08-10 11:00 - Passion For Polo (11) vs Flying Changes (10)
-- Venue: Passion For Polo
-- Chukker cumulatives: (1)1:2 (2)3:3 (3)5:5 (4)6:5 (5)10:8 (6)11:10
-- Home player goals: 1/5/1/4 = 11; Away player goals: 0/1/4/2 = 7 + 3 penalties
-- =========================================================
DO $$
DECLARE
  v_match_id uuid;
  v_home_team_id uuid;
  v_away_team_id uuid;
  v_field_id uuid;
  v_tournament_id uuid;
BEGIN
  SELECT id INTO v_home_team_id FROM public.teams WHERE name = 'Passion For Polo';
  SELECT id INTO v_away_team_id FROM public.teams WHERE name = 'Flying Changes';
  SELECT id INTO v_field_id FROM public.fields WHERE name = 'Passion For Polo';
  SELECT id INTO v_tournament_id FROM public.tournaments WHERE name = 'USPA 14G Midwest Open';

  SELECT id INTO v_match_id
  FROM public.matches
  WHERE home_team_id = v_home_team_id
    AND away_team_id = v_away_team_id
    AND scheduled_time = '2025-08-10 11:00:00'::timestamptz;

  IF v_match_id IS NULL THEN
    INSERT INTO public.matches (
      tournament_id, home_team_id, away_team_id, scheduled_time, status, field_id,
      home_score, away_score, current_chukker, total_chukkers
    ) VALUES (
      v_tournament_id, v_home_team_id, v_away_team_id, '2025-08-10 11:00:00'::timestamptz,
      'completed', v_field_id, 11, 10, 6, 6
    ) RETURNING id INTO v_match_id;

    -- lineups
    INSERT INTO public.match_lineups(match_id, team_id, player_id, position, starter)
    SELECT v_match_id, v_home_team_id, p.id, ROW_NUMBER() OVER (ORDER BY p.name), true
    FROM public.players p
    WHERE p.team_id = v_home_team_id
      AND p.name IN ('Michael Romero','Matias Gonzalez','Anthony Garcia','Mariano Obregon');

    INSERT INTO public.match_lineups(match_id, team_id, player_id, position, starter)
    SELECT v_match_id, v_away_team_id, p.id, ROW_NUMBER() OVER (ORDER BY p.name), true
    FROM public.players p
    WHERE p.team_id = v_away_team_id
      AND p.name IN ('Sawyer Leffingwell','Tomas Obregon','Nicolas Saenz','Mariano Gutierrez');

    -- home increments [1,2,2,1,4,1]
    WITH home_players AS (
      SELECT p.id AS player_id, g.goals
      FROM public.players p
      JOIN (VALUES
        ('Michael Romero', 1),
        ('Matias Gonzalez', 5),
        ('Anthony Garcia', 1),
        ('Mariano Obregon', 4)
      ) AS g(name, goals) ON g.name = p.name AND p.team_id = v_home_team_id
    ),
    home_goal_rows AS (
      SELECT player_id, ROW_NUMBER() OVER () AS rn
      FROM home_players hp, LATERAL generate_series(1, hp.goals)
    ),
    home_chukker_rows AS (
      SELECT chukker, ROW_NUMBER() OVER () AS rn
      FROM (VALUES (1,1),(2,2),(3,2),(4,1),(5,4),(6,1)) v(chukker, num)
      CROSS JOIN LATERAL generate_series(1, v.num)
    )
    INSERT INTO public.match_events(match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_home_team_id, hgr.player_id, hcr.chukker
    FROM home_goal_rows hgr JOIN home_chukker_rows hcr USING (rn);

    -- away increments [2,1,2,0,3,2] with 3 penalties
    WITH away_players AS (
      SELECT p.id AS player_id, g.goals
      FROM public.players p
      JOIN (VALUES
        ('Sawyer Leffingwell', 0),
        ('Tomas Obregon', 1),
        ('Nicolas Saenz', 4),
        ('Mariano Gutierrez', 2)
      ) AS g(name, goals) ON g.name = p.name AND p.team_id = v_away_team_id
    ),
    away_goal_rows AS (
      SELECT player_id, ROW_NUMBER() OVER () AS rn
      FROM away_players ap, LATERAL generate_series(1, ap.goals)
    ),
    away_chukker_rows AS (
      SELECT chukker, ROW_NUMBER() OVER () AS rn
      FROM (VALUES (1,2),(2,1),(3,2),(4,0),(5,3),(6,2)) v(chukker, num)
      CROSS JOIN LATERAL generate_series(1, v.num)
    )
    INSERT INTO public.match_events(match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_away_team_id, agr.player_id, acr.chukker
    FROM away_goal_rows agr
    JOIN away_chukker_rows acr ON acr.rn = agr.rn;

    -- penalties: 3 for away
    WITH away_chukker_rows AS (
      SELECT chukker, ROW_NUMBER() OVER () AS rn
      FROM (VALUES (1,2),(2,1),(3,2),(4,0),(5,3),(6,2)) v(chukker, num)
      CROSS JOIN LATERAL generate_series(1, v.num)
    )
    INSERT INTO public.match_events(match_id, event_type, team_id, chukker, details)
    SELECT v_match_id, 'penalty_goal', v_away_team_id, acr.chukker,
           '{"penalty_type":"Penalty 1"}'::jsonb
    FROM away_chukker_rows acr
    WHERE acr.rn > (
      SELECT COUNT(*) FROM public.match_events me
      WHERE me.match_id = v_match_id AND me.team_id = v_away_team_id
    )
    LIMIT 3;

    -- chukker_end
    INSERT INTO public.match_events (match_id, event_type, chukker, details) VALUES
      (v_match_id,'chukker_end',1,'{"home_score":1,"away_score":2}'::jsonb),
      (v_match_id,'chukker_end',2,'{"home_score":3,"away_score":3}'::jsonb),
      (v_match_id,'chukker_end',3,'{"home_score":5,"away_score":5}'::jsonb),
      (v_match_id,'chukker_end',4,'{"home_score":6,"away_score":5}'::jsonb),\
      (v_match_id,'chukker_end',5,'{"home_score":10,"away_score":8}'::jsonb),
      (v_match_id,'chukker_end',6,'{"home_score":11,"away_score":10}'::jsonb);

    RAISE NOTICE 'Inserted match: PFP vs Flying Changes (2025-08-10 11:00) id=%', v_match_id;
  END IF;
END $$;

-- =========================================================
-- Match 2: 2025-08-12 10:00 - CD Peacock (17) vs Beaver Creek (10)
-- Venue: Las Brisa Polo Club
-- Cumulatives: (1)4:3 (2)9:3 (3)11:5 (4)13:7 (5)17:9 (6)17:10
-- Home player goals: 2/1/7/4 = 14 + 3 penalties; Away player goals: 0/1/5/4 = 10
-- =========================================================
DO $$
DECLARE
  v_match_id uuid;
  v_home_team_id uuid;
  v_away_team_id uuid;
  v_field_id uuid;
  v_tournament_id uuid;
BEGIN
  SELECT id INTO v_home_team_id FROM public.teams WHERE name = 'CD Peacock';
  SELECT id INTO v_away_team_id FROM public.teams WHERE name = 'Beaver Creek';
  SELECT id INTO v_field_id FROM public.fields WHERE name = 'Las Brisa Polo Club';
  SELECT id INTO v_tournament_id FROM public.tournaments WHERE name = 'USPA 14G Midwest Open';

  SELECT id INTO v_match_id
  FROM public.matches
  WHERE home_team_id = v_home_team_id
    AND away_team_id = v_away_team_id
    AND scheduled_time = '2025-08-12 10:00:00'::timestamptz;

  IF v_match_id IS NULL THEN
    INSERT INTO public.matches (
      tournament_id, home_team_id, away_team_id, scheduled_time, status, field_id,
      home_score, away_score, current_chukker, total_chukkers
    ) VALUES (
      v_tournament_id, v_home_team_id, v_away_team_id, '2025-08-12 10:00:00'::timestamptz,
      'completed', v_field_id, 17, 10, 6, 6
    ) RETURNING id INTO v_match_id;

    -- lineups
    INSERT INTO public.match_lineups(match_id, team_id, player_id, position, starter)
    SELECT v_match_id, v_home_team_id, p.id, ROW_NUMBER() OVER (ORDER BY p.name), true
    FROM public.players p
    WHERE p.team_id = v_home_team_id
      AND p.name IN ('Vance Miller','Thomas Rubenacker','Jack Kiely','Vaughn Miller Jr.');

    INSERT INTO public.match_lineups(match_id, team_id, player_id, position, starter)
    SELECT v_match_id, v_away_team_id, p.id, ROW_NUMBER() OVER (ORDER BY p.name), true
    FROM public.players p
    WHERE p.team_id = v_away_team_id
      AND p.name IN ('Chris Vangel','Will Mudra','Bautista Bayugar','Lindor Novillo Corvalan');

    -- home increments [4,5,2,2,4,0] with 3 penalties
    WITH home_players AS (
      SELECT p.id AS player_id, g.goals
      FROM public.players p
      JOIN (VALUES
        ('Vance Miller', 2),
        ('Thomas Rubenacker', 1),
        ('Jack Kiely', 7),
        ('Vaughn Miller Jr.', 4)
      ) AS g(name, goals) ON g.name = p.name AND p.team_id = v_home_team_id
    ),
    home_goal_rows AS (
      SELECT player_id, ROW_NUMBER() OVER () AS rn
      FROM home_players hp, LATERAL generate_series(1, hp.goals)
    ),
    home_chukker_rows AS (
      SELECT chukker, ROW_NUMBER() OVER () AS rn
      FROM (VALUES (1,4),(2,5),(3,2),(4,2),(5,4),(6,0)) v(chukker, num)
      CROSS JOIN LATERAL generate_series(1, v.num)
    )
    INSERT INTO public.match_events(match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_home_team_id, hgr.player_id, hcr.chukker
    FROM home_goal_rows hgr JOIN home_chukker_rows hcr USING (rn);

    -- penalties: 3 for home
    WITH home_chukker_rows AS (
      SELECT chukker, ROW_NUMBER() OVER () AS rn
      FROM (VALUES (1,4),(2,5),(3,2),(4,2),(5,4),(6,0)) v(chukker, num)
      CROSS JOIN LATERAL generate_series(1, v.num)
    )
    INSERT INTO public.match_events(match_id, event_type, team_id, chukker, details)
    SELECT v_match_id, 'penalty_goal', v_home_team_id, hcr.chukker,
           '{"penalty_type":"Penalty 1"}'::jsonb
    FROM home_chukker_rows hcr
    WHERE hcr.rn > (
      SELECT COUNT(*) FROM public.match_events me
      WHERE me.match_id = v_match_id AND me.team_id = v_home_team_id
    )
    LIMIT 3;

    -- away increments [3,0,2,2,2,1]
    WITH away_players AS (
      SELECT p.id AS player_id, g.goals
      FROM public.players p
      JOIN (VALUES
        ('Chris Vangel', 0),
        ('Will Mudra', 1),
        ('Bautista Bayugar', 5),
        ('Lindor Novillo Corvalan', 4)
      ) AS g(name, goals) ON g.name = p.name AND p.team_id = v_away_team_id
    ),
    away_goal_rows AS (
      SELECT player_id, ROW_NUMBER() OVER () AS rn
      FROM away_players ap, LATERAL generate_series(1, ap.goals)
    ),
    away_chukker_rows AS (
      SELECT chukker, ROW_NUMBER() OVER () AS rn
      FROM (VALUES (1,3),(2,0),(3,2),(4,2),(5,2),(6,1)) v(chukker, num)
      CROSS JOIN LATERAL generate_series(1, v.num)
    )
    INSERT INTO public.match_events(match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_away_team_id, agr.player_id, acr.chukker
    FROM away_goal_rows agr JOIN away_chukker_rows acr USING (rn);

    -- chukker_end
    INSERT INTO public.match_events (match_id, event_type, chukker, details) VALUES
      (v_match_id,'chukker_end',1,'{"home_score":4,"away_score":3}'::jsonb),
      (v_match_id,'chukker_end',2,'{"home_score":9,"away_score":3}'::jsonb),
      (v_match_id,'chukker_end',3,'{"home_score":11,"away_score":5}'::jsonb),
      (v_match_id,'chukker_end',4,'{"home_score":13,"away_score":7}'::jsonb),
      (v_match_id,'chukker_end',5,'{"home_score":17,"away_score":9}'::jsonb),
      (v_match_id,'chukker_end',6,'{"home_score":17,"away_score":10}'::jsonb);

    RAISE NOTICE 'Inserted match: CD Peacock vs Beaver Creek (2025-08-12 10:00) id=%', v_match_id;
  END IF;
END $$;

-- =========================================================
-- Match 3: 2025-08-14 10:00 - CD Peacock (7) vs Flying Changes (9)
-- Venue: Las Brisa Polo Club
-- Cumulatives: (1)2:3 (2)2:4 (3)3:4 (4)3:5 (5)6:6 (6)7:9
-- Home players: 0/2/3/1 + 1 penalty; Away players: 0/1/6/2
-- =========================================================
DO $$
DECLARE
  v_match_id uuid;
  v_home_team_id uuid;
  v_away_team_id uuid;
  v_field_id uuid;
  v_tournament_id uuid;
BEGIN
  SELECT id INTO v_home_team_id FROM public.teams WHERE name = 'CD Peacock';
  SELECT id INTO v_away_team_id FROM public.teams WHERE name = 'Flying Changes';
  SELECT id INTO v_field_id FROM public.fields WHERE name = 'Las Brisa Polo Club';
  SELECT id INTO v_tournament_id FROM public.tournaments WHERE name = 'USPA 14G Midwest Open';

  SELECT id INTO v_match_id
  FROM public.matches
  WHERE home_team_id = v_home_team_id
    AND away_team_id = v_away_team_id
    AND scheduled_time = '2025-08-14 10:00:00'::timestamptz;

  IF v_match_id IS NULL THEN
    INSERT INTO public.matches (
      tournament_id, home_team_id, away_team_id, scheduled_time, status, field_id,
      home_score, away_score, current_chukker, total_chukkers
    ) VALUES (
      v_tournament_id, v_home_team_id, v_away_team_id, '2025-08-14 10:00:00'::timestamptz,
      'completed', v_field_id, 7, 9, 6, 6
    ) RETURNING id INTO v_match_id;

    -- lineups
    INSERT INTO public.match_lineups(match_id, team_id, player_id, position, starter)
    SELECT v_match_id, v_home_team_id, p.id, ROW_NUMBER() OVER (ORDER BY p.name), true
    FROM public.players p
    WHERE p.team_id = v_home_team_id
      AND p.name IN ('Vance Miller','Thomas Rubenacker','Jack Kiely','Vaughn Miller Jr.');

    INSERT INTO public.match_lineups(match_id, team_id, player_id, position, starter)
    SELECT v_match_id, v_away_team_id, p.id, ROW_NUMBER() OVER (ORDER BY p.name), true
    FROM public.players p
    WHERE p.team_id = v_away_team_id
      AND p.name IN ('Sawyer Leffingwell','Tomas Obregon','Nicolas Saenz','Mariano Gutierrez');

    -- home increments [2,0,1,0,3,1] with 1 penalty
    WITH home_players AS (
      SELECT p.id AS player_id, g.goals
      FROM public.players p
      JOIN (VALUES
        ('Vance Miller', 0),
        ('Thomas Rubenacker', 2),
        ('Jack Kiely', 3),
        ('Vaughn Miller Jr.', 1)
      ) AS g(name, goals) ON g.name = p.name AND p.team_id = v_home_team_id
    ),
    home_goal_rows AS (
      SELECT player_id, ROW_NUMBER() OVER () AS rn
      FROM home_players hp, LATERAL generate_series(1, hp.goals)
    ),
    home_chukker_rows AS (
      SELECT chukker, ROW_NUMBER() OVER () AS rn
      FROM (VALUES (1,2),(2,0),(3,1),(4,0),(5,3),(6,1)) v(chukker, num)
      CROSS JOIN LATERAL generate_series(1, v.num)
    )
    INSERT INTO public.match_events(match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_home_team_id, hgr.player_id, hcr.chukker
    FROM home_goal_rows hgr JOIN home_chukker_rows hcr USING (rn);

    -- penalty 1 for home
    WITH home_chukker_rows AS (
      SELECT chukker, ROW_NUMBER() OVER () AS rn
      FROM (VALUES (1,2),(2,0),(3,1),(4,0),(5,3),(6,1)) v(chukker, num)
      CROSS JOIN LATERAL generate_series(1, v.num)
    )
    INSERT INTO public.match_events(match_id, event_type, team_id, chukker, details)
    SELECT v_match_id, 'penalty_goal', v_home_team_id, hcr.chukker,
           '{"penalty_type":"Penalty 1"}'::jsonb
    FROM home_chukker_rows hcr
    WHERE hcr.rn > (
      SELECT COUNT(*) FROM public.match_events me
      WHERE me.match_id = v_match_id AND me.team_id = v_home_team_id
    )
    LIMIT 1;

    -- away increments [3,1,0,1,1,3]
    WITH away_players AS (
      SELECT p.id AS player_id, g.goals
      FROM public.players p
      JOIN (VALUES
        ('Sawyer Leffingwell', 0),
        ('Tomas Obregon', 1),
        ('Nicolas Saenz', 6),
        ('Mariano Gutierrez', 2)
      ) AS g(name, goals) ON g.name = p.name AND p.team_id = v_away_team_id
    ),
    away_goal_rows AS (
      SELECT player_id, ROW_NUMBER() OVER () AS rn
      FROM away_players ap, LATERAL generate_series(1, ap.goals)
    ),
    away_chukker_rows AS (
      SELECT chukker, ROW_NUMBER() OVER () AS rn
      FROM (VALUES (1,3),(2,1),(3,0),(4,1),(5,1),(6,3)) v(chukker, num)
      CROSS JOIN LATERAL generate_series(1, v.num)
    )
    INSERT INTO public.match_events(match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_away_team_id, agr.player_id, acr.chukker
    FROM away_goal_rows agr JOIN away_chukker_rows acr USING (rn);

    -- chukker_end
    INSERT INTO public.match_events (match_id, event_type, chukker, details) VALUES
      (v_match_id,'chukker_end',1,'{"home_score":2,"away_score":3}'::jsonb),
      (v_match_id,'chukker_end',2,'{"home_score":2,"away_score":4}'::jsonb),
      (v_match_id,'chukker_end',3,'{"home_score":3,"away_score":4}'::jsonb),
      (v_match_id,'chukker_end',4,'{"home_score":3,"away_score":5}'::jsonb),
      (v_match_id,'chukker_end',5,'{"home_score":6,"away_score":6}'::jsonb),
      (v_match_id,'chukker_end',6,'{"home_score":7,"away_score":9}'::jsonb);

    RAISE NOTICE 'Inserted match: CD Peacock vs Flying Changes (2025-08-14 10:00) id=%', v_match_id;
  END IF;
END $$;

-- =========================================================
-- Match 4: 2025-08-14 17:00 - Passion For Polo (9) vs Las Brisas (8)
-- Venue: Passion For Polo
-- Cumulatives: (1)2:2 (2)3:2 (3)5:5 (4)7:6 (5)8:7 (6)9:8
-- Home players: 0/3/2/4; Away players: 0/0/5/3
-- =========================================================
DO $$
DECLARE
  v_match_id uuid;
  v_home_team_id uuid;
  v_away_team_id uuid;
  v_field_id uuid;
  v_tournament_id uuid;
BEGIN
  SELECT id INTO v_home_team_id FROM public.teams WHERE name = 'Passion For Polo';
  SELECT id INTO v_away_team_id FROM public.teams WHERE name = 'Las Brisas';
  SELECT id INTO v_field_id FROM public.fields WHERE name = 'Passion For Polo';
  SELECT id INTO v_tournament_id FROM public.tournaments WHERE name = 'USPA 14G Midwest Open';

  SELECT id INTO v_match_id
  FROM public.matches
  WHERE home_team_id = v_home_team_id
    AND away_team_id = v_away_team_id
    AND scheduled_time = '2025-08-14 17:00:00'::timestamptz;

  IF v_match_id IS NULL THEN
    INSERT INTO public.matches (
      tournament_id, home_team_id, away_team_id, scheduled_time, status, field_id,
      home_score, away_score, current_chukker, total_chukkers
    ) VALUES (
      v_tournament_id, v_home_team_id, v_away_team_id, '2025-08-14 17:00:00'::timestamptz,
      'completed', v_field_id, 9, 8, 6, 6
    ) RETURNING id INTO v_match_id;

    -- lineups
    INSERT INTO public.match_lineups(match_id, team_id, player_id, position, starter)
    SELECT v_match_id, v_home_team_id, p.id, ROW_NUMBER() OVER (ORDER BY p.name), true
    FROM public.players p
    WHERE p.team_id = v_home_team_id
      AND p.name IN ('Michael Romero','Matias Gonzalez','Anthony Garcia','Mariano Obregon');

    INSERT INTO public.match_lineups(match_id, team_id, player_id, position, starter)
    SELECT v_match_id, v_away_team_id, p.id, ROW_NUMBER() OVER (ORDER BY p.name), true
    FROM public.players p
    WHERE p.team_id = v_away_team_id
      AND p.name IN ('Larry Aschebrook','Juan Martin Gutierrez','Juan Martin Obregon','Matias Obregon');

    -- home increments [2,1,2,2,1,1]
    WITH home_players AS (
      SELECT p.id AS player_id, g.goals
      FROM public.players p
      JOIN (VALUES
        ('Michael Romero', 0),
        ('Matias Gonzalez', 3),
        ('Anthony Garcia', 2),
        ('Mariano Obregon', 4)
      ) AS g(name, goals) ON g.name = p.name AND p.team_id = v_home_team_id
    ),
    home_goal_rows AS (
      SELECT player_id, ROW_NUMBER() OVER () AS rn
      FROM home_players hp, LATERAL generate_series(1, hp.goals)
    ),
    home_chukker_rows AS (
      SELECT chukker, ROW_NUMBER() OVER () AS rn
      FROM (VALUES (1,2),(2,1),(3,2),(4,2),(5,1),(6,1)) v(chukker, num)
      CROSS JOIN LATERAL generate_series(1, v.num)
    )
    INSERT INTO public.match_events(match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_home_team_id, hgr.player_id, hcr.chukker
    FROM home_goal_rows hgr JOIN home_chukker_rows hcr USING (rn);

    -- away increments [2,0,3,1,1,1]
    WITH away_players AS (
      SELECT p.id AS player_id, g.goals
      FROM public.players p
      JOIN (VALUES
        ('Larry Aschebrook', 0),
        ('Juan Martin Gutierrez', 0),
        ('Juan Martin Obregon', 5),
        ('Matias Obregon', 3)
      ) AS g(name, goals) ON g.name = p.name AND p.team_id = v_away_team_id
    ),
    away_goal_rows AS (
      SELECT player_id, ROW_NUMBER() OVER () AS rn
      FROM away_players ap, LATERAL generate_series(1, ap.goals)
    ),
    away_chukker_rows AS (
      SELECT chukker, ROW_NUMBER() OVER () AS rn
      FROM (VALUES (1,2),(2,0),(3,3),(4,1),(5,1),(6,1)) v(chukker, num)
      CROSS JOIN LATERAL generate_series(1, v.num)
    )
    INSERT INTO public.match_events(match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_away_team_id, agr.player_id, acr.chukker
    FROM away_goal_rows agr JOIN away_chukker_rows acr USING (rn);

    -- chukker_end
    INSERT INTO public.match_events (match_id, event_type, chukker, details) VALUES
      (v_match_id,'chukker_end',1,'{"home_score":2,"away_score":2}'::jsonb),
      (v_match_id,'chukker_end',2,'{"home_score":3,"away_score":2}'::jsonb),
      (v_match_id,'chukker_end',3,'{"home_score":5,"away_score":5}'::jsonb),
      (v_match_id,'chukker_end',4,'{"home_score":7,"away_score":6}'::jsonb),
      (v_match_id,'chukker_end',5,'{"home_score":8,"away_score":7}'::jsonb),
      (v_match_id,'chukker_end',6,'{"home_score":9,"away_score":8}'::jsonb);

    RAISE NOTICE 'Inserted match: PFP vs Las Brisas (2025-08-14 17:00) id=%', v_match_id;
  END IF;
END $$;

-- =========================================================
-- Match 5: 2025-08-16 10:00 - Beaver Creek (9) vs Passion For Polo (10)
-- Venue: Passion For Polo
-- Cumulatives: (1)0:2 (2)2:4 (3)2:5 (4)3:7 (5)7:8 (6)9:10
-- Home players: 7/1/0/1; Away players: 4/4/1/1
-- =========================================================
DO $$
DECLARE
  v_match_id uuid;
  v_home_team_id uuid;
  v_away_team_id uuid;
  v_field_id uuid;
  v_tournament_id uuid;
BEGIN
  SELECT id INTO v_home_team_id FROM public.teams WHERE name = 'Beaver Creek';
  SELECT id INTO v_away_team_id FROM public.teams WHERE name = 'Passion For Polo';
  SELECT id INTO v_field_id FROM public.fields WHERE name = 'Passion For Polo';
  SELECT id INTO v_tournament_id FROM public.tournaments WHERE name = 'USPA 14G Midwest Open';

  SELECT id INTO v_match_id
  FROM public.matches
  WHERE home_team_id = v_home_team_id
    AND away_team_id = v_away_team_id
    AND scheduled_time = '2025-08-16 10:00:00'::timestamptz;

  IF v_match_id IS NULL THEN
    INSERT INTO public.matches (
      tournament_id, home_team_id, away_team_id, scheduled_time, status, field_id,
      home_score, away_score, current_chukker, total_chukkers
    ) VALUES (
      v_tournament_id, v_home_team_id, v_away_team_id, '2025-08-16 10:00:00'::timestamptz,
      'completed', v_field_id, 9, 10, 6, 6
    ) RETURNING id INTO v_match_id;

    -- lineups
    INSERT INTO public.match_lineups(match_id, team_id, player_id, position, starter)
    SELECT v_match_id, v_home_team_id, p.id, ROW_NUMBER() OVER (ORDER BY p.name), true
    FROM public.players p
    WHERE p.team_id = v_home_team_id
      AND p.name IN ('Chris Vangel','Will Mudra','Bautista Bayugar','Lindor Novillo Corvalan');

    INSERT INTO public.match_lineups(match_id, team_id, player_id, position, starter)
    SELECT v_match_id, v_away_team_id, p.id, ROW_NUMBER() OVER (ORDER BY p.name), true
    FROM public.players p
    WHERE p.team_id = v_away_team_id
      AND p.name IN ('Michael Romero','Matias Gonzalez','Anthony Garcia','Mariano Obregon');

    -- home increments [0,2,0,1,4,2]
    WITH home_players AS (
      SELECT p.id AS player_id, g.goals
      FROM public.players p
      JOIN (VALUES
        ('Chris Vangel', 7),
        ('Will Mudra', 1),
        ('Bautista Bayugar', 0),
        ('Lindor Novillo Corvalan', 1)
      ) AS g(name, goals) ON g.name = p.name AND p.team_id = v_home_team_id
    ),
    home_goal_rows AS (
      SELECT player_id, ROW_NUMBER() OVER () AS rn
      FROM home_players hp, LATERAL generate_series(1, hp.goals)
    ),
    home_chukker_rows AS (
      SELECT chukker, ROW_NUMBER() OVER () AS rn
      FROM (VALUES (1,0),(2,2),(3,0),(4,1),(5,4),(6,2)) v(chukker, num)
      CROSS JOIN LATERAL generate_series(1, v.num)
    )
    INSERT INTO public.match_events(match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_home_team_id, hgr.player_id, hcr.chukker
    FROM home_goal_rows hgr JOIN home_chukker_rows hcr USING (rn);

    -- away increments [2,2,1,2,1,2]
    WITH away_players AS (
      SELECT p.id AS player_id, g.goals
      FROM public.players p
      JOIN (VALUES
        ('Michael Romero', 4),
        ('Matias Gonzalez', 4),
        ('Anthony Garcia', 1),
        ('Mariano Obregon', 1)
      ) AS g(name, goals) ON g.name = p.name AND p.team_id = v_away_team_id
    ),
    away_goal_rows AS (
      SELECT player_id, ROW_NUMBER() OVER () AS rn
      FROM away_players ap, LATERAL generate_series(1, ap.goals)
    ),
    away_chukker_rows AS (
      SELECT chukker, ROW_NUMBER() OVER () AS rn
      FROM (VALUES (1,2),(2,2),(3,1),(4,2),(5,1),(6,2)) v(chukker, num)
      CROSS JOIN LATERAL generate_series(1, v.num)
    )
    INSERT INTO public.match_events(match_id, event_type, team_id, player_id, chukker)
    SELECT v_match_id, 'goal', v_away_team_id, agr.player_id, acr.chukker
    FROM away_goal_rows agr JOIN away_chukker_rows acr USING (rn);

    -- chukker_end
    INSERT INTO public.match_events (match_id, event_type, chukker, details) VALUES
      (v_match_id,'chukker_end',1,'{"home_score":0,"away_score":2}'::jsonb),
      (v_match_id,'chukker_end',2,'{"home_score":2,"away_score":4}'::jsonb),
      (v_match_id,'chukker_end',3,'{"home_score":2,"away_score":5}'::jsonb),
      (v_match_id,'chukker_end',4,'{"home_score":3,"away_score":7}'::jsonb),
      (v_match_id,'chukker_end',5,'{"home_score":7,"away_score":8}'::jsonb),
      (v_match_id,'chukker_end',6,'{"home_score":9,"away_score":10}'::jsonb);

    RAISE NOTICE 'Inserted match: Beaver Creek vs PFP (2025-08-16 10:00) id=%', v_match_id;
  END IF;
END $$;

COMMIT;

-- Verification helper (optional):
-- SELECT to_char(m.scheduled_time,'YYYY-MM-DD HH24:MI') AS tip, ht.name AS home, at.name AS away, m.home_score, m.away_score
-- FROM public.matches m
-- JOIN public.teams ht ON ht.id = m.home_team_id
-- JOIN public.teams at ON at.id = m.away_team_id
-- WHERE m.scheduled_time::date BETWEEN '2025-08-10' AND '2025-08-16'
-- ORDER BY m.scheduled_time;


