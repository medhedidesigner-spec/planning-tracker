-- ============================================
-- SCHEMA COMPLET POUR L'APP ROADMAP
-- À exécuter dans Supabase → SQL Editor → New Query
-- ============================================

-- 1. TABLE PLANNINGS
create table plannings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- 2. TABLE PHASES
create table phases (
  id uuid primary key default gen_random_uuid(),
  planning_id uuid references plannings(id) on delete cascade not null,
  title text not null,
  color text default '#6366f1',
  position int default 0,
  created_at timestamptz default now()
);

-- 3. TABLE WEEKS
create table weeks (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid references phases(id) on delete cascade not null,
  title text not null,
  start_date date,
  end_date date,
  position int default 0,
  created_at timestamptz default now()
);

-- 4. TABLE OBJECTIVES
create table objectives (
  id uuid primary key default gen_random_uuid(),
  week_id uuid references weeks(id) on delete cascade not null,
  label text not null,
  url text,
  done boolean default false,
  position int default 0,
  created_at timestamptz default now()
);

-- 5. TABLE COLLABORATORS
create table collaborators (
  id uuid primary key default gen_random_uuid(),
  planning_id uuid references plannings(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  role text check (role in ('readonly', 'edit')) not null default 'readonly',
  created_at timestamptz default now(),
  unique(planning_id, email)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table plannings enable row level security;
alter table phases enable row level security;
alter table weeks enable row level security;
alter table objectives enable row level security;
alter table collaborators enable row level security;

-- Fonction helper : vérifie si l'utilisateur a accès à un planning
create or replace function has_planning_access(p_id uuid)
returns boolean as $$
  select exists (
    select 1 from plannings where id = p_id and owner_id = auth.uid()
    union
    select 1 from collaborators where planning_id = p_id and user_id = auth.uid()
  );
$$ language sql security definer;

-- Fonction helper : vérifie si l'utilisateur peut éditer un planning
create or replace function can_edit_planning(p_id uuid)
returns boolean as $$
  select exists (
    select 1 from plannings where id = p_id and owner_id = auth.uid()
    union
    select 1 from collaborators where planning_id = p_id and user_id = auth.uid() and role = 'edit'
  );
$$ language sql security definer;

-- POLICIES : PLANNINGS
create policy "Voir ses plannings et ceux partagés"
  on plannings for select
  using (owner_id = auth.uid() or has_planning_access(id));

create policy "Créer ses propres plannings"
  on plannings for insert
  with check (owner_id = auth.uid());

create policy "Modifier ses propres plannings"
  on plannings for update
  using (owner_id = auth.uid());

create policy "Supprimer ses propres plannings"
  on plannings for delete
  using (owner_id = auth.uid());

-- POLICIES : PHASES
create policy "Voir les phases si accès au planning"
  on phases for select
  using (has_planning_access(planning_id));

create policy "Créer des phases si édition autorisée"
  on phases for insert
  with check (can_edit_planning(planning_id));

create policy "Modifier des phases si édition autorisée"
  on phases for update
  using (can_edit_planning(planning_id));

create policy "Supprimer des phases si édition autorisée"
  on phases for delete
  using (can_edit_planning(planning_id));

-- POLICIES : WEEKS
create policy "Voir les semaines si accès au planning"
  on weeks for select
  using (has_planning_access((select planning_id from phases where id = phase_id)));

create policy "Créer des semaines si édition autorisée"
  on weeks for insert
  with check (can_edit_planning((select planning_id from phases where id = phase_id)));

create policy "Modifier des semaines si édition autorisée"
  on weeks for update
  using (can_edit_planning((select planning_id from phases where id = phase_id)));

create policy "Supprimer des semaines si édition autorisée"
  on weeks for delete
  using (can_edit_planning((select planning_id from phases where id = phase_id)));

-- POLICIES : OBJECTIVES
create policy "Voir les objectifs si accès au planning"
  on objectives for select
  using (has_planning_access((select planning_id from phases where id = (select phase_id from weeks where id = week_id))));

create policy "Créer des objectifs si édition autorisée"
  on objectives for insert
  with check (can_edit_planning((select planning_id from phases where id = (select phase_id from weeks where id = week_id))));

create policy "Modifier des objectifs si édition autorisée"
  on objectives for update
  using (can_edit_planning((select planning_id from phases where id = (select phase_id from weeks where id = week_id))));

create policy "Supprimer des objectifs si édition autorisée"
  on objectives for delete
  using (can_edit_planning((select planning_id from phases where id = (select phase_id from weeks where id = week_id))));

-- POLICIES : COLLABORATORS
create policy "Voir les collaborateurs si owner ou collaborateur"
  on collaborators for select
  using (has_planning_access(planning_id));

create policy "Le owner peut ajouter des collaborateurs"
  on collaborators for insert
  with check (exists (select 1 from plannings where id = planning_id and owner_id = auth.uid()));

create policy "Le owner peut modifier les collaborateurs"
  on collaborators for update
  using (exists (select 1 from plannings where id = planning_id and owner_id = auth.uid()));

create policy "Le owner peut supprimer des collaborateurs"
  on collaborators for delete
  using (exists (select 1 from plannings where id = planning_id and owner_id = auth.uid()));

-- ============================================
-- TRIGGER : lier collaborateur par email au signup
-- Quand un user s'inscrit, on lie automatiquement les collaborateurs
-- en attente qui ont son email
-- ============================================
create or replace function link_pending_collaborators()
returns trigger as $$
begin
  update collaborators
  set user_id = new.id
  where email = new.email and user_id is null;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function link_pending_collaborators();
