import React, { useState } from 'react';
import AdvancedChart from './AdvancedChart';
import { useData } from '../../context/DataContext';
import { KPI_CATEGORIES, KPI_CATEGORY_ORDER } from '../../types/data';
import { 
  Filter, 
  Download, 
  RefreshCw, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Target,
  BarChart3,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface FilterState {
  dateRange: string;
  businessUnit: string;
  epicgCategory: string;
}

export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'last12months',
    businessUnit: 'all',
    epicgCategory: 'all'
  });
  
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const { getAllKPIs, businessUnitsArray } = useData();
  
  const [focusedChart, setFocusedChart] = useState<string | null>(null);
  
  const allKPIs = getAllKPIs();

  // Function to get chart color based on attainment percentage
  const getChartColorByAttainment = (current: number, target: number) => {
    if (target === 0) return '#6B7280'; // Gray for invalid targets
    
    const attainmentPercentage = (current / target) * 100;
    
    if (attainmentPercentage >= 95) {
      return '#10B981'; // Green
    } else if (attainmentPercentage >= 75) {
      return '#F59E0B'; // Amber
    } else {
      return '#EF4444'; // Red
    }
  };

  // Generate analytics data from actual KPI monthly data or realistic trends
  const generateAnalyticsData = (kpi: any) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Use actual monthly data if available, otherwise generate realistic data
    if (kpi.monthlyData && kpi.monthlyData.length === 12) {
      return months.map((month, index) => ({
        name: month,
        value: kpi.monthlyData[index] || 0,
        target: kpi.target,
        previous: index > 0 ? kpi.monthlyData[index - 1] : kpi.monthlyData[index]
      }));
    } else {
      // Generate realistic trend data based on actual KPI values
      const baseValue = kpi.current;
      const trendFactor = kpi.trend === 'up' ? 1.02 : kpi.trend === 'down' ? 0.98 : 1;
      
      return months.map((month, index) => {
        const seasonality = Math.sin((index / 12) * 2 * Math.PI) * baseValue * 0.05;
        const growth = baseValue * Math.pow(trendFactor, index) - baseValue;
        const noise = (Math.random() - 0.5) * baseValue * 0.02;
        const value = Math.max(0, Math.round(baseValue + growth + seasonality + noise));
        
        return {
          name: month,
          value: value,
          target: kpi.target,
          previous: index > 0 ? Math.round(baseValue * Math.pow(trendFactor, index - 1)) : value
        };
      });
    }
  };

  const filteredKPIs = allKPIs.filter(kpi => {
    if (filters.businessUnit !== 'all' && kpi.businessUnit !== filters.businessUnit) return false;
    if (filters.epicgCategory !== 'all' && kpi.category !== filters.epicgCategory) return false;
    return true;
  });

  const getPerformanceInsights = () => {
    const insights = [];
    const performingWell = filteredKPIs.filter(kpi => (kpi.current / kpi.target) >= 1).length;
    const needsAttention = filteredKPIs.filter(kpi => (kpi.current / kpi.target) < 0.8).length;
    const onTrack = filteredKPIs.filter(kpi => {
      const percentage = (kpi.current / kpi.target) * 100;
      return percentage >= 80 && percentage < 100;
    }).length;
    
    insights.push({
      type: 'info',
      title: 'Total KPIs',
      value: filteredKPIs.length,
      description: filters.epicgCategory !== 'all' || filters.businessUnit !== 'all' ? 'Filtered results' : 'Across all units'
    });
    
    insights.push({
      type: 'warning',
      title: 'Needs Attention',
      value: needsAttention,
      description: 'KPIs significantly below target'
    });
    
    insights.push({
      type: 'info',
      title: 'On Track',
      value: onTrack,
      description: 'KPIs within 80-99% of target'
    });
    
    insights.push({
      type: 'success',
      title: 'Performing Well',
      value: performingWell,
      description: 'KPIs meeting or exceeding targets'
    });

    return insights;
  };

  const toggleFocusMode = (kpiKey: string) => {
    setFocusedChart(prev => prev === kpiKey ? null : kpiKey);
  };

  const insights = getPerformanceInsights();

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-lg text-gray-600">Real-time KPI analysis with EPICG categorization</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="last12months">Last 12 Months</option>
                  <option value="ytd">Year to Date</option>
                  <option value="last6months">Last 6 Months</option>
                  <option value="last3months">Last 3 Months</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Unit</label>
                <select
                  value={filters.businessUnit}
                  onChange={(e) => setFilters(prev => ({ ...prev, businessUnit: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Units</option>
                  {businessUnitsArray.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EPICG Category</label>
                <select
                  value={filters.epicgCategory}
                  onChange={(e) => setFilters(prev => ({ ...prev, epicgCategory: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All EPICG Categories</option>
                  {KPI_CATEGORY_ORDER.map(categoryId => {
                    const category = KPI_CATEGORIES[categoryId.toUpperCase() as keyof typeof KPI_CATEGORIES];
                    return (
                      <option key={categoryId} value={categoryId}>
                        {category.label} ({category.shortForm})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
          
          {/* Filter Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing <span className="font-medium text-gray-900">{filteredKPIs.length}</span> of <span className="font-medium text-gray-900">{allKPIs.length}</span> KPIs
                {filters.epicgCategory !== 'all' && (
                  <span className="ml-2">
                    • <span className="font-medium">{KPI_CATEGORIES[filters.epicgCategory.toUpperCase() as keyof typeof KPI_CATEGORIES]?.label}</span> category
                  </span>
                )}
                {filters.businessUnit !== 'all' && (
                  <span className="ml-2">
                    • <span className="font-medium">{businessUnitsArray.find(bu => bu.id === filters.businessUnit)?.name}</span> unit
                  </span>
                )}
              </div>
              {(filters.businessUnit !== 'all' || filters.epicgCategory !== 'all') && (
                <button
                  onClick={() => setFilters({ dateRange: 'last12months', businessUnit: 'all', epicgCategory: 'all' })}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {insights.map((insight, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{insight.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{insight.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{insight.description}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  insight.type === 'success' ? 'bg-green-100' : 
                  insight.type === 'info' ? 'bg-blue-100' : 'bg-yellow-100'
                }`}>
                  {insight.type === 'success' ? (
                    <Target className="w-6 h-6 text-green-600" />
                  ) : insight.type === 'info' ? (
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* KPIs by EPICG Category */}
        {filters.epicgCategory !== 'all' ? (
          <div className="space-y-8">
            {/* Selected Category Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${KPI_CATEGORIES[filters.epicgCategory.toUpperCase() as keyof typeof KPI_CATEGORIES]?.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">
                    {KPI_CATEGORIES[filters.epicgCategory.toUpperCase() as keyof typeof KPI_CATEGORIES]?.shortForm}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {KPI_CATEGORIES[filters.epicgCategory.toUpperCase() as keyof typeof KPI_CATEGORIES]?.label} KPIs
                  </h2>
                  <p className="text-gray-600">
                    {filteredKPIs.length} KPIs in this category
                    {filters.businessUnit !== 'all' && ` • ${businessUnitsArray.find(bu => bu.id === filters.businessUnit)?.name}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts for Selected Category */}
            <div className={`grid gap-6 ${focusedChart ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {filteredKPIs.map((kpi, index) => {
                const chartTypes = ['line', 'bar', 'area'];
                const chartType = chartTypes[index % chartTypes.length] as 'line' | 'bar' | 'area';
                const kpiKey = `${kpi.businessUnit}-${kpi.id}`;
                const isFocused = focusedChart === kpiKey;
                
                // If there's a focused chart and this isn't it, don't render
                if (focusedChart && !isFocused) return null;
                
                return (
                  <AdvancedChart
                    key={kpiKey}
                    data={generateAnalyticsData(kpi)}
                    type={chartType}
                    title={`${kpi.name} (${kpi.businessUnitName})`}
                    kpiUnit={kpi.unit}
                    color={getChartColorByAttainment(kpi.current, kpi.target)}
                    height={isFocused ? 400 : 250}
                    showComparison={true}
                    showTrend={true}
                    isFocused={isFocused}
                    onToggleFocus={() => toggleFocusMode(kpiKey)}
                  />
                );
              })}
            </div>

            {filteredKPIs.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No KPIs Found</h3>
                <p className="text-gray-600">
                  No KPIs found for the selected {KPI_CATEGORIES[filters.epicgCategory.toUpperCase() as keyof typeof KPI_CATEGORIES]?.label} category
                  {filters.businessUnit !== 'all' && ` in ${businessUnitsArray.find(bu => bu.id === filters.businessUnit)?.name}`}.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* All Categories Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">KPIs by EPICG Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {KPI_CATEGORY_ORDER.map(categoryId => {
                  const category = KPI_CATEGORIES[categoryId.toUpperCase() as keyof typeof KPI_CATEGORIES];
                