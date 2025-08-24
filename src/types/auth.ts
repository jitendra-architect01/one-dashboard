export interface EmployeeProfile {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  business_unit_id: string;
  business_unit_name: string;
  team: string;
  skill: string;
  manager_email: string;
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

export interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  business_unit_name: string;
}

export interface NewEmployeeData {
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  business_unit_id: string;
  business_unit_name: string;
  team: string;
  skill: string;
  manager_email: string;
  role?: string;
  employee_code?: string;
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
  getEmployees: () => Promise<Employee[]>;
  addNewEmployee: (
    employeeData: NewEmployeeData,
    initialPassword: string
  ) => Promise<boolean>;
  // Centralized employee profile APIs
  listEmployeeProfiles: () => Promise<any[]>;
  createEmployeeProfile: (
    payload: Record<string, unknown>
  ) => Promise<any | null>;
  updateEmployeeProfile: (
    id: string,
    updates: Record<string, unknown>
  ) => Promise<any | null>;
  deleteEmployeeProfile: (id: string) => Promise<boolean>;
  getEmployeeProfileById: (id: string) => Promise<any | null>;
}
