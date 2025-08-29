import React, { useState } from 'react';
import { TrendingUp, Save, RotateCcw, Search, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function TrendlineAdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState('all');
  const [editingData, setEditingData] = useState<{[key: string]: number[]}>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  const { getAllKPIs, updateKPIMonthlyData } = useData();
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

  const getKPIKey = (businessUnit: string, kpiId: number) => `${businessUnit}-${kpiId}`;

  const getMonthlyValue = (businessUnit: string, kpiId: number, monthIndex: number) => {
    const key = getKPIKey(businessUnit, kpiId);
    if (editingData[key]) {
      return editingData[key][monthIndex] || 0;
    }
    const kpi = allKPIs.find(k => k.businessUnit === businessUnit && k.id === kpiId);
    return kpi?.monthlyData?.[monthIndex] || 0;
  };

  const updateMonthlyValue = (businessUnit: string, kpiId: number, monthIndex: number, value: number) => {
    const key = getKPIKey(businessUnit, kpiId);
    const currentData = editingData[key] || allKPIs.find(k => k.businessUnit === businessUnit && k.id === kpiId)?.monthlyData || new Array(12).fill(0);
    const newData = [...currentData];
    newData[monthIndex] = value;
    
    setEditingData(prev => ({
      ...prev,
      [key]: newData
    }));
    setHasChanges(true);
  };

  const saveChanges = () => {
    Object.entries(editingData).forEach(([key, monthlyData]) => {
      const [businessUnit, kpiIdStr] = key.split('-');
      const kpiId = parseInt(kpiIdStr);
      updateKPIMonthlyData(businessUnit, kpiId, monthlyData);
    });
    setEditingData({});
    setHasChanges(false);
  };

  const resetChanges = () => {
    setEditingData({});
    setHasChanges(false);
  };

  const generateSampleData = (businessUnit: string, kpiId: number) => {
    const kpi = allKPIs.find(k => k.businessUnit === businessUnit && k.id === kpiId);
    if (!kpi) return;

    const baseValue = kpi.current;
    const trend = kpi.trend === 'up' ? 1 : kpi.trend === 'down' ? -1 : 0;
    
    const sampleData = months.map((_, index) => {
      const growth = trend * (index / 12) * baseValue * 0.2;
      const seasonality = Math.sin((index / 12) * 2 * Math.PI) * baseValue * 0.1;
      const noise = (Math.random() - 0.5) * baseValue * 0.05;
      return Math.max(0, Math.round(baseValue + growth + seasonality + noise));
    });

    const key = getKPIKey(businessUnit, kpiId);
    setEditingData(prev => ({
      ...prev,
      [key]: sampleData
    }));
    setHasChanges(true);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trendline Data Admin</h1>
            <p className="text-lg text-gray-600">Manage monthly data for all KPI trendlines</p>
          </div>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-yellow-800">You have unsaved changes</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={resetChanges}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <RotateCcw className="w-4 h-4 mr-2 inline" />
                  Reset
                </button>
                <button
                  onClick={saveChanges}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterUnit}
                  onChange={(e) => setFilterUnit(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
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

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Monthly KPI Data ({filteredKPIs.length} KPIs)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Enter monthly values for each KPI to populate trendline charts
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-80">
                    KPI Name
                  </th>
                  {months.map((month) => (
                    <th key={month} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-24">
                      {month}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKPIs.map((kpi) => (
                  <tr key={`${kpi.businessUnit}-${kpi.id}`} className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-6 py-4 border-r border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${kpi.color}`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{kpi.name}</div>
                          <div className="text-xs text-gray-500">{kpi.businessUnitName}</div>
                          <div className="text-xs text-gray-400">Unit: {kpi.unit}</div>
                        </div>
                      </div>
                    </td>
                    {months.map((_, monthIndex) => (
                      <td key={monthIndex} className="px-2 py-4">
                        <input
                          type="number"
                          value={getMonthlyValue(kpi.businessUnit, kpi.id, monthIndex)}
                          onChange={(e) => updateMonthlyValue(kpi.businessUnit, kpi.id, monthIndex, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-center"
                          step="0.01"
                        />
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => generateSampleData(kpi.businessUnit, kpi.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Generate Sample
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredKPIs.length === 0 && (
                  <tr>
                    <td colSpan={14} className="px-6 py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No KPIs found</h3>
                      <p className="text-gray-600">
                        {searchTerm || filterUnit !== 'all' 
                          ? 'Try adjusting your search or filter criteria.'
                          : 'No KPIs are available yet.'
                        }
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">How to use this page:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Enter monthly values for each KPI in the corresponding month columns</li>
            <li>• Use the "Generate Sample" button to create realistic sample data for testing</li>
            <li>• Click "Save Changes" to apply your updates to the trendline charts</li>
            <li>• Use search and filters to find specific KPIs quickly</li>
            <li>• Values will be displayed in the trendline charts on the main dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}