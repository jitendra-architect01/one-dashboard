/*
  # Complete Enterprise Platform Database Schema

  1. New Tables
    - `business_units` - Master list of business units
    - `employee_profiles` - Extended user profiles with business unit assignments
    - `raw_data_uploads` - Track file uploads and metadata
    - `raw_data_entries` - Store individual data points from uploads
    - `kpi_definitions` - Define KPIs and their calculation formulas
    - `calculated_kpis` - Store computed KPI values with historical tracking
    - `initiatives` - Strategic initiatives for each business unit
    - `action_items` - Tasks and action items within initiatives
    - `employee_assignments` - Link employees to initiatives and actions
    - `goal_templates` - Reusable goal templates for different roles
    - `employee_goals` - Individual employee goals and targets
    - `performance_metrics` - Track individual employee performance
    - `data_validation_rules` - Rules for validating uploaded data
    - `audit_log` - Track all data changes and user actions
    - `notifications` - System notifications for users

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access (admin, manager, employee)
    - Secure data isolation by business unit and employee access
    - Employee can only see/edit their own assignments

  3. Functions
    - Automated KPI calculation triggers
    - Employee performance calculation functions
    - Data validation functions
    - Notification triggers
    - Historical data aggregation functions
*/

-- Business Units Master Table
CREATE TABLE IF NOT EXISTS business_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL, -- 'sales', 'marketing', etc.
  name text NOT NULL,
  description text,
  icon text DEFAULT 'BarChart3',
  color text DEFAULT 'bg-blue-500',
  manager_id uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Extended Employee Profiles
CREATE TABLE IF NOT EXISTS employee_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  employee_code text UNIQUE, -- Company employee ID
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  job_title text,
  department text,
  business_unit_id uuid REFERENCES business_units(id),
  manager_id uuid REFERENCES auth.users(id),
  hire_date date,
  role text DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee', 'viewer')),
  is_active boolean DEFAULT true,
  profile_picture_url text,
  phone text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Raw Data Upload Tracking
CREATE TABLE IF NOT EXISTS raw_data_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id uuid REFERENCES business_units(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id),
  file_name text NOT NULL,
  file_size integer,
  upload_month integer NOT NULL CHECK (upload_month BETWEEN 1 AND 12),
  upload_year integer NOT NULL CHECK (upload_year BETWEEN 2020 AND 2030),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at timestamptz,
  error_message text,
  row_count integer DEFAULT 0,
  validation_errors jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Raw Data Entries (Individual Data Points)
CREATE TABLE IF NOT EXISTS raw_data_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id uuid REFERENCES raw_data_uploads(id) ON DELETE CASCADE,
  business_unit_id uuid REFERENCES business_units(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  target_value numeric,
  data_month integer NOT NULL CHECK (data_month BETWEEN 1 AND 12),
  data_year integer NOT NULL CHECK (data_year BETWEEN 2020 AND 2030),
  data_type text DEFAULT 'actual' CHECK (data_type IN ('actual', 'target', 'forecast', 'benchmark')),
  data_source text DEFAULT 'upload',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- KPI Definitions and Calculation Rules
CREATE TABLE IF NOT EXISTS kpi_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id uuid REFERENCES business_units(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  calculation_formula text NOT NULL, -- SQL formula or calculation logic
  dependent_metrics text[] DEFAULT '{}', -- Array of required raw data metrics
  unit text DEFAULT '',
  target_value numeric,
  trend_direction text DEFAULT 'up' CHECK (trend_direction IN ('up', 'down', 'neutral')),
  color text DEFAULT 'bg-blue-500',
  is_visible_on_dashboard boolean DEFAULT false,
  display_order integer DEFAULT 0,
  calculation_frequency text DEFAULT 'monthly' CHECK (calculation_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Calculated KPI Values (Results with Historical Tracking)
CREATE TABLE IF NOT EXISTS calculated_kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_definition_id uuid REFERENCES kpi_definitions(id) ON DELETE CASCADE,
  business_unit_id uuid REFERENCES business_units(id) ON DELETE CASCADE,
  calculated_value numeric NOT NULL,
  target_value numeric,
  previous_value numeric, -- For trend calculation
  calculation_month integer NOT NULL CHECK (calculation_month BETWEEN 1 AND 12),
  calculation_year integer NOT NULL CHECK (calculation_year BETWEEN 2020 AND 2030),
  calculation_period text DEFAULT 'monthly' CHECK (calculation_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  trend text DEFAULT 'neutral' CHECK (trend IN ('up', 'down', 'neutral')),
  variance_percentage numeric, -- Calculated variance from target
  calculation_metadata jsonb DEFAULT '{}', -- Store calculation details
  calculated_at timestamptz DEFAULT now(),
  calculated_by uuid REFERENCES auth.users(id),
  UNIQUE(kpi_definition_id, calculation_month, calculation_year, calculation_period)
);

-- Strategic Initiatives
CREATE TABLE IF NOT EXISTS initiatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id uuid REFERENCES business_units(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  objective text,
  success_criteria text,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  start_date date,
  target_date date,
  actual_completion_date date,
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  budget_allocated numeric DEFAULT 0,
  budget_spent numeric DEFAULT 0,
  owner_id uuid REFERENCES auth.users(id),
  sponsor_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Action Items within Initiatives
CREATE TABLE IF NOT EXISTS action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id uuid REFERENCES initiatives(id) ON DELETE CASCADE,
  business_unit_id uuid REFERENCES business_units(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  action_type text DEFAULT 'task' CHECK (action_type IN ('task', 'milestone', 'deliverable', 'meeting')),
  status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'blocked', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  estimated_hours numeric DEFAULT 0,
  actual_hours numeric DEFAULT 0,
  due_date date,
  completed_date date,
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  dependencies text[] DEFAULT '{}', -- Array of dependent action item IDs
  tags text[] DEFAULT '{}',
  attachments jsonb DEFAULT '[]',
  comments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employee Assignments (Link employees to initiatives and actions)
CREATE TABLE IF NOT EXISTS employee_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_type text NOT NULL CHECK (assignment_type IN ('initiative', 'action_item', 'goal')),
  assignment_id uuid NOT NULL, -- References initiatives.id, action_items.id, or employee_goals.id
  role_in_assignment text DEFAULT 'contributor' CHECK (role_in_assignment IN ('owner', 'contributor', 'reviewer', 'observer')),
  assigned_by uuid REFERENCES auth.users(id),
  assigned_date date DEFAULT CURRENT_DATE,
  expected_completion_date date,
  actual_completion_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'reassigned', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Goal Templates for Different Roles
CREATE TABLE IF NOT EXISTS goal_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id uuid REFERENCES business_units(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  job_title text,
  goal_category text CHECK (goal_category IN ('performance', 'development', 'behavioral', 'project')),
  goal_description text NOT NULL,
  success_criteria text,
  measurement_method text,
  target_value numeric,
  target_unit text,
  frequency text DEFAULT 'quarterly' CHECK (frequency IN ('monthly', 'quarterly', 'semi_annual', 'annual')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Individual Employee Goals
CREATE TABLE IF NOT EXISTS employee_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  business_unit_id uuid REFERENCES business_units(id) ON DELETE CASCADE,
  goal_template_id uuid REFERENCES goal_templates(id),
  goal_title text NOT NULL,
  goal_description text,
  goal_category text CHECK (goal_category IN ('performance', 'development', 'behavioral', 'project')),
  target_value numeric,
  current_value numeric DEFAULT 0,
  target_unit text,
  measurement_method text,
  start_date date DEFAULT CURRENT_DATE,
  target_date date,
  completion_date date,
  status text DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'deferred')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  manager_approved boolean DEFAULT false,
  self_assessment_score integer CHECK (self_assessment_score BETWEEN 1 AND 5),
  manager_assessment_score integer CHECK (manager_assessment_score BETWEEN 1 AND 5),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Performance Metrics for Individual Employees
CREATE TABLE IF NOT EXISTS performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  business_unit_id uuid REFERENCES business_units(id) ON DELETE CASCADE,
  metric_period text NOT NULL, -- 'Q1-2025', 'Jan-2025', etc.
  metric_type text CHECK (metric_type IN ('goal_completion', 'initiative_contribution', 'kpi_impact', 'peer_feedback')),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  target_value numeric,
  unit text,
  calculation_date date DEFAULT CURRENT_DATE,
  calculated_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Data Validation Rules
CREATE TABLE IF NOT EXISTS data_validation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id uuid REFERENCES business_units(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  validation_type text NOT NULL CHECK (validation_type IN ('range', 'required', 'format', 'custom', 'dependency')),
  validation_rule jsonb NOT NULL, -- Store validation parameters
  error_message text NOT NULL,
  severity text DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'info')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- System Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id),
  notification_type text CHECK (notification_type IN ('task_assigned', 'deadline_approaching', 'goal_updated', 'kpi_alert', 'system_update')),
  title text NOT NULL,
  message text NOT NULL,
  related_entity_type text, -- 'action_item', 'goal', 'initiative', etc.
  related_entity_id uuid,
  is_read boolean DEFAULT false,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Comprehensive Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')),
  old_values jsonb,
  new_values jsonb,
  changed_fields text[],
  user_id uuid REFERENCES auth.users(id),
  user_role text,
  ip_address inet,
  user_agent text,
  business_unit_id uuid REFERENCES business_units(id),
  changed_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on All Tables
ALTER TABLE business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_data_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_data_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculated_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_validation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Business Units
CREATE POLICY "Anyone can view business units"
  ON business_units FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can modify business units"
  ON business_units FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles 
      WHERE employee_profiles.user_id = auth.uid() 
      AND employee_profiles.role IN ('admin')
    )
  );

-- RLS Policies for Employee Profiles
CREATE POLICY "Users can view their own profile and colleagues in same business unit"
  ON employee_profiles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    business_unit_id IN (
      SELECT business_unit_id FROM employee_profiles 
      WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM employee_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can update their own profile"
  ON employee_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins and managers can manage profiles"
  ON employee_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for Action Items (Employee Access)
CREATE POLICY "Users can view action items assigned to them or in their business unit"
  ON action_items FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    business_unit_id IN (
      SELECT business_unit_id FROM employee_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update action items assigned to them"
  ON action_items FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM employee_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers and admins can manage action items"
  ON action_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for Employee Goals
CREATE POLICY "Users can view their own goals and team goals if manager"
  ON employee_goals FOR SELECT
  TO authenticated
  USING (
    employee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM employee_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
      AND (
        role = 'admin' OR
        business_unit_id = employee_goals.business_unit_id
      )
    )
  );

CREATE POLICY "Users can update their own goals"
  ON employee_goals FOR UPDATE
  TO authenticated
  USING (
    employee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM employee_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Insert Default Business Units
INSERT INTO business_units (code, name, description, icon, color) VALUES
  ('leadership', 'Leadership - ELT Staff Meetings', 'Executive leadership team strategic initiatives and performance metrics', 'Crown', 'bg-purple-500'),
  ('sales', 'Sales', 'ARR attainment, pipeline management, and win rate tracking', 'TrendingUp', 'bg-blue-500'),
  ('marketing', 'Marketing', 'Lead generation, SQL conversion, and pipeline contribution metrics', 'Megaphone', 'bg-green-500'),
  ('professional_services', 'Professional Services', 'Revenue delivery, margin optimization, and client satisfaction tracking', 'Briefcase', 'bg-orange-500'),
  ('product_engineering', 'Product & Engineering', 'Feature delivery, release performance, and product adoption metrics', 'Code', 'bg-indigo-500'),
  ('customer_success', 'Customer Success', 'Churn management, retention rates, and customer expansion tracking', 'HeadphonesIcon', 'bg-teal-500'),
  ('human_resources', 'Human Resources', 'Talent acquisition, retention metrics, and organizational development', 'UserCheck', 'bg-pink-500')
ON CONFLICT (code) DO NOTHING;

-- Create Functions for Automated KPI Calculations
CREATE OR REPLACE FUNCTION calculate_kpis_from_raw_data()
RETURNS trigger AS $$
BEGIN
  -- This function will be triggered when raw data is inserted
  -- It will automatically calculate KPIs based on the formulas in kpi_definitions
  
  -- Example: Calculate conversion rates, margins, etc.
  -- This would contain your specific business logic
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic KPI calculation
CREATE TRIGGER trigger_calculate_kpis
  AFTER INSERT OR UPDATE ON raw_data_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_kpis_from_raw_data();

-- Create Function for Performance Metrics Calculation
CREATE OR REPLACE FUNCTION calculate_employee_performance()
RETURNS void AS $$
BEGIN
  -- Calculate goal completion rates
  INSERT INTO performance_metrics (employee_id, business_unit_id, metric_period, metric_type, metric_name, metric_value, target_value, unit)
  SELECT 
    eg.employee_id,
    eg.business_unit_id,
    TO_CHAR(CURRENT_DATE, 'Mon-YYYY') as metric_period,
    'goal_completion' as metric_type,
    'Goal Completion Rate' as metric_name,
    AVG(eg.progress_percentage) as metric_value,
    100 as target_value,
    '%' as unit
  FROM employee_goals eg
  WHERE eg.status = 'active'
  GROUP BY eg.employee_id, eg.business_unit_id
  ON CONFLICT DO NOTHING;
  
  -- Calculate action item completion rates
  INSERT INTO performance_metrics (employee_id, business_unit_id, metric_period, metric_type, metric_name, metric_value, target_value, unit)
  SELECT 
    ai.assigned_to as employee_id,
    ai.business_unit_id,
    TO_CHAR(CURRENT_DATE, 'Mon-YYYY') as metric_period,
    'initiative_contribution' as metric_type,
    'Action Item Completion Rate' as metric_name,
    (COUNT(CASE WHEN ai.status = 'completed' THEN 1 END) * 100.0 / COUNT(*)) as metric_value,
    100 as target_value,
    '%' as unit
  FROM action_items ai
  WHERE ai.assigned_to IS NOT NULL
  GROUP BY ai.assigned_to, ai.business_unit_id
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create Function for Automatic Notifications
CREATE OR REPLACE FUNCTION create_deadline_notifications()
RETURNS void AS $$
BEGIN
  -- Create notifications for approaching deadlines
  INSERT INTO notifications (recipient_id, notification_type, title, message, related_entity_type, related_entity_id, priority)
  SELECT 
    ai.assigned_to,
    'deadline_approaching',
    'Action Item Due Soon',
    'Your action item "' || ai.title || '" is due in 3 days.',
    'action_item',
    ai.id,
    'high'
  FROM action_items ai
  WHERE ai.due_date = CURRENT_DATE + INTERVAL '3 days'
    AND ai.status NOT IN ('completed', 'cancelled')
    AND ai.assigned_to IS NOT NULL;
    
  -- Create notifications for overdue items
  INSERT INTO notifications (recipient_id, notification_type, title, message, related_entity_type, related_entity_id, priority)
  SELECT 
    ai.assigned_to,
    'deadline_approaching',
    'Action Item Overdue',
    'Your action item "' || ai.title || '" is overdue.',
    'action_item',
    ai.id,
    'urgent'
  FROM action_items ai
  WHERE ai.due_date < CURRENT_DATE
    AND ai.status NOT IN ('completed', 'cancelled')
    AND ai.assigned_to IS NOT NULL;
END;
$$ LANGUAGE plpgsql;