-- ══════════════════════════════════════════════════════════════
-- TAXPRO KZ — СХЕМА БАЗЫ ДАННЫХ
-- Выполните в Supabase → SQL Editor → New Query
-- ══════════════════════════════════════════════════════════════

-- 1. ПРОФИЛИ ПОЛЬЗОВАТЕЛЕЙ
-- (автоматически создаётся при регистрации через trigger)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  company text,
  phone text,
  role text default 'accountant', -- accountant | admin
  plan text default 'free',        -- free | pro | enterprise
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Автосоздание профиля при регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. КЛИЕНТЫ (ИП / ТОО на обслуживании у бухгалтера)
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('ИП', 'ТОО', 'АО')),
  name text not null,
  bin text not null,                -- ИИН или БИН (12 цифр)
  regime text not null default 'УНР', -- УНР | ОУР | Самозан.
  nds boolean default false,
  nds_reg_date date,
  address text,
  director text,
  accountant_name text,
  phone text,
  email text,
  notes text,
  status text default 'active',    -- active | inactive | archived
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. ДЕКЛАРАЦИИ
create table public.declarations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  form_code text not null,          -- 910 | 200 | 300 | 100 | 220 | 912
  period text not null,             -- "1 полугодие 2026" / "2 квартал 2026"
  status text default 'draft',      -- draft | ready | signed | submitted
  form_data jsonb not null default '{}', -- все поля формы
  xml_content text,                 -- готовый XML для КГД
  submitted_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. ИСТОРИЯ ОТПРАВОК В КГД
create table public.submissions (
  id uuid default gen_random_uuid() primary key,
  declaration_id uuid references public.declarations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  method text default 'xml',        -- xml | api
  status text default 'pending',    -- pending | success | error
  response_code text,
  response_message text,
  submitted_at timestamptz default now()
);

-- 5. УВЕДОМЛЕНИЯ / НАПОМИНАНИЯ
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  type text not null,               -- deadline | reminder | info | error
  title text not null,
  message text,
  form_code text,
  deadline_date date,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) — каждый видит только своё
-- ══════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.declarations enable row level security;
alter table public.submissions enable row level security;
alter table public.notifications enable row level security;

-- Profiles: только свой профиль
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Clients: только свои клиенты
create policy "Users can CRUD own clients"
  on public.clients for all using (auth.uid() = user_id);

-- Declarations: только свои декларации
create policy "Users can CRUD own declarations"
  on public.declarations for all using (auth.uid() = user_id);

-- Submissions
create policy "Users can view own submissions"
  on public.submissions for select using (auth.uid() = user_id);
create policy "Users can insert own submissions"
  on public.submissions for insert with check (auth.uid() = user_id);

-- Notifications
create policy "Users can manage own notifications"
  on public.notifications for all using (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- ИНДЕКСЫ для производительности
-- ══════════════════════════════════════════════════════════════
create index idx_clients_user_id on public.clients(user_id);
create index idx_clients_bin on public.clients(bin);
create index idx_declarations_user_id on public.declarations(user_id);
create index idx_declarations_client_id on public.declarations(client_id);
create index idx_declarations_status on public.declarations(status);
create index idx_notifications_user_id on public.notifications(user_id, is_read);

-- ══════════════════════════════════════════════════════════════
-- ФУНКЦИЯ: автообновление updated_at
-- ══════════════════════════════════════════════════════════════
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at_column();
create trigger update_clients_updated_at before update on public.clients
  for each row execute function update_updated_at_column();
create trigger update_declarations_updated_at before update on public.declarations
  for each row execute function update_updated_at_column();
