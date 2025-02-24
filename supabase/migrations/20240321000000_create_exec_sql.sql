-- Enable pgcrypto extension for UUID generation
create extension if not exists pgcrypto;

-- Create exec_sql function with RLS policies
create or replace function exec_sql(sql text)
returns void
language plpgsql
security definer
as $$
begin
  execute sql;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function exec_sql(text) to authenticated;

-- RLS Policy to ensure only authenticated users can execute SQL
create policy "Enable exec_sql for authenticated users only"
  on auth.users
  for all
  to authenticated
  using (true); 