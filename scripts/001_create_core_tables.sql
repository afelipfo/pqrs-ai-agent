-- Create core tables for the Medellín AI Agent system

-- Zones table for city districts/neighborhoods
CREATE TABLE IF NOT EXISTS public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  coordinates JSONB, -- Store polygon coordinates for zone boundaries
  population INTEGER,
  area_km2 DECIMAL(10,2),
  priority_level INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=critical
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle types and categories
CREATE TABLE IF NOT EXISTS public.vehicle_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'emergency', 'maintenance', 'patrol', 'transport'
  capacity INTEGER DEFAULT 1,
  equipment JSONB, -- Store equipment/capabilities as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_plate TEXT UNIQUE NOT NULL,
  vehicle_type_id UUID REFERENCES public.vehicle_types(id),
  status TEXT DEFAULT 'available', -- 'available', 'assigned', 'maintenance', 'out_of_service'
  current_zone_id UUID REFERENCES public.zones(id),
  last_location JSONB, -- Store lat/lng coordinates
  fuel_level DECIMAL(5,2) DEFAULT 100.00,
  maintenance_due DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personnel roles and specializations
CREATE TABLE IF NOT EXISTS public.personnel_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department TEXT NOT NULL, -- 'police', 'fire', 'medical', 'maintenance', 'administration'
  required_certifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personnel table
CREATE TABLE IF NOT EXISTS public.personnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role_id UUID REFERENCES public.personnel_roles(id),
  status TEXT DEFAULT 'available', -- 'available', 'assigned', 'off_duty', 'on_leave'
  current_zone_id UUID REFERENCES public.zones(id),
  shift_start TIME,
  shift_end TIME,
  certifications JSONB,
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PQRS (Peticiones, Quejas, Reclamos y Sugerencias) table
CREATE TABLE IF NOT EXISTS public.pqrs_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'peticion', 'queja', 'reclamo', 'sugerencia'
  category TEXT NOT NULL, -- 'security', 'infrastructure', 'environment', 'transport', 'health'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'closed'
  zone_id UUID REFERENCES public.zones(id),
  location JSONB, -- Store specific coordinates if available
  citizen_info JSONB, -- Store citizen contact information
  assigned_personnel_id UUID REFERENCES public.personnel(id),
  assigned_vehicle_id UUID REFERENCES public.vehicles(id),
  estimated_resolution_time INTERVAL,
  actual_resolution_time INTERVAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Assignment history for tracking
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pqrs_request_id UUID REFERENCES public.pqrs_requests(id),
  personnel_id UUID REFERENCES public.personnel(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  zone_id UUID REFERENCES public.zones(id),
  assignment_reason TEXT,
  ai_confidence_score DECIMAL(3,2), -- AI confidence in assignment (0.00-1.00)
  assignment_factors JSONB, -- Store factors that influenced the assignment
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_zone ON public.vehicles(current_zone_id);
CREATE INDEX IF NOT EXISTS idx_personnel_status ON public.personnel(status);
CREATE INDEX IF NOT EXISTS idx_personnel_zone ON public.personnel(current_zone_id);
CREATE INDEX IF NOT EXISTS idx_pqrs_status ON public.pqrs_requests(status);
CREATE INDEX IF NOT EXISTS idx_pqrs_zone ON public.pqrs_requests(zone_id);
CREATE INDEX IF NOT EXISTS idx_pqrs_priority ON public.pqrs_requests(priority);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);
