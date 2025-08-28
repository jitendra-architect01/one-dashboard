/*
  # Add KPI Categories (EPICG System)

  1. Schema Changes
    - Add `category` column to `kpi_definitions` table
    - Set default category as 'Economics' for existing KPIs
    - Add check constraint for valid categories

  2. Data Updates
    - Update existing KPIs to have 'Economics' as default category
    - Ensure all KPIs have a valid category assigned

  3. Security
    - No changes to RLS policies needed
    - Category field is part of existing KPI management permissions
*/

-- Add category column to kpi_definitions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kpi_definitions' AND column_name = 'category'
  ) THEN
    ALTER TABLE kpi_definitions ADD COLUMN category text DEFAULT 'Economics';
  END IF;
END $$;

-- Add check constraint for valid categories (EPICG)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'kpi_definitions_category_check'
  ) THEN
    ALTER TABLE kpi_definitions 
    ADD CONSTRAINT kpi_definitions_category_check 
    CHECK (category IN ('Economics', 'People', 'Innovation', 'Customer', 'Growth'));
  END IF;
END $$;

-- Update existing KPIs to have 'Economics' as default category
UPDATE kpi_definitions 
SET category = 'Economics', updated_at = now()
WHERE category IS NULL OR category = '';

-- Add index for better performance when filtering by category
CREATE INDEX IF NOT EXISTS idx_kpi_definitions_category 
ON kpi_definitions(category);

-- Add index for business unit and category combination
CREATE INDEX IF NOT EXISTS idx_kpi_definitions_bu_category 
ON kpi_definitions(business_unit_id, category);