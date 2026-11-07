CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
  bathrooms NUMERIC(3,1) NOT NULL CHECK (bathrooms >= 0),
  image_url TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  listing_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);