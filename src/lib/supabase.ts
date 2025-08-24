import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to call Edge Functions (handles typed response and errors)
type EdgeFunctionBody =
  | string
  | Record<string, unknown>
  | ArrayBuffer
  | Blob
  | FormData
  | ReadableStream<Uint8Array>
  | File
  | undefined;

export async function callEdgeFunction<T = unknown>(
  name: string,
  body: EdgeFunctionBody
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await supabase.functions.invoke(name, { body });
    if (error) return { data: null, error: error.message };
    return { data: data as T, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { data: null, error: message };
  }
}

// (Duplicate removed)

// Database Types
export interface BusinessUnit {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  manager_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeProfile {
  id: string;
  user_id?: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title?: string;
  department?: string;
  business_unit_id?: string;
  manager_id?: string;
  manager_email?: string;
  hire_date?: string;
  role?: "admin" | "manager" | "employee" | "viewer";
  is_active?: boolean;
  profile_picture_url?: string;
  phone?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface KPIDefinition {
  id: string;
  business_unit_id?: string;
  name: string;
  description?: string;
  calculation_formula: string;
  dependent_metrics?: string[];
  unit?: string;
  target_value?: number;
  trend_direction?: "up" | "down" | "neutral";
  color?: string;
  is_visible_on_dashboard?: boolean;
  display_order?: number;
  calculation_frequency?: "daily" | "weekly" | "monthly" | "quarterly";
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface CalculatedKPI {
  id: string;
  kpi_definition_id?: string;
  business_unit_id?: string;
  calculated_value: number;
  target_value?: number;
  previous_value?: number;
  calculation_month: number;
  calculation_year: number;
  calculation_period?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  trend?: "up" | "down" | "neutral";
  variance_percentage?: number;
  calculation_metadata?: Record<string, unknown>;
  calculated_at?: string;
  calculated_by?: string;
}

export interface Initiative {
  id: string;
  business_unit_id?: string;
  title: string;
  description?: string;
  objective?: string;
  success_criteria?: string;
  status?: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  priority?: "critical" | "high" | "medium" | "low";
  start_date?: string;
  target_date?: string;
  actual_completion_date?: string;
  completion_percentage?: number;
  budget_allocated?: number;
  budget_spent?: number;
  owner_id?: string;
  sponsor_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface ActionItem {
  id: string;
  initiative_id?: string;
  business_unit_id?: string;
  title: string;
  description?: string;
  action_type?: "task" | "milestone" | "deliverable" | "meeting";
  status?:
    | "not_started"
    | "in_progress"
    | "blocked"
    | "completed"
    | "cancelled";
  priority?: "critical" | "high" | "medium" | "low";
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  completed_date?: string;
  assigned_to?: string;
  created_by?: string;
  dependencies?: string[];
  tags?: string[];
  attachments?: Record<string, unknown>[];
  comments?: Record<string, unknown>[];
  created_at?: string;
  updated_at?: string;
}

// Core API Functions - Only what's actually used
export const businessUnitAPI = {
  getAll: () => supabase.from("business_units").select("*").order("name"),
  getById: (id: string) =>
    supabase.from("business_units").select("*").eq("id", id).single(),
};

export const employeeAPI = {
  getAll: () =>
    supabase
      .from("employee_profiles")
      .select(
        `
        *,
        business_unit:business_units(name, code)
      `
      )
      .order("last_name"),
  getById: (id: string) =>
    supabase.from("employee_profiles").select("*").eq("id", id).single(),
  create: (data: Partial<EmployeeProfile>) =>
    supabase.from("employee_profiles").insert(data).select().single(),
  update: (id: string, data: Partial<EmployeeProfile>) =>
    supabase
      .from("employee_profiles")
      .update(data)
      .eq("id", id)
      .select()
      .single(),
  delete: (id: string) =>
    supabase.from("employee_profiles").delete().eq("id", id),
};

export const kpiAPI = {
  getDefinitions: (businessUnitId?: string) => {
    let query = supabase
      .from("kpi_definitions")
      .select("*")
      .order("display_order");
    if (businessUnitId) {
      query = query.eq("business_unit_id", businessUnitId);
    }
    return query;
  },
  getCalculatedKPIs: (
    businessUnitId?: string,
    month?: number,
    year?: number
  ) => {
    let query = supabase
      .from("calculated_kpis")
      .select(
        `
        *,
        kpi_definition:kpi_definitions(*),
        business_unit:business_units(name, code)
      `
      )
      .order("calculated_at", { ascending: false });

    if (businessUnitId) query = query.eq("business_unit_id", businessUnitId);
    if (month) query = query.eq("calculation_month", month);
    if (year) query = query.eq("calculation_year", year);

    return query;
  },
  createDefinition: (data: Partial<KPIDefinition>) =>
    supabase.from("kpi_definitions").insert(data).select().single(),
  updateDefinition: (id: string, data: Partial<KPIDefinition>) =>
    supabase
      .from("kpi_definitions")
      .update(data)
      .eq("id", id)
      .select()
      .single(),
  toggleVisibility: (id: string, isVisible: boolean) =>
    supabase
      .from("kpi_definitions")
      .update({
        is_visible_on_dashboard: isVisible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single(),
};

export const initiativeAPI = {
  getAll: () => supabase.from("initiatives").select("*").order("created_at"),
  getByBusinessUnit: (businessUnitId: string) =>
    supabase
      .from("initiatives")
      .select("*")
      .eq("business_unit_id", businessUnitId)
      .order("created_at"),
  create: (data: Partial<Initiative>) =>
    supabase.from("initiatives").insert(data).select().single(),
  update: (id: string, data: Partial<Initiative>) =>
    supabase.from("initiatives").update(data).eq("id", id).select().single(),
  delete: (id: string) => supabase.from("initiatives").delete().eq("id", id),
};

export const actionItemAPI = {
  getAll: () => supabase.from("action_items").select("*").order("due_date"),
  getByInitiative: (initiativeId: string) =>
    supabase
      .from("action_items")
      .select("*")
      .eq("initiative_id", initiativeId)
      .order("due_date"),
  create: (data: Partial<ActionItem>) =>
    supabase.from("action_items").insert(data).select().single(),
  update: (id: string, data: Partial<ActionItem>) =>
    supabase.from("action_items").update(data).eq("id", id).select().single(),
  delete: (id: string) => supabase.from("action_items").delete().eq("id", id),
};
