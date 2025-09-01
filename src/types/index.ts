// Global TypeScript type definitions
// Re-export types from specific modules for convenience

export type {
  KPIData,
  ActionItemData,
  InitiativeData,
  BusinessUnitData,
  BusinessUnitSummary,
} from "../hooks/useSupabaseData";

export type { User, EmployeeProfile, AdminUser, AuthContextType } from "./auth";

export type { DataContextType } from "./data";

// Additional utility types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Chart and visualization types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterParams {
  department?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string;
  search?: string;
}
