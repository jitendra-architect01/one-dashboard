import React, { useState } from "react";
import {
  Key,
  Save,
  Eye,
  EyeOff,
  Shield,
  Users,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface AdminUser {
  id: string;
  username: string;
  role: "admin" | "viewer";
}

interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  business_unit_name: string;
}

export default function PasswordManagementPage() {
  const [activeTab, setActiveTab] = useState<"admin" | "employee">("admin");
  const [showPasswords, setShowPasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [passwords, setPasswords] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Mock data - in production, this would come from your auth system
  const adminUsers: AdminUser[] = [
    { id: "1", username: "admin", role: "admin" },
    { id: "2", username: "manager", role: "admin" },
    { id: "3", username: "viewer", role: "viewer" },
  ];

  const employees: Employee[] = [
    {
      id: "1",
      employee_code: "EMP001",
      first_name: "John",
      last_name: "Smith",
      email: "john.smith@company.com",
      designation: "Sales Manager",
      business_unit_name: "Sales",
    },
    {
      id: "2",
      employee_code: "EMP002",
      first_name: "Emily",
      last_name: "Davis",
      email: "emily.davis@company.com",
      designation: "Marketing Specialist",
      business_unit_name: "Marketing",
    },
    {
      id: "3",
      employee_code: "EMP003",
      first_name: "David",
      last_name: "Wilson",
      email: "david.wilson@company.com",
      designation: "Software Engineer",
      business_unit_name: "Product & Engineering",
    },
  ];

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handlePasswordChange = (userId: string, newPassword: string) => {
    setPasswords((prev) => ({
      ...prev,
      [userId]: newPassword,
    }));
  };

  const saveAdminPassword = async (userId: string, username: string) => {
    const newPassword = passwords[userId];
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    try {
      // In production, this would call your auth API
      console.log(`Updating admin password for ${username}: ${newPassword}`);

      setSuccessMessage(`Password updated successfully for ${username}`);
      setErrorMessage("");

      // Clear the password field
      setPasswords((prev) => ({
        ...prev,
        [userId]: "",
      }));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to update password. Please try again.");
    }
  };

  const saveEmployeePassword = async (
    employeeId: string,
    employeeCode: string
  ) => {
    const newPassword = passwords[employeeId];
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    try {
      // In production, this would call your auth API
      console.log(
        `Updating employee password for ${employeeCode}: ${newPassword}`
      );

      setSuccessMessage(`Password updated successfully for ${employeeCode}`);
      setErrorMessage("");

      // Clear the password field
      setPasswords((prev) => ({
        ...prev,
        [employeeId]: "",
      }));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to update password. Please try again.");
    }
  };

  const generateRandomPassword = (userId: string) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handlePasswordChange(userId, password);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center mr-4">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Password Management
            </h1>
            <p className="text-lg text-gray-600">
              Manage passwords for admin users and employees
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("admin")}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === "admin"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Users</span>
            </button>
            <button
              onClick={() => setActiveTab("employee")}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === "employee"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Employees</span>
            </button>
          </nav>
        </div>

        {/* Admin Users Tab */}
        {activeTab === "admin" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Admin User Passwords
              </h2>

              <div className="space-y-6">
                {adminUsers.map((user) => (
                  <div
                    key={user.id}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {user.username}
                          </h3>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords[user.id] ? "text" : "password"}
                            value={passwords[user.id] || ""}
                            onChange={(e) =>
                              handlePasswordChange(user.id, e.target.value)
                            }
                            className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Enter new password"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                            <button
                              type="button"
                              onClick={() => generateRandomPassword(user.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              title="Generate random password"
                            >
                              Gen
                            </button>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(user.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords[user.id] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() =>
                            saveAdminPassword(user.id, user.username)
                          }
                          disabled={!passwords[user.id]}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Save className="w-4 h-4 mr-2 inline" />
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === "employee" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Employee Passwords
              </h2>

              <div className="space-y-6">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {employee.first_name.charAt(0)}
                            {employee.last_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </h3>
                          <div className="text-sm text-gray-600">
                            {employee.employee_code} • {employee.designation}
                          </div>
                          <div className="text-xs text-gray-500">
                            {employee.business_unit_name} • {employee.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={
                              showPasswords[employee.id] ? "text" : "password"
                            }
                            value={passwords[employee.id] || ""}
                            onChange={(e) =>
                              handlePasswordChange(employee.id, e.target.value)
                            }
                            className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter new password"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                            <button
                              type="button"
                              onClick={() =>
                                generateRandomPassword(employee.id)
                              }
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              title="Generate random password"
                            >
                              Gen
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                togglePasswordVisibility(employee.id)
                              }
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords[employee.id] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() =>
                            saveEmployeePassword(
                              employee.id,
                              employee.employee_code
                            )
                          }
                          disabled={!passwords[employee.id]}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Save className="w-4 h-4 mr-2 inline" />
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Password Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            Password Requirements
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Minimum 6 characters (8+ recommended for production)</li>
            <li>• Use a mix of letters, numbers, and special characters</li>
            <li>• Avoid common passwords or personal information</li>
            <li>• Click "Gen" to generate a secure random password</li>
            <li>• Changes take effect immediately</li>
          </ul>

          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">
              Current Demo Passwords:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
              <div>
                <strong>Admin Users:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• admin: Innovation1@</li>
                  <li>• manager: manager123</li>
                  <li>• viewer: viewer123</li>
                </ul>
              </div>
              <div>
                <strong>Employees:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• EMP001: emp123</li>
                  <li>• EMP002: emp123</li>
                  <li>• EMP003: emp123</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Production Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-900 mb-3">
            Production Implementation
          </h3>
          <p className="text-sm text-yellow-800 mb-3">
            In a production environment with Supabase, password management would
            include:
          </p>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Automatic password hashing and encryption</li>
            <li>• Email notifications for password changes</li>
            <li>• Password history to prevent reuse</li>
            <li>• Forced password reset on first login</li>
            <li>• Multi-factor authentication options</li>
            <li>• Audit logging for all password changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
