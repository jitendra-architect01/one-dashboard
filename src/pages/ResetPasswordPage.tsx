import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const [emailParam] = useState<string | null>(
    new URLSearchParams(window.location.search).get("email")
  );
  const [employeeCodeParam] = useState<string | null>(
    new URLSearchParams(window.location.search).get("employee_code")
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Optional: verify that the recovery session exists
    // Supabase JS v2 will set the session automatically when the link is opened
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMessage(
          "Open this page through the password reset link sent to your email to proceed."
        );
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setMessage("Your password has been updated. You can now sign in.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Reset Password
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Follow the reset link from your email, then set a new password below.
        </p>

        {(emailParam || employeeCodeParam) && (
          <div className="mb-4 text-xs text-gray-500">
            {emailParam && <div>Email: {emailParam}</div>}
            {employeeCodeParam && <div>Employee Code: {employeeCodeParam}</div>}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded bg-green-50 text-green-800 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Updating..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
