-- Create function to get player statistics
create or replace function public.get_player_stats(player_id uuid)
returns table (
  total_matches bigint,
  goals bigint,
  assists bigint,
  wins bigint,
  losses bigint,
  average_handicap numeric
)
language sql
security definer
as $$
  WITH player_matches AS (
    -- Get all matches the player participated in
    SELECT DISTINCT
      ml.match_id,
      ml.team_id,
      m.status,
      m.home_team_id,
      m.away_team_id,
      m.home_score,
      m.away_score,
      CASE 
        WHEN ml.team_id = m.home_team_id THEN m.home_score
        ELSE m.away_score
      END as team_score,
      CASE 
        WHEN ml.team_id = m.home_team_id THEN m.away_score
        ELSE m.home_score
      END as opponent_score
    FROM public.match_lineups ml
    JOIN public.matches m ON m.id = ml.match_id
    WHERE ml.player_id = get_player_stats.player_id
      AND m.status IN ('completed', 'live')
  ),
  player_goals AS (
    -- Count goals scored by the player
    SELECT COUNT(*) as goal_count
    FROM public.match_events me
    WHERE me.player_id = get_player_stats.player_id
      AND me.event_type = 'goal'
  ),
  player_assists AS (
    -- For now, we don't track assists, so return 0
    SELECT 0 as assist_count
  ),
  match_results AS (
    -- Calculate wins and losses
    SELECT 
      COUNT(*) FILTER (WHERE team_score > opponent_score) as wins,
      COUNT(*) FILTER (WHERE team_score < opponent_score) as losses
    FROM player_matches
    WHERE status = 'completed'
  )
  SELECT 
    (SELECT COUNT(*) FROM player_matches) as total_matches,
    (SELECT goal_count FROM player_goals) as goals,
    (SELECT assist_count FROM player_assists) as assists,
    (SELECT wins FROM match_results) as wins,
    (SELECT losses FROM match_results) as losses,
    (SELECT AVG(handicap)::numeric FROM public.players WHERE id = get_player_stats.player_id) as average_handicap
$$;

-- Create function to get recent matches for a player
create or replace function public.get_player_recent_matches(
  p_player_id uuid,
  p_limit integer default 5
)
returns table (
  match_id uuid,
  tournament_name text,
  scheduled_time timestamptz,
  status text,
  home_team_id uuid,
  home_team_name text,
  away_team_id uuid,
  away_team_name text,
  home_score integer,
  away_score integer,
  player_team_id uuid,
  player_goals bigint,
  field_name text,
  is_winner boolean
)
language sql
security definer
as $$
  WITH player_match_data AS (
    SELECT DISTINCT
      m.id as match_id,
      t.name as tournament_name,
      m.scheduled_time,
      m.status::text,
      m.home_team_id,
      ht.name as home_team_name,
      m.away_team_id,
      at.name as away_team_name,
      m.home_score,
      m.away_score,
      ml.team_id as player_team_id,
      f.name as field_name,
      CASE 
        WHEN ml.team_id = m.home_team_id AND m.home_score > m.away_score THEN true
        WHEN ml.team_id = m.away_team_id AND m.away_score > m.home_score THEN true
        ELSE false
      END as is_winner
    FROM public.match_lineups ml
    JOIN public.matches m ON m.id = ml.match_id
    LEFT JOIN public.tournaments t ON t.id = m.tournament_id
    LEFT JOIN public.teams ht ON ht.id = m.home_team_id
    LEFT JOIN public.teams at ON at.id = m.away_team_id
    LEFT JOIN public.fields f ON f.id = m.field_id
    WHERE ml.player_id = p_player_id
      AND m.status IN ('completed', 'live', 'scheduled')
    ORDER BY m.scheduled_time DESC
    LIMIT p_limit
  ),
  player_goals_per_match AS (
    SELECT 
      me.match_id,
      COUNT(*)::bigint as goal_count
    FROM public.match_events me
    WHERE me.player_id = p_player_id
      AND me.event_type = 'goal'
    GROUP BY me.match_id
  )
  SELECT 
    pmd.match_id,
    pmd.tournament_name,
    pmd.scheduled_time,
    pmd.status,
    pmd.home_team_id,
    pmd.home_team_name,
    pmd.away_team_id,
    pmd.away_team_name,
    pmd.home_score,
    pmd.away_score,
    pmd.player_team_id,
    COALESCE(pgm.goal_count, 0)::bigint as player_goals,
    pmd.field_name,
    pmd.is_winner
  FROM player_match_data pmd
  LEFT JOIN player_goals_per_match pgm ON pgm.match_id = pmd.match_id
  ORDER BY pmd.scheduled_time DESC
$$;

-- Grant execute permissions
grant execute on function public.get_player_stats(uuid) to anon, authenticated;
grant execute on function public.get_player_recent_matches(uuid, integer) to anon, authenticated;
