// Application constants

export const APP_CONFIG = {
  name: "One Dashboard",
  version: "1.0.0",
  description:
    "Comprehensive business dashboard for tracking KPIs and initiatives",
  releaseDate: "2025-02-08",
  status: "Production Ready - Version 1.0 Baseline",
} as const;

export const BUSINESS_UNITS = {
  SALES: "sales",
  MARKETING: "marketing",
  PRODUCT_ENGINEERING: "product_engineering",
  CUSTOMER_SUCCESS: "customer_success",
  HUMAN_RESOURCES: "human_resources",
  PROFESSIONAL_SERVICES: "professional_services",
} as const;

export const BUSINESS_UNIT_NAMES = {
  sales: "Sales",
  marketing: "Marketing",
  product_engineering: "Product & Engineering",
  customer_success: "Customer Success",
  human_resources: "Human Resources",
  professional_services: "Professional Services",
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
  VIEWER: "viewer",
} as const;

export const KPI_TRENDS = {
  UP: "up",
  DOWN: "down",
  NEUTRAL: "neutral",
} as const;

export const INITIATIVE_STATUS = {
  PLANNING: "planning",
  ACTIVE: "active",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export const ACTION_ITEM_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  BLOCKED: "blocked",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const CHART_COLORS = {
  PRIMARY: "#3B82F6",
  SECONDARY: "#10B981",
  WARNING: "#F59E0B",
  DANGER: "#EF4444",
  INFO: "#06B6D4",
  LIGHT: "#F3F4F6",
  DARK: "#1F2937",
} as const;

export const SUPABASE_TABLES = {
  BUSINESS_UNITS: "business_units",
  KPI_DEFINITIONS: "kpi_definitions",
  CALCULATED_KPIS: "calculated_kpis",
  INITIATIVES: "initiatives",
  ACTION_ITEMS: "action_items",
  EMPLOYEE_PROFILES: "employee_profiles",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  API: "yyyy-MM-dd",
  DATETIME: "MMM dd, yyyy HH:mm",
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  THEME: "theme",
  LANGUAGE: "language",
} as const;
