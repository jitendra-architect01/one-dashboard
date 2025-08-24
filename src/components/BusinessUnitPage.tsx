import React, { useState } from "react";
import KPICard from "./KPICard";
import InitiativeSection from "./InitiativeSection";
import TrendlineChart from "./TrendlineChart";
import { Calendar, ChevronDown } from "lucide-react";
import { useData } from "../context/DataContext";
import type { KPIData } from "../hooks/useSupabaseData";

interface BusinessUnitPageProps {
  businessUnitCode: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// Business unit configuration - not used in this component but kept for reference

export default function BusinessUnitPage({
  businessUnitCode,
  title,
  description,
  icon: IconComponent,
  color,
}: BusinessUnitPageProps) {
  const [expandedInitiatives, setExpandedInitiatives] = useState<number[]>([0]);
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>(["Q4"]);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const { businessUnits } = useData();

  const businessUnit =
    businessUnits[businessUnitCode as keyof typeof businessUnits];
  const kpis = businessUnit?.kpis || [];
  const initiatives = businessUnit?.initiatives || [];

  const quarters = [
    { id: "Q1", label: "Q1 2025", months: [0, 1, 2] },
    { id: "Q2", label: "Q2 2025", months: [3, 4, 5] },
    { id: "Q3", label: "Q3 2025", months: [6, 7, 8] },
    { id: "Q4", label: "Q4 2024", months: [9, 10, 11] },
  ];

  const handleQuarterToggle = (quarterId: string) => {
    setSelectedQuarters((prev) =>
      prev.includes(quarterId)
        ? prev.filter((q) => q !== quarterId)
        : [...prev, quarterId]
    );
  };

  const getAggregatedKPIData = (kpi: KPIData) => {
    if (selectedQuarters.length === 0) return kpi;

    const selectedMonths = selectedQuarters.flatMap(
      (qId) => quarters.find((q) => q.id === qId)?.months || []
    );

    const aggregatedActual = selectedMonths.reduce((sum, monthIndex) => {
      return sum + (kpi.monthlyData?.[monthIndex] || kpi.current / 12);
    }, 0);

    const aggregatedTarget = (kpi.target / 12) * selectedMonths.length;

    return {
      ...kpi,
      current: Math.round(aggregatedActual),
      target: Math.round(aggregatedTarget),
      period:
        selectedQuarters.length === 1
          ? quarters.find((q) => q.id === selectedQuarters[0])?.label ||
            kpi.period
          : `${selectedQuarters.join(" + ")}`,
    };
  };

  const toggleInitiative = (index: number) => {
    setExpandedInitiatives((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Map status values to match ActionItem component expectations
  const mapActionItemStatus = (status: string) => {
    switch (status) {
      case "Blocked":
        return "Overdue";
      default:
        return status;
    }
  };

  // Map priority values to match ActionItem component expectations
  const mapActionItemPriority = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "High";
      default:
        return priority;
    }
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
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-lg text-gray-600">{description}</p>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Key Performance Indicators
            </h2>

            <div className="relative">
              <button
                onClick={() => setShowQuarterDropdown(!showQuarterDropdown)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedQuarters.length === 0
                    ? "Select Quarters"
                    : selectedQuarters.length === 1
                    ? quarters.find((q) => q.id === selectedQuarters[0])?.label
                    : `${selectedQuarters.length} Quarters Selected`}
                </span>
                <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
              </button>

              {showQuarterDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Select Quarters
                    </h3>
                    <div className="space-y-2">
                      {quarters.map((quarter) => (
                        <label key={quarter.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedQuarters.includes(quarter.id)}
                            onChange={() => handleQuarterToggle(quarter.id)}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {quarter.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpis.map((kpi) => {
              const aggregatedKPI = getAggregatedKPIData(kpi);
              return <KPICard key={kpi.id} kpi={aggregatedKPI} />;
            })}
          </div>
        </div>

        {/* Initiatives Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Strategic Initiatives
          </h2>
          <div className="space-y-4">
            {initiatives.map((initiative, index) => (
              <InitiativeSection
                key={initiative.id}
                title={initiative.title}
                description={initiative.description}
                actionItems={(initiative.actionItems || []).map((item) => ({
                  ...item,
                  status: mapActionItemStatus(item.status) as
                    | "Not Started"
                    | "In Progress"
                    | "Completed"
                    | "Overdue",
                  priority: mapActionItemPriority(item.priority) as
                    | "High"
                    | "Medium"
                    | "Low",
                }))}
                color={color}
                isExpanded={expandedInitiatives.includes(index)}
                onToggle={() => toggleInitiative(index)}
              />
            ))}
          </div>
        </div>

        {/* Trendline Charts */}
        {kpis.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Performance Trends
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {kpi.name}
                      </h3>
                      <p className="text-xs text-gray-500">{kpi.period}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${kpi.color}`} />
                  </div>
                  <TrendlineChart
                    kpiName={kpi.name}
                    kpiUnit={kpi.unit}
                    kpiColor={kpi.color}
                    monthlyData={kpi.monthlyData}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
