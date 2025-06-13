-- Enable Row Level Security on all tables
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Users table policies
create policy "Users can view their own profile"
  on public.users for select
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.users for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can insert their own profile"
  on public.users for insert
  with check ((select auth.uid()) = id);

-- Categories table policies (public read access)
create policy "Categories are viewable by everyone"
  on public.categories for select
  using (is_active = true);

-- Products table policies (public read access for active products)
create policy "Active products are viewable by everyone"
  on public.products for select
  using (is_active = true);

-- Product images table policies (public read access)
create policy "Product images are viewable by everyone"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products
      where id = product_images.product_id
      and is_active = true
    )
  );

-- Addresses table policies (user-specific)
create policy "Users can view their own addresses"
  on public.addresses for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own addresses"
  on public.addresses for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own addresses"
  on public.addresses for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own addresses"
  on public.addresses for delete
  using ((select auth.uid()) = user_id);

-- Cart items table policies (user-specific)
create policy "Users can view their own cart items"
  on public.cart_items for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own cart items"
  on public.cart_items for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own cart items"
  on public.cart_items for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own cart items"
  on public.cart_items for delete
  using ((select auth.uid()) = user_id);

-- Orders table policies (user-specific)
create policy "Users can view their own orders"
  on public.orders for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own orders"
  on public.orders for insert
  with check ((select auth.uid()) = user_id);

-- Order items table policies (user-specific through orders)
create policy "Users can view their own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where id = order_items.order_id
      and user_id = (select auth.uid())
    )
  );

create policy "Users can insert their own order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where id = order_items.order_id
      and user_id = (select auth.uid())
    )
  );

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to ensure only one default address per user
create or replace function public.ensure_single_default_address()
returns trigger
language plpgsql
as $$
begin
  if new.is_default = true then
    update public.addresses
    set is_default = false
    where user_id = new.user_id
    and id != new.id
    and is_default = true;
  end if;
  return new;
end;
$$;

-- Create trigger for default address constraint
create trigger ensure_single_default_address_trigger
  before insert or update on public.addresses
  for each row execute function public.ensure_single_default_address();

-- Create function to ensure only one main image per product
create or replace function public.ensure_single_main_image()
returns trigger
language plpgsql
as $$
begin
  if new.is_main = true then
    update public.product_images
    set is_main = false
    where product_id = new.product_id
    and id != new.id
    and is_main = true;
  end if;
  return new;
end;
$$;

-- Create trigger for main image constraint
create trigger ensure_single_main_image_trigger
  before insert or update on public.product_images
  for each row execute function public.ensure_single_main_image();
