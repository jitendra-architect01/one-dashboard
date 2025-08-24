import React, { useState } from "react";
import { useSupabaseData } from "../../hooks/useSupabaseData";
import { Eye, EyeOff, Edit, Save, X, Loader, RefreshCw } from "lucide-react";

export default function SupabaseKPIManager() {
  const { businessUnits, loading, error, refetch } = useSupabaseData();

  // Flatten KPIs from all business units
  const kpis = businessUnits.flatMap((bu) =>
    bu.kpis.map((kpi) => ({
      ...kpi,
      businessUnit: bu.code,
      businessUnitName: bu.name,
    }))
  );
  const [editingKPI, setEditingKPI] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const handleEdit = (kpiId: string, currentValue: number) => {
    setEditingKPI(kpiId);
    setEditValue(currentValue);
  };

  const handleSave = async (kpiId: string) => {
    // TODO: Implement KPI value update
    console.log("Updating KPI value:", kpiId, editValue);
    setEditingKPI(null);
  };

  const handleCancel = () => {
    setEditingKPI(null);
    setEditValue(0);
  };

  const getStatusColor = (kpi: { current: number; target: number }) => {
    const percentage = (kpi.current / kpi.target) * 100;
    if (percentage >= 100) return "text-green-600 bg-green-50";
    if (percentage >= 80) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          Loading KPIs from Supabase...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-red-900">
              Error Loading KPIs
            </h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Group KPIs by business unit
  const kpisByUnit = kpis.reduce((acc, kpi) => {
    if (!acc[kpi.businessUnit]) {
      acc[kpi.businessUnit] = [];
    }
    acc[kpi.businessUnit].push(kpi);
    return acc;
  }, {} as Record<string, typeof kpis>);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Supabase KPI Manager
          </h2>
          <p className="text-gray-600">
            Manage KPIs directly from the Supabase database
          </p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {Object.entries(kpisByUnit).map(([unitCode, unitKPIs]) => (
        <div
          key={unitCode}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {unitKPIs[0]?.businessUnitName} ({unitKPIs.length} KPIs)
          </h3>

          <div className="space-y-4">
            {unitKPIs.map((kpi) => {
              const percentage = (kpi.current / kpi.target) * 100;
              const isEditing = editingKPI === kpi.id;

              return (
                <div
                  key={kpi.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${kpi.color}`} />
                        <h4 className="font-medium text-gray-900">
                          {kpi.name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            kpi
                          )}`}
                        >
                          {percentage.toFixed(0)}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <span>Current:</span>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) =>
                                setEditValue(parseFloat(e.target.value) || 0)
                              }
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-center"
                              step="0.01"
                            />
                          ) : (
                            <span className="font-medium">
                              {kpi.current.toLocaleString()}
                              {kpi.unit}
                            </span>
                          )}
                        </div>
                        <div>
                          <span>Target:</span>
                          <span className="font-medium ml-2">
                            {kpi.target.toLocaleString()}
                            {kpi.unit}
                          </span>
                        </div>
                        <div>
                          <span>Period:</span>
                          <span className="font-medium ml-2">{kpi.period}</span>
                        </div>
                        <div>
                          <span>Trend:</span>
                          <span className="font-medium ml-2 capitalize">
                            {kpi.trend}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(kpi.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(kpi.id, kpi.current)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          // TODO: Implement KPI visibility toggle
                          console.log("Toggling KPI visibility:", kpi.id);
                        }}
                        className={`p-2 rounded-md ${
                          kpi.isVisibleOnDashboard
                            ? "text-green-600 hover:bg-green-50"
                            : "text-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        {kpi.isVisibleOnDashboard ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
