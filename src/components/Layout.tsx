import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  TrendingUp,
  Megaphone,
  Briefcase,
  Code,
  HeadphonesIcon,
  UserCheck,
  Menu,
  X,
  Settings,
  LogOut,
  BarChart3,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const businessUnits = [
  {
    id: "sales",
    name: "Sales",
    icon: TrendingUp,
    color: "bg-blue-600",
    path: "/sales",
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: Megaphone,
    color: "bg-green-600",
    path: "/marketing",
  },
  {
    id: "professional-services",
    name: "Professional Services",
    icon: Briefcase,
    color: "bg-orange-600",
    path: "/professional-services",
  },
  {
    id: "product-engineering",
    name: "Product & Engineering",
    icon: Code,
    color: "bg-indigo-600",
    path: "/product-engineering",
  },
  {
    id: "customer-success",
    name: "Customer Success",
    icon: HeadphonesIcon,
    color: "bg-teal-600",
    path: "/customer-success",
  },
  {
    id: "human-resources",
    name: "Human Resources",
    icon: UserCheck,
    color: "bg-pink-600",
    path: "/human-resources",
  },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin, isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Innovapptive
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {/* Employee Portal Link - Show for non-authenticated users */}

            <Link
              to="/"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === "/"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-md flex items-center justify-center mr-3">
                <Users className="w-4 h-4 text-white" />
              </div>
              Dashboard Overview
            </Link>

            <Link
              to="/analytics"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === "/analytics"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-md flex items-center justify-center mr-3">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              Advanced Analytics
            </Link>

            {/* Employee Dashboard - Show for all authenticated users */}
            {isAuthenticated && (
              <Link
                to="/employee-dashboard"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  location.pathname === "/employee-dashboard"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-500 rounded-md flex items-center justify-center mr-3">
                  <Users className="w-4 h-4 text-white" />
                </div>
                My Dashboard
              </Link>
            )}

            {businessUnits.map((unit) => {
              const IconComponent = unit.icon;
              const isActive = location.pathname === unit.path;

              return (
                <Link
                  key={unit.id}
                  to={unit.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div
                    className={`w-6 h-6 ${unit.color} rounded-md flex items-center justify-center mr-3`}
                  >
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  {unit.name}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-between px-4 mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Administration
                </p>
              </div>

              {isAuthenticated && isAdmin
                ? businessUnits.map((unit) => {
                    const adminPath = `${unit.path}/admin`;
                    const isActive = location.pathname === adminPath;

                    return (
                      <Link
                        key={`${unit.id}-admin`}
                        to={adminPath}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          isActive
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 ${unit.color} rounded-md flex items-center justify-center mr-3`}
                        >
                          <Settings className="w-4 h-4 text-white" />
                        </div>
                        {unit.name} Admin
                      </Link>
                    );
                  })
                : null}

              {/* Company-wide KPI Admin */}
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin/company-kpis"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === "/admin/company-kpis"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center mr-3">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  Company-wide KPI Admin
                </Link>
              )}

              {/* Trendline Data Admin */}
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin/trendlines"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === "/admin/trendlines"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center mr-3">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  Trendline Data Admin
                </Link>
              )}

              {/* Excel Data Integration */}
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin/excel-upload"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === "/admin/excel-upload"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-md flex items-center justify-center mr-3">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  Excel Data Upload
                </Link>
              )}

              {/* Employee Management */}
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin/employees"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === "/admin/employees"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center mr-3">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  Employee Management
                </Link>
              )}

              {/* Data Flow Explanation - Moved to Admin section */}
              {isAuthenticated && isAdmin && (
                <Link
                  to="/data-flow"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === "/data-flow"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-md flex items-center justify-center mr-3">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  Data Flow Explanation
                </Link>
              )}

              {/* Password Management */}
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin/password-management"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === "/admin/password-management"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-md flex items-center justify-center mr-3">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  Password Management
                </Link>
              )}

              {/* Supabase KPI Admin */}
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin/supabase-kpis"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === "/admin/supabase-kpis"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center mr-3">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  Supabase KPI Admin
                </Link>
              )}

              {isAuthenticated && isAdmin ? null : isAuthenticated &&
                !isAdmin ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Admin role required
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Please login for admin access
                </div>
              )}
            </div>

            {/* User Info and Logout - Only show when authenticated */}
            {isAuthenticated && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {user?.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user?.username}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {user?.role}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Operational Excellence Dashboard
          </h1>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
