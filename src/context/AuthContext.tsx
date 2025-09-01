import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthService } from "../services/authService";
import LoadingSpinner from "../components/LoadingSpinner";
import { User, Employee, AuthContextType } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-login on app start
  useEffect(() => {
    const performAutoLogin = async () => {
      try {
        setLoading(true);
        const user = await AuthService.autoLogin();
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error("Auto-login failed:", error);
        AuthService.clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    performAutoLogin();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const user = await AuthService.loginAdmin(username, password);
      if (user) {
        setUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const loginEmployee = async (
    employeeCode: string,
    password: string
  ): Promise<boolean> => {
    try {
      const user = await AuthService.loginEmployee(employeeCode, password);
      if (user) {
        setUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Employee login failed:", error);
      return false;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isEmployee = !!user?.employeeProfile;

  const updateAdminPassword = async (
    userId: string,
    newPassword: string
  ): Promise<boolean> => {
    return await AuthService.updateAdminPassword(userId, newPassword);
  };

  const getEmployees = async (): Promise<EmployeeProfile[]> => {
    return await AuthService.getEmployees();
  };

  // Centralized employee profile APIs
  const listEmployeeProfiles = async () => {
    return await AuthService.listEmployeeProfiles();
  };

  const createEmployeeProfile = async (payload: Record<string, unknown>) => {
    return await AuthService.createEmployeeProfile(payload);
  };

  const updateEmployeeProfile = async (
    id: string,
    updates: Record<string, unknown>
  ) => {
    return await AuthService.updateEmployeeProfile(id, updates);
  };

  const deleteEmployeeProfile = async (id: string) => {
    return await AuthService.deleteEmployeeProfile(id);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <AuthContext.Provider
        value={{
          user,
          loading,
          login,
          loginEmployee,
          logout,
          isAuthenticated,
          isAdmin,
          isEmployee,
          updateAdminPassword,
          getEmployees,
        }}
      >
        <LoadingSpinner message="Checking authentication..." />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginEmployee,
        logout,
        isAuthenticated,
        isAdmin,
        isEmployee,
        updateAdminPassword,
        getEmployees,
        listEmployeeProfiles,
        createEmployeeProfile,
        updateEmployeeProfile,
        deleteEmployeeProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
