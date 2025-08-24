import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSupabaseData } from "../hooks/useSupabaseData";
import KPICard from "../components/KPICard";
import TrendlineChart from "../components/TrendlineChart";
import {
  Users,
  TrendingUp,
  Megaphone,
  Briefcase,
  Code,
  HeadphonesIcon,
  UserCheck,
  Crown,
  ArrowRight,
  BarChart3,
  Target,
  CheckCircle,
  TrendingUp as TrendingUpIcon,
  AlertCircle,
} from "lucide-react";

// Business unit configuration with icons and colors
const businessUnitConfig = {
  sales: {
    icon: TrendingUp,
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    path: "/sales",
    description: "ARR attainment, pipeline management, and win rate tracking",
  },
  marketing: {
    icon: Megaphone,
    color: "bg-gradient-to-br from-green-500 to-green-600",
    path: "/marketing",
    description:
      "Lead generation, SQL conversion, and pipeline contribution metrics",
  },
  professional_services: {
    icon: Briefcase,
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
    path: "/professional-services",
    description:
      "Revenue delivery, margin optimization, and client satisfaction tracking",
  },
  product_engineering: {
    icon: Code,
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    path: "/product-engineering",
    description:
      "Feature delivery, release performance, and product adoption metrics",
  },
  customer_success: {
    icon: HeadphonesIcon,
    color: "bg-gradient-to-br from-teal-500 to-teal-600",
    path: "/customer-success",
    description:
      "Churn management, retention rates, and customer expansion tracking",
  },
  human_resources: {
    icon: UserCheck,
    color: "bg-gradient-to-br from-pink-500 to-pink-600",
    path: "/human-resources",
    description:
      "Talent acquisition, retention metrics, and organizational development",
  },
};

export default function Dashboard() {
  const [selectedKPIIndex, setSelectedKPIIndex] = useState(0);
  const { businessUnits, businessUnitsArray, loading, error, refetch } =
    useSupabaseData();

  // Calculate totals from real data
  const totalKPIs = businessUnits.reduce(
    (sum: number, unit) => sum + unit.kpis.length,
    0
  );
  const totalActions = businessUnits.reduce(
    (sum: number, unit) =>
      sum +
      unit.initiatives.reduce(
        (initSum: number, init) => initSum + init.actionItems.length,
        0
      ),
    0
  );
  const totalInitiatives = businessUnits.reduce(
    (sum: number, unit) => sum + unit.initiatives.length,
    0
  );

  // Extract company-wide KPIs from business units (only visible ones)
  const companyWideKPIs = businessUnits
    .flatMap((unit) => unit.kpis)
    .filter((kpi) => kpi.isVisibleOnDashboard);

  // Set default selected KPI to first available KPI
  useEffect(() => {
    if (
      companyWideKPIs.length > 0 &&
      selectedKPIIndex >= companyWideKPIs.length
    ) {
      setSelectedKPIIndex(0);
    }
  }, [companyWideKPIs.length, selectedKPIIndex]);
  // Show loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Innovapptive's Operational Excellence Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Strategic insights and performance tracking across all business
            units to drive operational excellence and data-driven decision
            making
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total KPIs
                </p>
                <p className="text-3xl font-bold text-gray-900">{totalKPIs}</p>
                <p className="text-xs text-green-600 mt-1">Across all units</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Business Units
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {businessUnits.length}
                </p>
                <p className="text-xs text-green-600 mt-1">Active units</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Active Actions
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalActions}
                </p>
                <p className="text-xs text-yellow-600 mt-1">In progress</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Initiatives
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalInitiatives}
                </p>
                <p className="text-xs text-purple-600 mt-1">Strategic focus</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Company-wide KPIs */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Company-wide Key Performance Indicators
            </h2>
            <p className="text-gray-600">
              Real-time performance metrics aggregated from all business units
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {companyWideKPIs.map((kpi, index) => (
              <KPICard
                key={index}
                kpi={kpi}
                onClick={() => setSelectedKPIIndex(index)}
                isSelected={selectedKPIIndex === index}
              />
            ))}
          </div>

          {companyWideKPIs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No KPIs Available
              </h3>
              <p className="text-gray-600 mb-4">
                Add KPIs through the business unit admin pages to see
                company-wide metrics here.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {businessUnitsArray.map((unit) => (
                  <Link
                    key={unit.id}
                    to={`${unit.path}/admin`}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    {unit.name} Admin
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trendlines Section */}
        {companyWideKPIs.length > 0 && (
          <div className="mb-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUpIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Trendlines
              </h2>
              <p className="text-gray-600">
                Year-to-date performance trends for{" "}
                <span className="font-medium text-gray-900">
                  {companyWideKPIs[selectedKPIIndex]?.name}
                </span>
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {companyWideKPIs[selectedKPIIndex]?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Monthly performance tracking •{" "}
                    {companyWideKPIs[selectedKPIIndex]?.businessUnitName}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${companyWideKPIs[selectedKPIIndex]?.color}`}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Current:{" "}
                    {companyWideKPIs[
                      selectedKPIIndex
                    ]?.current.toLocaleString()}
                    {companyWideKPIs[selectedKPIIndex]?.unit}
                  </span>
                </div>
              </div>

              <TrendlineChart
                kpiName={companyWideKPIs[selectedKPIIndex]?.name || ""}
                kpiUnit={companyWideKPIs[selectedKPIIndex]?.unit || ""}
                kpiColor={
                  companyWideKPIs[selectedKPIIndex]?.color || "bg-gray-500"
                }
                monthlyData={companyWideKPIs[selectedKPIIndex]?.monthlyData}
              />

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Click on any KPI above to view its trendline</span>
                  <span>Data represents YTD performance trends</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Business Units Grid */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Business Units
            </h2>
            <p className="text-gray-600">
              Select a business unit to view detailed KPIs and strategic
              initiatives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {businessUnits.map((unit) => {
              // Get configuration for this business unit
              const config =
                businessUnitConfig[
                  unit.code as keyof typeof businessUnitConfig
                ];
              if (!config) return null;

              const IconComponent = config.icon;
              const kpiCount = unit.kpis.length;
              const actionCount = unit.initiatives.reduce(
                (sum: number, init) => sum + init.actionItems.length,
                0
              );

              return (
                <Link
                  key={unit.id}
                  to={config.path}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 ${config.color} rounded-lg flex items-center justify-center shadow-lg`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                    {unit.name}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {config.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        {kpiCount} KPIs
                      </span>
                      <span className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {actionCount} Actions
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last updated: 2 hours ago</span>
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                        Active
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activity
            </h2>
            <span className="text-sm text-gray-500">Last 24 hours</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Sales ARR target exceeded by 12%
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Q4 2024 performance update - Year 1 ARR now at $2.85M vs
                  $2.54M target
                </p>
                <span className="text-xs text-gray-500 mt-2 block">
                  2 hours ago
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Marketing SQLs generation on track
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Q4 2024 milestone achieved - 145 SQLs generated vs 180 target
                </p>
                <span className="text-xs text-gray-500 mt-2 block">
                  4 hours ago
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Product feature delivery behind schedule
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  28 features delivered vs 32 target - Action items created for
                  recovery plan
                </p>
                <span className="text-xs text-gray-500 mt-2 block">
                  6 hours ago
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-teal-50 rounded-lg border border-teal-100">
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <HeadphonesIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Customer Success NRR improvement
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Net Revenue Retention increased to 108% - approaching 110%
                  target
                </p>
                <span className="text-xs text-gray-500 mt-2 block">
                  8 hours ago
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
