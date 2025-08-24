import React from 'react';
import { Database } from 'lucide-react';
import SupabaseKPIManager from '../../components/admin/SupabaseKPIManager';

export default function SupabaseKPIAdminPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-4">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supabase KPI Administration</h1>
            <p className="text-lg text-gray-600">Manage KPIs directly from the Supabase database</p>
          </div>
        </div>

        <SupabaseKPIManager />
      </div>
    </div>
  );
}