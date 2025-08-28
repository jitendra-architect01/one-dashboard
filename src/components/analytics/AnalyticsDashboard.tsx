import React, { useState } from 'react';
import AdvancedChart from './AdvancedChart';
import { useData } from '../../context/DataContext';
import { 
  Filter, 
  Download, 
  RefreshCw, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Target,
  BarChart3
} from 'lucide-react';

interface FilterState {
  dateRange: string;
  businessUnit: string;
  kpiCategory: string;
}

export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'last12months',
    businessUnit: 'all',
    kpiCategory: 'all'
  });
  
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const { getAllKPIs, businessUnitsArray } = useData();
  
  const allKPIs = getAllKPIs();

  // Generate sample analytics data
  const generateAnalyticsData = (kpi: any) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => {
      const baseValue = kpi.current;
      const variance = (Math.random() - 0.5) * baseValue * 0.3;
      const trendFactor = kpi.trend === 'up' ? 1.05 : kpi.trend === 'down' ? 0.95 : 1;
      
      return {
        name: month,
        value: Math.round(baseValue * Math.pow(trendFactor, index) + variance),
        target: kpi.target,
        previous: Math.round(baseValue * Math.pow(trendFactor, index - 1) + variance * 0.8)
      };
    });
  };

  const filteredKPIs = allKPIs.filter(kpi => {
    if (filters.businessUnit !== 'all' && kpi.businessUnit !== filters.businessUnit) return false;
    return true;
  });

  const getPerformanceInsights = () => {
    const insights = [];
    const performingWell = filteredKPIs.filter(kpi => (kpi.current / kpi.target) >= 1).length;
    const needsAttention = filteredKPIs.filter(kpi => (kpi.current / kpi.target) < 0.8).length;
    
    insights.push({
      type: 'success',
      title: 'Performing Well',
      value: performingWell,
      description: 'KPIs meeting or exceeding targets'
    });
    
    insights.push({
      type: 'warning',
      title: 'Needs Attention',
      value: needsAttention,
      description: 'KPIs significantly below target'
    });

    return insights;
  };

  const insights = getPerformanceInsights();

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-lg text-gray-600">Comprehensive KPI analysis and insights</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">KPI Category</label>
                <select
                  value={filters.kpiCategory}
                  onChange={(e) => setFilters(prev => ({ ...prev, kpiCategory: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="revenue">Revenue</option>
                  <option value="performance">Performance</option>
                  <option value="quality">Quality</option>
                </select>
              </div>
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
                  insight.type === 'success' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {insight.type === 'success' ? (
                    <Target className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total KPIs</p>
                <p className="text-3xl font-bold text-gray-900">{filteredKPIs.length}</p>
                <p className="text-xs text-gray-500 mt-1">Across all units</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredKPIs.slice(0, 6).map((kpi, index) => {
            const chartTypes = ['line', 'bar', 'area'];
            const chartType = chartTypes[index % chartTypes.length] as 'line' | 'bar' | 'area';
            
            return (
              <AdvancedChart
                key={`${kpi.businessUnit}-${kpi.id}`}
                data={generateAnalyticsData(kpi)}
                type={chartType}
                title={kpi.name}
                kpiUnit={kpi.unit}
                color={kpi.color.replace('bg-', '').includes('blue') ? '#3B82F6' :
                       kpi.color.replace('bg-', '').includes('green') ? '#10B981' :
                       kpi.color.replace('bg-', '').includes('purple') ? '#8B5CF6' :
                       kpi.color.replace('bg-', '').includes('orange') ? '#F97316' :
                       kpi.color.replace('bg-', '').includes('teal') ? '#14B8A6' :
                       kpi.color.replace('bg-', '').includes('pink') ? '#EC4899' : '#6B7280'}
                height={300}
                showComparison={true}
                showTrend={true}
              />
            );
          })}
        </div>

      </div>
    </div>
  );
}