import {
  User,
  AdminUser,
  Employee,
  NewEmployeeData,
  EmployeeProfile,
} from "../types/auth";
import { supabase } from "../lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { User } from "lucide-react";

// JWT token management
const TOKEN_KEY = "dashboard_auth_token";
const USER_KEY = "dashboard_user_data";

export class AuthService {
  // JWT Token Management
  static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  static setUserData(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  static getUserData(): User | null {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static removeUserData(): void {
    localStorage.removeItem(USER_KEY);
  }

  // Check if token is valid (not expired)
  static isTokenValid(): boolean {
    // For Supabase, we'll rely on the session validation
    return true; // Supabase handles token validation
  }

  // Auto-login with stored token
  static async autoLogin(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) {
        return this.transformSupabaseUser(user);
      }
    } catch (error) {
      console.error("Auto-login failed:", error);
      this.clearAuthData();
    }

    return null;
  }

  // Clear all authentication data
  static clearAuthData(): void {
    this.removeToken();
    this.removeUserData();
  }

  // Admin login
  static async loginAdmin(
    username: string,
    password: string
  ): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });
      console.log(`logged In data `, JSON.stringify(data));
      if (error) throw error;

      const userData = this.transformSupabaseUser(data.user);
      console.log(`transformSupabaseUser userData `, JSON.stringify(userData));
      this.setToken(data.session.access_token);
      this.setUserData(userData);

      return userData;
    } catch (error) {
      console.error("Supabase login failed:", error);
      return null;
    }
  }

  // Transform Supabase user to our User interface
  private static transformSupabaseUser(supabaseUser: {
    id: string;
    email?: string;
    user_metadata?: {
      username?: string;
      role?: string;
      employeeProfile?: EmployeeProfile;
    };
  }): User {
    console.log(
      `transformSupabaseUser supabaseUser `,
      JSON.stringify(supabaseUser)
    );
    return {
      id: supabaseUser.id,
      username:
        supabaseUser.email ||
        supabaseUser.user_metadata?.username ||
        supabaseUser.id,
      role:
        (supabaseUser.user_metadata?.role as "admin" | "viewer") || "viewer",
      employeeProfile: supabaseUser.user_metadata?.employeeProfile || undefined,
    };
  }

  // Employee login
  static async loginEmployee(
    employeeCode: string,
    password: string
  ): Promise<User | null> {
    try {
      // For employee login, we'll use a custom approach
      // First, find the employee by employee code
      const { data: employeeData, error: employeeError } = await supabase
        .from("employee_profiles")
        .select("*")
        .eq("employee_code", employeeCode)
        .single();
      console.log("employeeData", JSON.stringify(employeeData));
      if (employeeError || !employeeData) {
        throw new Error("Employee not found");
      }

      // Then authenticate with Supabase using the employee's email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: employeeData.email,
        password: password,
      });

      if (error) throw error;

      // Transform to our User interface with employee profile
      const userData: User = {
        id: data.user.id,
        username: employeeCode,
        role: "viewer", // Employees have viewer role by default
        employeeProfile: {
          id: employeeData.id,
          employee_code: employeeData.employee_code,
          first_name: employeeData.first_name,
          last_name: employeeData.last_name,
          email: employeeData.email,
          designation: employeeData.designation,
          business_unit_id: employeeData.business_unit_id,
          business_unit_name: employeeData.business_unit_name,
          team: employeeData.team,
          skill: employeeData.skill,
          manager_email: employeeData.manager_email,
        },
      };

      this.setToken(data.session.access_token);
      this.setUserData(userData);

      return userData;
    } catch (error) {
      console.error("Supabase employee login failed:", error);
      return null;
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.clearAuthData();
    } catch (error) {
      console.error("Supabase logout failed:", error);
      this.clearAuthData();
    }
  }

  // Get admin users
  static async getAdminUsers(): Promise<AdminUser[]> {
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select("id, email, role")
        .eq("role", "admin");

      if (error) throw error;

      return users.map((user) => ({
        id: user.id,
        username: user.email,
        role: user.role as "admin" | "viewer",
      }));
    } catch (error) {
      console.error("Failed to fetch admin users:", error);
      return [];
    }
  }

  // Get employees
  static async getEmployees(): Promise<Employee[]> {
    try {
      const { data: employees, error } = await supabase
        .from("employees")
        .select(
          "id, employee_code, first_name, last_name, email, designation, business_unit_name"
        );

      if (error) throw error;

      return employees.map((emp) => ({
        id: emp.id,
        employee_code: emp.employee_code,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        designation: emp.designation,
        business_unit_name: emp.business_unit_name,
      }));
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      return [];
    }
  }

  // Add new employee
  static async addNewEmployee(
    employeeData: NewEmployeeData,
    initialPassword: string
  ): Promise<boolean> {
    try {
      // First, create the employee in the employees table
      const { error: employeeError } = await supabase
        .from("employees_profiles")
        .insert({
          employee_code:
            employeeData.employee_code ||
            `EMP${Date.now().toString().slice(-6)}`,
          first_name: employeeData.first_name,
          last_name: employeeData.last_name,
          email: employeeData.email,
          designation: employeeData.designation,
          business_unit_id: employeeData.business_unit_id,
          business_unit_name: employeeData.business_unit_name,
          team: employeeData.team,
          skill: employeeData.skill,
          manager_email: employeeData.manager_email,
        });

      if (employeeError) throw employeeError;

      // Then create the auth user
      const { error: authError } = await supabase.auth.admin.createUser({
        email: employeeData.email,
        password: initialPassword,
        email_confirm: true,
      });

      if (authError) throw authError;

      return true;
    } catch (error) {
      console.error("Error adding new employee:", error);
      return false;
    }
  }

  // Generate a strong temporary password used across UI and API flows
  static generateTemporaryPassword(length: number = 12): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Update admin password
  static async updateAdminPassword(
    userId: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Supabase password update failed:", error);
      return false;
    }
  }

  // Update employee password
  static async updateEmployeePassword(
    employeeId: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      // First, get the employee's email
      const { data: employee, error: employeeError } = await supabase
        .from("employees_profiles")
        .select("email")
        .eq("id", employeeId)
        .single();

      if (employeeError || !employee) {
        throw new Error("Employee not found");
      }

      // Update the password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Supabase employee password update failed:", error);
      return false;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? this.isTokenValid() : false;
  }

  // Get current user
  static getCurrentUser(): User | null {
    if (this.isAuthenticated()) {
      return this.getUserData();
    }
    return null;
  }

  // Create auth user with role metadata using ephemeral sign-up (does not affect current session)
  static async createAdminUser(
    email: string,
    password: string,
    role: string
  ): Promise<boolean> {
    try {
      const userId = await this.signUpUser(email, password, { role });
      return !!userId;
    } catch (error) {
      console.error("Failed to create auth user:", error);
      return false;
    }
  }

  // Promote user to admin
  static async promoteToAdmin(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          role: "admin",
        },
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to promote user to admin:", error);
      return false;
    }
  }

  // Demote admin to viewer
  static async demoteToViewer(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          role: "viewer",
        },
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to demote user to viewer:", error);
      return false;
    }
  }

  // Get all users with roles
  static async getAllUsers(): Promise<AdminUser[]> {
    try {
      const { data: users, error } = await supabase.auth.admin.listUsers();

      if (error) throw error;

      return users.users.map((user) => ({
        id: user.id,
        username: user.email || user.id,
        role: (user.user_metadata?.role as "admin" | "viewer") || "viewer",
      }));
    } catch (error) {
      console.error("Failed to get users:", error);
      return [];
    }
  }

  // List raw auth users (admin) with simple pagination
  static async fetchAuthUsers(
    page: number = 1,
    perPage: number = 50
  ): Promise<
    Array<{
      id: string;
      email?: string | null;
      user_metadata?: Record<string, unknown>;
    }>
  > {
    try {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) throw error;

      return (data.users || []).map((u) => ({
        id: u.id,
        email: u.email ?? null,
        user_metadata: u.user_metadata ?? {},
      }));
    } catch (error) {
      console.error("Failed to fetch auth users:", error);
      return [];
    }
  }

  // Delete an auth user by id (admin)
  static async deleteAuthUserById(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to delete auth user:", error);
      return false;
    }
  }

  // Ephemeral client sign up to avoid replacing current session
  static async signUpUser(
    email: string,
    password: string,
    userMetadata?: Record<string, unknown>
  ): Promise<string | null> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Missing Supabase env for signUp");
        return null;
      }

      const ephemeralClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      });

      const { data, error } = await ephemeralClient.auth.signUp({
        email,
        password,
        options: { data: userMetadata || {} },
      });

      if (error) {
        console.error("Error creating user via signUp:", error.message);
        return null;
      }

      return data.user?.id ?? null;
    } catch (error) {
      console.error("Error creating user in auth:", error);
      return null;
    }
  }

  // Trigger password reset email
  static async triggerPasswordReset(
    email: string,
    redirectTo?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || `${window.location.origin}/`,
      });
      if (error) {
        console.error("Error triggering password reset email:", error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error triggering password reset:", error);
      return false;
    }
  }

  // Employee profile APIs (centralized)
  static async listEmployeeProfiles(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("employee_profiles")
        .select(`*, business_units:business_units(name)`)
        .order("first_name");
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching employees:", error);
      return [];
    }
  }

  // Get a single employee profile by id
  static async getEmployeeProfileByEmployeeCode(
    code: string
  ): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from("employee_profiles")
        .select(`*`) // include BU name for UI consistency
        .eq("employee_code", code)
        .single();
      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error("Error fetching employee profile by code:", error);
      return null;
    }
  }

  static async createEmployeeProfile(
    payload: Record<string, unknown>
  ): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from("employee_profiles")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error adding employee profile:", error);
      return null;
    }
  }

  static async updateEmployeeProfile(
    id: string,
    updates: Record<string, unknown>
  ): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from("employee_profiles")
        .update(updates)
        .eq("employee_code", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating employee:", error);
      return null;
    }
  }

  static async deleteEmployeeProfile(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("employee_profiles")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting employee profile:", error);
      return false;
    }
  }
}
