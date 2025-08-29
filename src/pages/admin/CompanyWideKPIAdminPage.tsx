import React, { useState } from 'react';
import { BarChart3, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function CompanyWideKPIAdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState('all');
  const { getAllKPIs, toggleKPIVisibility } = useData();
  
  const allKPIs = getAllKPIs();
  
  // Filter KPIs based on search term and business unit filter
  const filteredKPIs = allKPIs.filter(kpi => {
    const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterUnit === 'all' || kpi.businessUnit === filterUnit;
    return matchesSearch && matchesFilter;
  });

  // Get unique business units for filter dropdown
  const businessUnits = [...new Set(allKPIs.map(kpi => kpi.businessUnit))];
  const businessUnitNames = {
    sales: 'Sales',
    marketing: 'Marketing',
    professional_services: 'Professional Services',
    product_engineering: 'Product & Engineering',
    customer_success: 'Customer Success',
    human_resources: 'Human Resources',
    general_administrative: 'General & Administrative'
  };

  const handleToggleVisibility = (businessUnit: string, kpiId: number) => {
    toggleKPIVisibility(businessUnit, kpiId);
  };

  const getStatusColor = (kpi: any) => {
    const percentage = (kpi.current / kpi.target) * 100;
    if (percentage >= 100) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const visibleCount = allKPIs.filter(kpi => kpi.isVisibleOnDashboard).length;
  const totalCount = allKPIs.length;

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-4">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company-wide KPI Admin</h1>
            <p className="text-lg text-gray-600">Manage visibility of KPIs on the main dashboard</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total KPIs</p>
                <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Visible on Dashboard</p>
                <p className="text-3xl font-bold text-green-600">{visibleCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Hidden</p>
                <p className="text-3xl font-bold text-gray-600">{totalCount - visibleCount}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <EyeOff className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search KPIs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterUnit}
                  onChange={(e) => setFilterUnit(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Business Units</option>
                  {businessUnits.map(unit => (
                    <option key={unit} value={unit}>
                      {businessUnitNames[unit as keyof typeof businessUnitNames]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              All KPIs ({filteredKPIs.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Control which KPIs appear on the main dashboard
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredKPIs.map((kpi) => {
              const percentage = (kpi.current / kpi.target) * 100;
              
              return (
                <div key={`${kpi.businessUnit}-${kpi.id}`} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${kpi.color}`} />
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {kpi.name}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {kpi.businessUnitName}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Current:</span> {kpi.current.toLocaleString()}{kpi.unit}
                        </div>
                        <div>
                          <span className="font-medium">Target:</span> {kpi.target.toLocaleString()}{kpi.unit}
                        </div>
                        <div>
                          <span className="font-medium">Period:</span> {kpi.period}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Progress:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kpi)}`}>
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${kpi.color}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="ml-6 flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`text-sm font-medium ${kpi.isVisibleOnDashboard ? 'text-green-600' : 'text-gray-500'}`}>
                          {kpi.isVisibleOnDashboard ? 'Visible' : 'Hidden'}
                        </div>
                        <div className="text-xs text-gray-500">
                          on dashboard
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleToggleVisibility(kpi.businessUnit, kpi.id)}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                          kpi.isVisibleOnDashboard
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {kpi.isVisibleOnDashboard ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Show
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredKPIs.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No KPIs found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterUnit !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No KPIs are available yet.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}