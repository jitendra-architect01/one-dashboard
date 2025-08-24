/*
  # Employee Management System

  1. New Tables
    - `employee_profiles` (enhanced with all required fields)
    - `raw_data_uploads` (for tracking Excel uploads)
    - `raw_data_entries` (for storing uploaded employee data)
    - `data_validation_rules` (for employee data validation)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin and employee access
    - Secure employee data access

  3. Functions
    - Employee data processing function
    - Bulk employee import function
*/

-- Enhanced employee_profiles table (already exists, adding missing columns)
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employee_profiles' AND column_name = 'job_title'
  ) THEN
    ALTER TABLE employee_profiles ADD COLUMN job_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employee_profiles' AND column_name = 'department'
  ) THEN
    ALTER TABLE employee_profiles ADD COLUMN department text;
  END IF;
END $$;

-- Create employee bulk upload tracking table
CREATE TABLE IF NOT EXISTS employee_bulk_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by uuid REFERENCES auth.users(id),
  file_name text NOT NULL,
  file_size integer,
  total_records integer DEFAULT 0,
  successful_imports integer DEFAULT 0,
  failed_imports integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_summary jsonb DEFAULT '[]'::jsonb,
  validation_errors jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Enable RLS
ALTER TABLE employee_bulk_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for employee bulk uploads
CREATE POLICY "Admins can manage employee bulk uploads"
  ON employee_bulk_uploads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to process employee bulk data
CREATE OR REPLACE FUNCTION process_employee_bulk_upload(
  upload_id uuid,
  employee_data jsonb[]
) RETURNS jsonb AS $$
DECLARE
  employee_record jsonb;
  success_count integer := 0;
  error_count integer := 0;
  errors jsonb[] := '{}';
  new_employee_id uuid;
  validation_error text;
BEGIN
  -- Update upload status to processing
  UPDATE employee_bulk_uploads 
  SET status = 'processing', processed_at = now()
  WHERE id = upload_id;

  -- Process each employee record
  FOREACH employee_record IN ARRAY employee_data
  LOOP
    BEGIN
      -- Validate required fields
      IF employee_record->>'employee_id' IS NULL OR employee_record->>'employee_id' = '' THEN
        error_count := error_count + 1;
        errors := errors || jsonb_build_object(
          'row', array_length(errors, 1) + 1,
          'error', 'Employee ID is required',
          'data', employee_record
        );
        CONTINUE;
      END IF;

      IF employee_record->>'email' IS NULL OR employee_record->>'email' = '' THEN
        error_count := error_count + 1;
        errors := errors || jsonb_build_object(
          'row', array_length(errors, 1) + 1,
          'error', 'Email is required',
          'data', employee_record
        );
        CONTINUE;
      END IF;

      -- Check for duplicate employee_id
      IF EXISTS (SELECT 1 FROM employee_profiles WHERE employee_id = employee_record->>'employee_id') THEN
        error_count := error_count + 1;
        errors := errors || jsonb_build_object(
          'row', array_length(errors, 1) + 1,
          'error', 'Employee ID already exists',
          'data', employee_record
        );
        CONTINUE;
      END IF;

      -- Insert employee profile
      INSERT INTO employee_profiles (
        employee_id,
        first_name,
        last_name,
        email,
        job_title,
        department,
        business_unit_id,
        manager_id,
        hire_date,
        role,
        phone,
        location,
        is_active
      ) VALUES (
        employee_record->>'employee_id',
        employee_record->>'first_name',
        employee_record->>'last_name',
        employee_record->>'email',
        employee_record->>'job_title',
        employee_record->>'department',
        (SELECT id FROM business_units WHERE code = employee_record->>'business_unit_code' LIMIT 1),
        (SELECT id FROM auth.users WHERE email = employee_record->>'manager_email' LIMIT 1),
        COALESCE((employee_record->>'hire_date')::date, CURRENT_DATE),
        COALESCE(employee_record->>'role', 'employee'),
        employee_record->>'phone',
        employee_record->>'location',
        COALESCE((employee_record->>'is_active')::boolean, true)
      ) RETURNING id INTO new_employee_id;

      success_count := success_count + 1;

    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      errors := errors || jsonb_build_object(
        'row', array_length(errors, 1) + 1,
        'error', SQLERRM,
        'data', employee_record
      );
    END;
  END LOOP;

  -- Update upload record with results
  UPDATE employee_bulk_uploads 
  SET 
    status = CASE WHEN error_count = 0 THEN 'completed' ELSE 'failed' END,
    total_records = array_length(employee_data, 1),
    successful_imports = success_count,
    failed_imports = error_count,
    validation_errors = array_to_json(errors)::jsonb
  WHERE id = upload_id;

  -- Return summary
  RETURN jsonb_build_object(
    'success_count', success_count,
    'error_count', error_count,
    'errors', array_to_json(errors)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create employee data validation rules
INSERT INTO data_validation_rules (business_unit_id, metric_name, validation_type, validation_rule, error_message, severity) VALUES
(NULL, 'employee_id', 'required', '{"required": true}', 'Employee ID is required', 'error'),
(NULL, 'email', 'format', '{"pattern": "^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$"}', 'Invalid email format', 'error'),
(NULL, 'first_name', 'required', '{"required": true}', 'First name is required', 'error'),
(NULL, 'last_name', 'required', '{"required": true}', 'Last name is required', 'error'),
(NULL, 'role', 'custom', '{"allowed_values": ["admin", "manager", "employee", "viewer"]}', 'Invalid role specified', 'warning')
ON CONFLICT DO NOTHING;