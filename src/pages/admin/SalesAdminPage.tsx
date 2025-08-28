import React, { useState } from "react";
import { Plus, Edit, Trash2, BarChart3, Calendar, TrendingUp } from "lucide-react";
import { useData } from "../../context/DataContext";
import type { KPIData, InitiativeData } from "../../hooks/useSupabaseData";
import KPIForm from "../../components/admin/KPIForm";
import InitiativeForm from "../../components/admin/InitiativeForm";

export default function SalesAdminPage() {
  const [activeTab, setActiveTab] = useState<"kpis" | "initiatives">("kpis");
  const [showKPIForm, setShowKPIForm] = useState(false);
  const [showInitiativeForm, setShowInitiativeForm] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPIData | null>(null);
  const [editingInitiative, setEditingInitiative] = useState<InitiativeData | null>(null);
  const { businessUnits, addKPI, updateKPI, deleteKPI, addInitiative, updateInitiative, deleteInitiative } = useData();

  const salesUnit = businessUnits["sales"];
  const kpis = salesUnit?.kpis || [];
  const initiatives = salesUnit?.initiatives || [];

  const handleSaveKPI = (kpiData: Partial<KPIData>) => {
    if (editingKPI) {
      updateKPI("sales", editingKPI.id, kpiData);
      setEditingKPI(null);
    } else {
      addKPI("sales", kpiData as Omit<KPIData, "id">);
    }
    setShowKPIForm(false);
  };

  const handleSaveInitiative = (initiativeData: Partial<InitiativeData>) => {
    if (editingInitiative) {
      updateInitiative("sales", editingInitiative.id, initiativeData);
      setEditingInitiative(null);
    } else {
      addInitiative("sales", initiativeData as Omit<InitiativeData, "id">);
    }
    setShowInitiativeForm(false);
  };

  const handleDeleteKPI = (kpiId: string) => {
    if (window.confirm("Are you sure you want to delete this KPI?")) {
      deleteKPI("sales", kpiId);
    }
  };

  const handleDeleteInitiative = (initiativeId: string) => {
    if (window.confirm("Are you sure you want to delete this initiative?")) {
      deleteInitiative("sales", initiativeId);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Admin</h1>
            <p className="text-lg text-gray-600">
              Manage KPIs and initiatives for sales performance
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("kpis")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "kpis"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              KPIs Management
            </button>
            <button
              onClick={() => setActiveTab("initiatives")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "initiatives"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Calendar className="w-4 h-4 mr-2 inline" />
              Initiatives Management
            </button>
          </nav>
        </div>

        {/* KPIs Tab */}
        {activeTab === "kpis" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Sales KPIs
              </h2>
              <button
                onClick={() => setShowKPIForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Add KPI
              </button>
            </div>

            {showKPIForm && (
              <KPIForm
                kpi={editingKPI}
                onSave={handleSaveKPI}
                onCancel={() => {
                  setShowKPIForm(false);
                  setEditingKPI(null);
                }}
                isEditing={!!editingKPI}
                businessUnitKPIs={kpis}
                selectedKPIId={editingKPI?.id}
                onKPISelect={(kpiId) => {
                  const kpi = kpis.find(k => k.id === kpiId);
                  if (kpi) setEditingKPI(kpi);
                }}
              />
            )}

            <div className="grid grid-cols-1 gap-4">
              {kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {kpi.name}
                      </h3>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Current:</span>{" "}
                          {kpi.current.toLocaleString()}
                          {kpi.unit}
                        </div>
                        <div>
                          <span className="font-medium">Target:</span>{" "}
                          {kpi.target.toLocaleString()}
                          {kpi.unit}
                        </div>
                        <div>
                          <span className="font-medium">Period:</span>{" "}
                          {kpi.period}
                        </div>
                        <div>
                          <span className="font-medium">Trend:</span>{" "}
                          {kpi.trend}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingKPI(kpi);
                          setShowKPIForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteKPI(kpi.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Initiatives Tab */}
        {activeTab === "initiatives" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Sales Initiatives
              </h2>
              <button
                onClick={() => setShowInitiativeForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Add Initiative
              </button>
            </div>

            {showInitiativeForm && (
              <InitiativeForm
                initiative={editingInitiative ? {
                  title: editingInitiative.title,
                  description: editingInitiative.description,
                  actionItems: editingInitiative.actionItems.map(item => ({
                    id: item.id,
                    action: item.action,
                    owner: item.owner,
                    status: item.status === 'Blocked' ? 'Not Started' : 
                           item.status === 'In Progress' ? 'In Progress' : 
                           item.status === 'Completed' ? 'Completed' : 'Not Started',
                    dueDate: item.dueDate,
                    priority: item.priority === 'Critical' ? 'High' : 
                             item.priority === 'High' ? 'High' : 
                             item.priority === 'Medium' ? 'Medium' : 'Low',
                    team: item.team
                  }))
                } : undefined}
                onSave={(formData) => {
                  const initiativeData: Partial<InitiativeData> = {
                    title: formData.title,
                    description: formData.description,
                    actionItems: formData.actionItems.map(item => ({
                      id: item.id,
                      action: item.action,
                      owner: item.owner,
                      status: item.status === 'Not Started' ? 'Blocked' : 
                             item.status === 'In Progress' ? 'In Progress' : 
                             item.status === 'Completed' ? 'Completed' : 'Blocked',
                      dueDate: item.dueDate,
                      priority: item.priority === 'High' ? 'Critical' : 
                               item.priority === 'Medium' ? 'Medium' : 'Low',
                      team: item.team
                    }))
                  };
                  handleSaveInitiative(initiativeData);
                }}
                onCancel={() => {
                  setShowInitiativeForm(false);
                  setEditingInitiative(null);
                }}
                isEditing={!!editingInitiative}
              />
            )}

            <div className="grid grid-cols-1 gap-4">
              {initiatives.map((initiative) => (
                <div
                  key={initiative.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {initiative.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {initiative.description}
                      </p>
                      <div className="mt-2 text-sm text-gray-500">
                        {initiative.actionItems.length} action items
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingInitiative(initiative);
                          setShowInitiativeForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInitiative(initiative.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
