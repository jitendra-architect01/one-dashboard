import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  Building,
} from "lucide-react";

export default function SecureLoginPage() {
  const [loginType, setLoginType] = useState<"admin" | "employee">("employee");
  const [username, setUsername] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginEmployee } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let success = false;

      if (loginType === "admin") {
        success = await login(username, password);
        if (!success) {
          setError("Invalid admin credentials");
        }
      } else {
        console.log("loginEmployee", employeeCode, password);
        success = await loginEmployee(employeeCode, password);
        if (!success) {
          setError("Invalid employee credentials");
        }
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Building className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Innovapptive
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Operational Excellence Dashboard
          </h2>
          <p className="text-gray-600">
            Secure access for authorized personnel only
          </p>
        </div>

        {/* Login Type Selector */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginType("employee")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                loginType === "employee"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <User className="w-4 h-4 mr-2 inline" />
              Employee
            </button>
            <button
              type="button"
              onClick={() => setLoginType("admin")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                loginType === "admin"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Shield className="w-4 h-4 mr-2 inline" />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {loginType === "employee" ? (
              <div>
                <label
                  htmlFor="employeeCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Employee Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="employeeCode"
                    type="text"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your employee code"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Admin Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter admin username"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2 inline" />
                  Secure Login
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Demo Access Credentials:
            </h3>

            {loginType === "employee" ? (
              <div className="space-y-2 text-xs text-gray-600">
                <div className="bg-gray-50 rounded p-3">
                  <div className="font-medium text-gray-800 mb-1">
                    Employee Access:
                  </div>
                  <div>
                    <strong>John Smith:</strong> EMP001 / emp123
                  </div>
                  <div>
                    <strong>Emily Davis:</strong> EMP002 / emp123
                  </div>
                  <div>
                    <strong>David Wilson:</strong> EMP003 / emp123
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Legacy Demo Credentials */}
                <div className="bg-gray-50 rounded p-3">
                  <div className="font-medium text-gray-800 mb-1">
                    Legacy Demo Access:
                  </div>
                  <div>
                    <strong>Admin:</strong> admin@innovapptive.com / Admin123$
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">Security Notice</div>
                <div>
                  This system contains confidential business data. Unauthorized
                  access is prohibited. All activities are logged and monitored.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
