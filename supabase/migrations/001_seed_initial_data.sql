-- =========================================================
-- Polo App - Seed Initial Teams & Players (Idempotent)
-- =========================================================
-- Safe to run multiple times
-- =========================================================

-- Teams
insert into public.teams (name)
values
  ('Passion For Polo'),
  ('Las Brisas'),
  ('CD Peacock'),
  ('Beaver Creek'),
  ('Flying Changes')
on conflict (name) do nothing;

-- Players per team (insert if not already present for that team)

-- Flying Changes
insert into public.players (name, handicap, team_id)
select v.name, v.handicap, t.id
from (values
  ('Sawyer Leffingwell', 0),
  ('Tomas Obregon', 3),
  ('Nicolas Saenz', 5),
  ('Mariano Gutierrez', 4)
) as v(name, handicap)
join public.teams t on t.name ilike 'Flying Changes'
where not exists (
  select 1 from public.players p
  where p.name = v.name and p.team_id = t.id
);

-- Las Brisas
insert into public.players (name, handicap, team_id)
select v.name, v.handicap, t.id
from (values
  ('Larry Aschebrook', 1),
  ('Juan Martin Gutierrez', 3),
  ('Juan Martin Obregon', 6),
  ('Matias Obregon', 4)
) as v(name, handicap)
join public.teams t on t.name ilike 'Las Brisas'
where not exists (
  select 1 from public.players p
  where p.name = v.name and p.team_id = t.id
);

-- Passion For Polo
insert into public.players (name, handicap, team_id)
select v.name, v.handicap, t.id
from (values
  ('Michael Romero', 0),
  ('Matias Gonzalez', 4),
  ('Anthony Garcia', 4),
  ('Matias Obregon', 6)
) as v(name, handicap)
join public.teams t on t.name ilike 'Passion For Polo'
where not exists (
  select 1 from public.players p
  where p.name = v.name and p.team_id = t.id
);

-- Beaver Creek
insert into public.players (name, handicap, team_id)
select v.name, v.handicap, t.id
from (values
  ('Chris Vangel', 1),
  ('Will Mudra', 1),
  ('Bautista Bayugar', 5),
  ('Lindor Novillo Corvalan', 4)
) as v(name, handicap)
join public.teams t on t.name ilike 'Beaver Creek'
where not exists (
  select 1 from public.players p
  where p.name = v.name and p.team_id = t.id
);

-- CD Peacock
insert into public.players (name, handicap, team_id)
select v.name, v.handicap, t.id
from (values
  ('Vance Miller', 1),
  ('Thomas Rubenacker', 2),
  ('Jack Kiely', 4),
  ('Vaughn Miller Jr.', 4)
) as v(name, handicap)
join public.teams t on t.name ilike 'CD Peacock'
where not exists (
  select 1 from public.players p
  where p.name = v.name and p.team_id = t.id
);


