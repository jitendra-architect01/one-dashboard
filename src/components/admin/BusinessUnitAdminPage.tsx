import React, { useState } from "react";
import { Plus, Edit, Trash2, BarChart3, Target } from "lucide-react";
import KPIForm from "./KPIForm";
import InitiativeForm from "./InitiativeForm";
import { useData } from "../../context/DataContext";

interface BusinessUnitAdminPageProps {
  businessUnitCode: keyof typeof BUSINESS_UNIT_CONFIG;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// Business unit configuration for admin pages
const BUSINESS_UNIT_CONFIG = {
  sales: {
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    focusRing: "focus:ring-blue-500",
    textColor: "text-blue-600",
    borderColor: "border-blue-500",
  },
  marketing: {
    color: "bg-gradient-to-br from-green-500 to-green-600",
    focusRing: "focus:ring-green-500",
    textColor: "text-green-600",
    borderColor: "border-green-500",
  },
  professional_services: {
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
    focusRing: "focus:ring-orange-500",
    textColor: "text-orange-600",
    borderColor: "border-orange-500",
  },
  product_engineering: {
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    focusRing: "focus:ring-indigo-500",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-500",
  },
  customer_success: {
    color: "bg-gradient-to-br from-teal-500 to-teal-600",
    focusRing: "focus:ring-teal-500",
    textColor: "text-teal-600",
    borderColor: "border-teal-500",
  },
  human_resources: {
    color: "bg-gradient-to-br from-pink-500 to-pink-600",
    focusRing: "focus:ring-pink-500",
    textColor: "text-pink-600",
    borderColor: "border-pink-500",
  },
} as const;

export default function BusinessUnitAdminPage({
  businessUnitCode,
  title,
  description,
  icon: IconComponent,
  color,
}: BusinessUnitAdminPageProps) {
  const [activeTab, setActiveTab] = useState<"kpis" | "initiatives">("kpis");
  const [showKPIForm, setShowKPIForm] = useState(false);
  const [showInitiativeForm, setShowInitiativeForm] = useState(false);
  const [editingKPI, setEditingKPI] = useState<any>(null);
  const [editingInitiative, setEditingInitiative] = useState<any>(null);

  const {
    businessUnits,
    addKPI,
    updateKPI,
    deleteKPI,
    addInitiative,
    updateInitiative,
    deleteInitiative,
  } = useData();

  const businessUnit =
    businessUnits[businessUnitCode as keyof typeof businessUnits];
  const kpis = businessUnit?.kpis || [];
  const initiatives = businessUnit?.initiatives || [];
  const config = BUSINESS_UNIT_CONFIG[businessUnitCode];

  const handleSaveKPI = (kpiData: any) => {
    if (editingKPI) {
      updateKPI(businessUnitCode, {
        ...kpiData,
        id: editingKPI.id,
        color,
        isVisibleOnDashboard: editingKPI.isVisibleOnDashboard || false,
      });
      setEditingKPI(null);
    } else {
      addKPI(businessUnitCode, {
        ...kpiData,
        color,
        isVisibleOnDashboard: false,
      });
    }
    setShowKPIForm(false);
  };

  const handleSaveInitiative = (initiativeData: any) => {
    if (editingInitiative) {
      updateInitiative(businessUnitCode, {
        ...initiativeData,
        id: editingInitiative.id,
      });
      setEditingInitiative(null);
    } else {
      addInitiative(businessUnitCode, initiativeData);
    }
    setShowInitiativeForm(false);
  };

  const handleDeleteKPI = (id: string) => {
    if (confirm("Are you sure you want to delete this KPI?")) {
      deleteKPI(businessUnitCode, id);
    }
  };

  const handleDeleteInitiative = (id: string) => {
    if (confirm("Are you sure you want to delete this initiative?")) {
      deleteInitiative(businessUnitCode, id);
    }
  };

  const handleEditKPI = (kpi: any) => {
    setEditingKPI(kpi);
    setShowKPIForm(true);
  };

  const handleEditInitiative = (initiative: any) => {
    setEditingInitiative(initiative);
    setShowInitiativeForm(true);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div
            className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mr-4`}
          >
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title} Admin</h1>
            <p className="text-lg text-gray-600">
              Manage KPIs and initiatives for {description.toLowerCase()}
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
                  ? `${config.borderColor} ${config.textColor}`
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
                  ? `${config.borderColor} ${config.textColor}`
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Target className="w-4 h-4 mr-2 inline" />
              Initiatives Management
            </button>
          </nav>
        </div>

        {/* KPIs Tab */}
        {activeTab === "kpis" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {title} KPIs
              </h2>
              <button
                onClick={() => setShowKPIForm(true)}
                className={`px-4 py-2 ${color} text-white rounded-lg hover:opacity-90 transition-opacity duration-200 flex items-center`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add KPI
              </button>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kpis.map((kpi: any) => (
                <div
                  key={kpi.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-3 h-3 rounded-full ${kpi.color}`} />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditKPI(kpi)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteKPI(kpi.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{kpi.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Current:</span>
                      <span className="font-medium">
                        {kpi.current?.toLocaleString()}
                        {kpi.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <span className="font-medium">
                        {kpi.target?.toLocaleString()}
                        {kpi.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trend:</span>
                      <span className="font-medium capitalize">
                        {kpi.trend}
                      </span>
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
                {title} Initiatives
              </h2>
              <button
                onClick={() => setShowInitiativeForm(true)}
                className={`px-4 py-2 ${color} text-white rounded-lg hover:opacity-90 transition-opacity duration-200 flex items-center`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Initiative
              </button>
            </div>

            {/* Initiatives Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initiatives.map((initiative: any) => (
                <div
                  key={initiative.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">
                      {initiative.title}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditInitiative(initiative)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInitiative(initiative.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {initiative.description}
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium capitalize">
                        {initiative.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Priority:</span>
                      <span className="font-medium capitalize">
                        {initiative.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Form Modal */}
        {showKPIForm && (
          <KPIForm
            isOpen={showKPIForm}
            onClose={() => {
              setShowKPIForm(false);
              setEditingKPI(null);
            }}
            onSave={handleSaveKPI}
            initialData={editingKPI}
            businessUnitCode={businessUnitCode}
          />
        )}

        {/* Initiative Form Modal */}
        {showInitiativeForm && (
          <InitiativeForm
            isOpen={showInitiativeForm}
            onClose={() => {
              setShowInitiativeForm(false);
              setEditingInitiative(null);
            }}
            onSave={handleSaveInitiative}
            initialData={editingInitiative}
            businessUnitCode={businessUnitCode}
          />
        )}
      </div>
    </div>
  );
}
