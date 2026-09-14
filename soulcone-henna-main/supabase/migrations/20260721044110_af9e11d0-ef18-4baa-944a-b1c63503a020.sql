
-- Admin role infra
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((auth.jwt() ->> 'email') = 'ayeshariza6@gmail.com', false)
      or exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin');
$$;

create policy "Users can read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());
create policy "Admins can manage roles" on public.user_roles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  event_type text not null,
  event_date date not null,
  location text not null,
  notes text,
  created_at timestamptz not null default now()
);
grant select, insert on public.bookings to anon;
grant select, insert, update, delete on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "Anyone can create bookings" on public.bookings
  for insert to anon, authenticated with check (true);
create policy "Admins can view bookings" on public.bookings
  for select to authenticated using (public.is_admin());
create policy "Admins can update bookings" on public.bookings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete bookings" on public.bookings
  for delete to authenticated using (public.is_admin());

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  product_type text not null,
  quantity integer not null check (quantity > 0),
  address text not null,
  notes text,
  status text not null default 'Pending' check (status in ('Pending','Contacted','Completed')),
  created_at timestamptz not null default now()
);
grant select, insert on public.orders to anon;
grant select, insert, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Anyone can create orders" on public.orders
  for insert to anon, authenticated with check (true);
create policy "Admins can view orders" on public.orders
  for select to authenticated using (public.is_admin());
create policy "Admins can update orders" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete orders" on public.orders
  for delete to authenticated using (public.is_admin());

-- Contacts
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);
grant select, insert on public.contacts to anon;
grant select, insert, update, delete on public.contacts to authenticated;
grant all on public.contacts to service_role;
alter table public.contacts enable row level security;
create policy "Anyone can create contacts" on public.contacts
  for insert to anon, authenticated with check (true);
create policy "Admins can view contacts" on public.contacts
  for select to authenticated using (public.is_admin());
create policy "Admins can delete contacts" on public.contacts
  for delete to authenticated using (public.is_admin());

-- Reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  rating integer not null check (rating between 1 and 5),
  review text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "Anyone can create reviews" on public.reviews
  for insert to anon, authenticated with check (true);
create policy "Public can read approved reviews" on public.reviews
  for select to anon, authenticated using (approved = true);
create policy "Admins can read all reviews" on public.reviews
  for select to authenticated using (public.is_admin());
create policy "Admins can update reviews" on public.reviews
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete reviews" on public.reviews
  for delete to authenticated using (public.is_admin());
