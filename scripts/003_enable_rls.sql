-- Enable Row Level Security (RLS) for all tables
-- This ensures data security and proper access control

-- Enable RLS on all tables
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pqrs_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for zones (readable by all authenticated users)
CREATE POLICY "zones_select_authenticated" ON public.zones FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "zones_insert_authenticated" ON public.zones FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "zones_update_authenticated" ON public.zones FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "zones_delete_authenticated" ON public.zones FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for vehicle_types (readable by all authenticated users)
CREATE POLICY "vehicle_types_select_authenticated" ON public.vehicle_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "vehicle_types_insert_authenticated" ON public.vehicle_types FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "vehicle_types_update_authenticated" ON public.vehicle_types FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "vehicle_types_delete_authenticated" ON public.vehicle_types FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for vehicles (readable by all authenticated users)
CREATE POLICY "vehicles_select_authenticated" ON public.vehicles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "vehicles_insert_authenticated" ON public.vehicles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "vehicles_update_authenticated" ON public.vehicles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "vehicles_delete_authenticated" ON public.vehicles FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for personnel_roles (readable by all authenticated users)
CREATE POLICY "personnel_roles_select_authenticated" ON public.personnel_roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "personnel_roles_insert_authenticated" ON public.personnel_roles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "personnel_roles_update_authenticated" ON public.personnel_roles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "personnel_roles_delete_authenticated" ON public.personnel_roles FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for personnel (readable by all authenticated users)
CREATE POLICY "personnel_select_authenticated" ON public.personnel FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "personnel_insert_authenticated" ON public.personnel FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "personnel_update_authenticated" ON public.personnel FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "personnel_delete_authenticated" ON public.personnel FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for pqrs_requests (readable by all authenticated users)
CREATE POLICY "pqrs_requests_select_authenticated" ON public.pqrs_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "pqrs_requests_insert_authenticated" ON public.pqrs_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "pqrs_requests_update_authenticated" ON public.pqrs_requests FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "pqrs_requests_delete_authenticated" ON public.pqrs_requests FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for assignments (readable by all authenticated users)
CREATE POLICY "assignments_select_authenticated" ON public.assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "assignments_insert_authenticated" ON public.assignments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "assignments_update_authenticated" ON public.assignments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "assignments_delete_authenticated" ON public.assignments FOR DELETE USING (auth.role() = 'authenticated');
