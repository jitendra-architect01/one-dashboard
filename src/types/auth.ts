export interface EmployeeProfile {
  id: string;
  user_id?: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  designation: string;
  business_unit_id: string;
  business_units: { name: string };
  department: string;
  hire_date: string;
  role: string;
  manager_id: string | null;
  manager_email: string;
  team: string;
  phone: string;
  location: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  username: string;
  role: "admin" | "viewer";
  employeeProfile?: EmployeeProfile;
}

export interface AdminUser {
  id: string;
  username: string;
  role: "admin" | "viewer";
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  loginEmployee: (employeeCode: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  updateAdminPassword: (
    userId: string,
    newPassword: string
  ) => Promise<boolean>;
  updateEmployeePassword: (
    employeeId: string,
    newPassword: string
  ) => Promise<boolean>;
  getAdminUsers: () => Promise<AdminUser[]>;
  getEmployees: () => Promise<EmployeeProfile[]>;
  // Centralized employee profile APIs
  listEmployeeProfiles: () => Promise<EmployeeProfile[]>;
  createEmployeeProfile: (
    payload: Record<string, unknown>
  ) => Promise<EmployeeProfile | null>;
  updateEmployeeProfile: (
    id: string,
    updates: Record<string, unknown>
  ) => Promise<EmployeeProfile | null>;
  deleteEmployeeProfile: (id: string) => Promise<boolean>;
  getEmployeeProfileById: (id: string) => Promise<EmployeeProfile | null>;
}
