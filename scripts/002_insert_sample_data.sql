-- Insert sample data for testing the Medellín AI Agent system

-- Insert Medellín zones (major neighborhoods/districts)
INSERT INTO public.zones (name, code, priority_level) VALUES
('El Poblado', 'EP', 2),
('Laureles-Estadio', 'LE', 2),
('La Candelaria', 'LC', 3),
('Buenos Aires', 'BA', 2),
('Castilla', 'CA', 2),
('Doce de Octubre', 'DO', 3),
('Robledo', 'RO', 2),
('Villa Hermosa', 'VH', 3),
('Buenos Aires', 'BA2', 2),
('La América', 'LA', 2),
('San Javier', 'SJ', 3),
('El Rincón', 'ER', 2),
('Guayabal', 'GU', 2),
('Belén', 'BE', 2),
('Altavista', 'AL', 2),
('San Antonio de Prado', 'SAP', 1);

-- Insert vehicle types
INSERT INTO public.vehicle_types (name, category, capacity, equipment) VALUES
('Patrulla Policía', 'emergency', 2, '{"radio": true, "first_aid": true, "weapons": true}'),
('Ambulancia', 'emergency', 4, '{"medical_equipment": true, "stretcher": true, "oxygen": true}'),
('Camión Bomberos', 'emergency', 6, '{"water_tank": true, "ladder": true, "rescue_equipment": true}'),
('Vehículo Mantenimiento', 'maintenance', 3, '{"tools": true, "spare_parts": true, "safety_equipment": true}'),
('Motocicleta Patrulla', 'patrol', 1, '{"radio": true, "first_aid": true}'),
('Camioneta Supervisión', 'administration', 4, '{"radio": true, "laptop": true}');

-- Insert sample vehicles
INSERT INTO public.vehicles (license_plate, vehicle_type_id, status, fuel_level) 
SELECT 
  'POL-' || LPAD((ROW_NUMBER() OVER())::TEXT, 3, '0'),
  vt.id,
  CASE WHEN RANDOM() < 0.8 THEN 'available' ELSE 'assigned' END,
  ROUND((RANDOM() * 50 + 50)::NUMERIC, 2)
FROM public.vehicle_types vt, generate_series(1, 3);

-- Insert personnel roles
INSERT INTO public.personnel_roles (name, department, required_certifications) VALUES
('Oficial de Policía', 'police', '["police_academy", "firearms_training"]'),
('Paramédico', 'medical', '["paramedic_certification", "cpr_training"]'),
('Bombero', 'fire', '["firefighter_training", "rescue_certification"]'),
('Técnico Mantenimiento', 'maintenance', '["technical_certification", "safety_training"]'),
('Supervisor de Campo', 'administration', '["leadership_training", "emergency_management"]'),
('Agente de Tránsito', 'police', '["traffic_control", "first_aid"]');

-- Insert sample personnel
INSERT INTO public.personnel (employee_id, first_name, last_name, role_id, status, shift_start, shift_end)
SELECT 
  'EMP-' || LPAD((ROW_NUMBER() OVER())::TEXT, 4, '0'),
  CASE (RANDOM() * 10)::INT 
    WHEN 0 THEN 'Carlos' WHEN 1 THEN 'María' WHEN 2 THEN 'José' 
    WHEN 3 THEN 'Ana' WHEN 4 THEN 'Luis' WHEN 5 THEN 'Carmen'
    WHEN 6 THEN 'Pedro' WHEN 7 THEN 'Laura' WHEN 8 THEN 'Miguel'
    ELSE 'Sofia' END,
  CASE (RANDOM() * 10)::INT 
    WHEN 0 THEN 'García' WHEN 1 THEN 'Rodríguez' WHEN 2 THEN 'López' 
    WHEN 3 THEN 'Martínez' WHEN 4 THEN 'González' WHEN 5 THEN 'Pérez'
    WHEN 6 THEN 'Sánchez' WHEN 7 THEN 'Ramírez' WHEN 8 THEN 'Torres'
    ELSE 'Flores' END,
  pr.id,
  CASE WHEN RANDOM() < 0.7 THEN 'available' ELSE 'assigned' END,
  '06:00:00'::TIME + (RANDOM() * INTERVAL '8 hours'),
  '14:00:00'::TIME + (RANDOM() * INTERVAL '8 hours')
FROM public.personnel_roles pr, generate_series(1, 4);

-- Insert sample PQRS requests
INSERT INTO public.pqrs_requests (request_number, type, category, title, description, priority, zone_id)
SELECT 
  'PQRS-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((ROW_NUMBER() OVER())::TEXT, 4, '0'),
  CASE (RANDOM() * 4)::INT 
    WHEN 0 THEN 'peticion' WHEN 1 THEN 'queja' 
    WHEN 2 THEN 'reclamo' ELSE 'sugerencia' END,
  CASE (RANDOM() * 5)::INT 
    WHEN 0 THEN 'security' WHEN 1 THEN 'infrastructure' 
    WHEN 2 THEN 'environment' WHEN 3 THEN 'transport' ELSE 'health' END,
  CASE (RANDOM() * 6)::INT 
    WHEN 0 THEN 'Problema de alumbrado público'
    WHEN 1 THEN 'Ruido excesivo en la zona'
    WHEN 2 THEN 'Bache en la vía principal'
    WHEN 3 THEN 'Solicitud de mayor vigilancia'
    WHEN 4 THEN 'Recolección de basuras'
    ELSE 'Semáforo dañado' END,
  'Descripción detallada del problema reportado por el ciudadano.',
  CASE (RANDOM() * 4)::INT 
    WHEN 0 THEN 'low' WHEN 1 THEN 'medium' 
    WHEN 2 THEN 'high' ELSE 'urgent' END,
  z.id
FROM public.zones z, generate_series(1, 2)
ORDER BY RANDOM()
LIMIT 20;
