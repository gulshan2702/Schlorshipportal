-- Enable required extensions
create extension if not exists "vector";
create extension if not exists "pgcrypto";

-- Create users table
create table if not exists public.users (
    id uuid references auth.users(id) primary key,
    email text not null unique,
    full_name text not null,
    avatar_url text,
    caste text,
    religion text,
    state text,
    education jsonb,
    created_at timestamp with time zone default now() not null
);

-- Create scholarships table
create table if not exists public.scholarships (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text not null,
    amount numeric not null,
    deadline timestamp with time zone not null,
    category text not null,
    status text not null default 'Available',
    eligibility_criteria jsonb,
    requirements text[],
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    vector_embedding vector(1536)
);

-- Create applications table
create table if not exists public.applications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) not null,
    scholarship_id uuid references public.scholarships(id) not null,
    status text not null default 'Pending',
    submitted_at timestamp with time zone not null,
    documents jsonb,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Create vector search function
create or replace function search_scholarships (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  description text,
  amount numeric,
  deadline timestamp,
  category text,
  status text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    id,
    title,
    description,
    amount,
    deadline::timestamp,
    category,
    status,
    1 - (vector_embedding <=> query_embedding) as similarity
  from scholarships
  where 1 - (vector_embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;

-- Create match scholarships function
create or replace function match_scholarships(user_id uuid)
returns table (
  id uuid,
  title text,
  match_score float
)
language plpgsql
as $$
begin
  return query
  select 
    s.id,
    s.title,
    case
      when u.caste = any(s.eligibility_criteria->>'caste') then 0.3
      else 0
    end +
    case
      when u.religion = any(s.eligibility_criteria->>'religion') then 0.2
      else 0
    end +
    case
      when u.state = s.eligibility_criteria->>'state' then 0.2
      else 0
    end +
    case
      when (u.education->>'grade')::float >= (s.eligibility_criteria->>'minGrade')::float then 0.3
      else 0
    end as match_score
  from scholarships s
  cross join users u
  where u.id = user_id
  order by match_score desc;
end;
$$;

-- Create indexes
create index if not exists scholarships_vector_embedding_idx 
on scholarships 
using ivfflat (vector_embedding vector_cosine_ops)
with (lists = 100);

create index if not exists applications_user_id_idx on applications(user_id);
create index if not exists applications_scholarship_id_idx on applications(scholarship_id);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.scholarships enable row level security;
alter table public.applications enable row level security;

-- Create RLS policies
create policy "Users can view their own profile"
  on public.users
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users
  for update
  using (auth.uid() = id);

create policy "Anyone can view scholarships"
  on public.scholarships
  for select
  to authenticated
  using (true);

create policy "Admin can manage scholarships"
  on public.scholarships
  for all
  to authenticated
  using (auth.uid() in (select id from public.users where email like '%admin%'));

create policy "Users can view their own applications"
  on public.applications
  for select
  using (auth.uid() = user_id);

create policy "Users can create applications"
  on public.applications
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own applications"
  on public.applications
  for update
  using (auth.uid() = user_id);

-- Create triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_scholarships_updated_at
  before update on scholarships
  for each row
  execute function update_updated_at_column();

create trigger update_applications_updated_at
  before update on applications
  for each row
  execute function update_updated_at_column();

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant all on all functions in schema public to authenticated; 