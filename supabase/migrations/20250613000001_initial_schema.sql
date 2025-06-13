-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type order_status as enum (
  'pending',
  'processing', 
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

-- Users table (extends auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  stripe_customer_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  slug text unique not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null check (price >= 0),
  currency text default 'jpy' not null,
  inventory integer default 0 not null check (inventory >= 0),
  category_id uuid references public.categories(id) on delete set null,
  is_active boolean default true not null,
  stripe_product_id text unique,
  stripe_price_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product images table
create table public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  url text not null,
  alt_text text,
  is_main boolean default false not null,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Addresses table
create table public.addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text default 'JP' not null,
  is_default boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cart items table
create table public.cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- Orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  status order_status default 'pending' not null,
  total decimal(10,2) not null check (total >= 0),
  currency text default 'jpy' not null,
  shipping_address_id uuid references public.addresses(id) not null,
  billing_address_id uuid references public.addresses(id),
  stripe_payment_intent_id text unique,
  stripe_session_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order items table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null check (quantity > 0),
  price decimal(10,2) not null check (price >= 0),
  total decimal(10,2) not null check (total >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index idx_users_email on public.users(email);
create index idx_users_stripe_customer_id on public.users(stripe_customer_id);
create index idx_categories_slug on public.categories(slug);
create index idx_categories_is_active on public.categories(is_active);
create index idx_products_category_id on public.products(category_id);
create index idx_products_is_active on public.products(is_active);
create index idx_products_price on public.products(price);
create index idx_product_images_product_id on public.product_images(product_id);
create index idx_product_images_is_main on public.product_images(is_main);
create index idx_addresses_user_id on public.addresses(user_id);
create index idx_addresses_is_default on public.addresses(is_default);
create index idx_cart_items_user_id on public.cart_items(user_id);
create index idx_cart_items_product_id on public.cart_items(product_id);
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_stripe_payment_intent_id on public.orders(stripe_payment_intent_id);
create index idx_order_items_order_id on public.order_items(order_id);
create index idx_order_items_product_id on public.order_items(product_id);

-- Create functions for updating updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_users_updated_at before update on public.users
  for each row execute function update_updated_at_column();

create trigger update_categories_updated_at before update on public.categories
  for each row execute function update_updated_at_column();

create trigger update_products_updated_at before update on public.products
  for each row execute function update_updated_at_column();

create trigger update_addresses_updated_at before update on public.addresses
  for each row execute function update_updated_at_column();

create trigger update_cart_items_updated_at before update on public.cart_items
  for each row execute function update_updated_at_column();

create trigger update_orders_updated_at before update on public.orders
  for each row execute function update_updated_at_column();
