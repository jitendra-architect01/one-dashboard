import React, { useState, useEffect } from "react";
import { AuthService } from "../../services/authService";
import { AdminUser } from "../../types/auth";
import {
  Users,
  Shield,
  Eye,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await AuthService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    setUpdating(userId);
    try {
      const success = await AuthService.promoteToAdmin(userId);
      if (success) {
        await loadUsers(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to promote user:", error);
    } finally {
      setUpdating(null);
    }
  };

  const demoteToViewer = async (userId: string) => {
    setUpdating(userId);
    try {
      const success = await AuthService.demoteToViewer(userId);
      if (success) {
        await loadUsers(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to demote user:", error);
    } finally {
      setUpdating(null);
    }
  };

  const createAdminUser = async () => {
    alert(
      "Admin user creation is not available from the client-side for security reasons.\n\n" +
        "To create admin users, please:\n" +
        "1. Use the Supabase Dashboard directly\n" +
        "2. Or contact your system administrator\n\n" +
        "You can still manage existing user roles using the promote/demote buttons below."
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              User Management
            </h2>
            <p className="text-gray-600">Manage user roles and permissions</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={createAdminUser}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Shield className="w-4 h-4" />
            <span>Admin Help</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Users ({users.length})
            </h3>
          </div>

          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.role === "admin"
                          ? "bg-gradient-to-br from-red-500 to-pink-600"
                          : "bg-gradient-to-br from-gray-400 to-gray-500"
                      }`}
                    >
                      {user.role === "admin" ? (
                        <Shield className="w-5 h-5 text-white" />
                      ) : (
                        <Eye className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        Role:{" "}
                        <span
                          className={`font-medium ${
                            user.role === "admin"
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {user.role === "viewer" ? (
                      <button
                        onClick={() => promoteToAdmin(user.id)}
                        disabled={updating === user.id}
                        className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                      >
                        {updating === user.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <ArrowUp className="w-4 h-4" />
                        )}
                        <span>Promote to Admin</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => demoteToViewer(user.id)}
                        disabled={updating === user.id}
                        className="flex items-center space-x-2 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
                      >
                        {updating === user.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                        <span>Demote to Viewer</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">Role Management</div>
            <div>
              <strong>Admin:</strong> Full access to all features including user
              management, KPI administration, and system settings.
              <br />
              <strong>Viewer:</strong> Read-only access to dashboards and
              reports. Cannot modify data or access admin features.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
