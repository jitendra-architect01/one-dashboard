import React, { useState } from 'react';
import { Filter, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KPIData } from '../hooks/useSupabaseData';
import { KPI_CATEGORIES, KPI_CATEGORY_ORDER } from '../types/data';

interface QuarterlyTargetsTableProps {
  kpis: KPIData[];
  businessUnitName: string;
}

export default function QuarterlyTargetsTable({ kpis, businessUnitName }: QuarterlyTargetsTableProps) {
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');

  // Filter KPIs based on frequency category
  const filteredKPIs = frequencyFilter === 'all' 
    ? kpis 
    : kpis.filter(kpi => kpi.category === frequencyFilter);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (value === 0) return '-';
    return `${value.toLocaleString()}${unit === 'number' ? '' : unit}`;
  };

  const getAttainmentColor = (current: number, target: number) => {
    if (target === 0) return 'text-gray-500';
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttainmentPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.round((current / target) * 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {businessUnitName} - Quarterly Targets Overview
            </h2>
            <p className="text-sm text-gray-600">
              Current performance vs quarterly and annual targets
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Frequency:</label>
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
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
          
          <div className="text-sm text-gray-500">
            {filteredKPIs.length} of {kpis.length} KPIs
          </div>
        </div>
      </div>

      {filteredKPIs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No KPIs Found</h3>
          <p className="text-gray-600">
            {frequencyFilter === 'all' 
              ? 'No KPIs available for this business unit.'
              : `No KPIs found for ${KPI_CATEGORIES[frequencyFilter.toUpperCase() as keyof typeof KPI_CATEGORIES]?.label} frequency.`
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KPI Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Q1 2025
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Q2 2025
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Q3 2025
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Q4 2025
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  2025 Target
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attainment
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKPIs.map((kpi, index) => {
                const attainmentPercentage = getAttainmentPercentage(kpi.current, kpi.target);
                const attainmentColor = getAttainmentColor(kpi.current, kpi.target);
                const category = KPI_CATEGORIES[kpi.category?.toUpperCase() as keyof typeof KPI_CATEGORIES];
                
                return (
                  <tr key={kpi.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${kpi.color}`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{kpi.name}</div>
                          <div className="text-xs text-gray-500">{kpi.period}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`text-sm font-semibold ${attainmentColor}`}>
                        {formatValue(kpi.current, kpi.unit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900">
                        {formatValue(kpi.quarterlyTargets?.Q1 || 0, kpi.unit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900">
                        {formatValue(kpi.quarterlyTargets?.Q2 || 0, kpi.unit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900">
                        {formatValue(kpi.quarterlyTargets?.Q3 || 0, kpi.unit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900">
                        {formatValue(kpi.quarterlyTargets?.Q4 || 0, kpi.unit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatValue(kpi.target, kpi.unit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`text-sm font-semibold ${attainmentColor}`}>
                        {attainmentPercentage}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getTrendIcon(kpi.trend)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {category && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${category.color}`}>
                          {category.shortForm}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>≥100% Attainment</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>80-99% Attainment</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>&lt;80% Attainment</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {KPI_CATEGORY_ORDER.map(categoryId => {
              const category = KPI_CATEGORIES[categoryId.toUpperCase() as keyof typeof KPI_CATEGORIES];
              return (
                <div key={categoryId} className="flex items-center space-x-1">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white ${category.color}`}>
                    {category.shortForm}
                  </span>
                  <span>{category.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}