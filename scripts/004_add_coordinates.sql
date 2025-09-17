-- Add geographical coordinates to all tables

-- Add coordinates to zones table (if not already exists)
ALTER TABLE public.zones
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Add coordinates to personnel table
ALTER TABLE public.personnel
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Add coordinates to vehicles table
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Add coordinates to pqrs_requests table
ALTER TABLE public.pqrs_requests
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Update existing sample data with coordinates for Medellín area
-- Approximate coordinates for Medellín zones
UPDATE public.zones SET
  latitude = 6.2442 + (random() * 0.1 - 0.05),
  longitude = -75.5812 + (random() * 0.1 - 0.05)
WHERE latitude IS NULL;

-- Update personnel with random coordinates within Medellín
UPDATE public.personnel SET
  latitude = 6.2442 + (random() * 0.1 - 0.05),
  longitude = -75.5812 + (random() * 0.1 - 0.05)
WHERE latitude IS NULL;

-- Update vehicles with random coordinates within Medellín
UPDATE public.vehicles SET
  latitude = 6.2442 + (random() * 0.1 - 0.05),
  longitude = -75.5812 + (random() * 0.1 - 0.05)
WHERE latitude IS NULL;

-- Update PQRS with random coordinates within Medellín
UPDATE public.pqrs_requests SET
  latitude = 6.2442 + (random() * 0.1 - 0.05),
  longitude = -75.5812 + (random() * 0.1 - 0.05)
WHERE latitude IS NULL;