-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table 1: majed_claude_businesses
-- Stores basic business information
create table if not exists majed_claude_businesses (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  website text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table 2: majed_claude_pages
-- Stores rendered HTML and JSON-LD for each business microsite
create table if not exists majed_claude_pages (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references majed_claude_businesses(id) on delete cascade,
  url text not null,
  html text not null,
  jsonld jsonb not null,
  published_at timestamptz default now()
);

-- Create indexes for performance
create index if not exists idx_majed_claude_businesses_slug on majed_claude_businesses(slug);
create index if not exists idx_majed_claude_pages_business_id on majed_claude_pages(business_id);
create index if not exists idx_majed_claude_pages_published_at on majed_claude_pages(published_at desc);

-- Enable Row Level Security (RLS) - optional but recommended
alter table majed_claude_businesses enable row level security;
alter table majed_claude_pages enable row level security;

-- Create policies to allow public read access
create policy "Allow public read access to businesses"
  on majed_claude_businesses for select
  using (true);

create policy "Allow public read access to pages"
  on majed_claude_pages for select
  using (true);

-- Storage bucket creation (run this separately in Supabase Storage UI or via SQL)
-- Create a public bucket named 'business-files' for storing uploaded documents
-- This should be done in the Supabase Dashboard under Storage

