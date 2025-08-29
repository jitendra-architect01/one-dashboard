import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { KPIData } from '../../hooks/useSupabaseData';
import { KPI_CATEGORIES, KPI_CATEGORY_ORDER } from '../../types/data';

interface KPIFormData {
  name: string;
  current: number;
  target: number;
  unit: string;
  period: string;
  trend: 'up' | 'down' | 'neutral';
  color?: string;
  category: string;
  quarterlyTargets?: {
    Q1: number;
    Q2: number;
    Q3: number;
    Q4: number;
    Year: number;
  };
}

interface KPIFormProps {
  kpi?: KPIData | null;
  onSave: (kpi: Partial<KPIData>) => void;
  onCancel: () => void;
  isEditing?: boolean;
  businessUnitKPIs?: KPIData[];
  selectedKPIId?: string;
  onKPISelect?: (kpiId: string) => void;
}

export default function KPIForm({ 
  kpi, 
  onSave, 
  onCancel, 
  isEditing = false, 
  businessUnitKPIs = [],
  selectedKPIId,
  onKPISelect
}: KPIFormProps) {
  // For editing existing KPIs
  const [selectedKPI, setSelectedKPI] = useState<KPIData | null>(
    isEditing && kpi ? kpi : null
  );
  
  // For adding new KPIs
  const [formData, setFormData] = useState<KPIFormData>({
    name: '',
    current: 0,
    target: 0,
    unit: '',
    period: '',
    trend: 'neutral',
    category: 'Economics', // Default to Economics
  });
  
  const [quarterlyTargets, setQuarterlyTargets] = useState({
    Q1: 0,
    Q2: 0,
    Q3: 0,
    Q4: 0,
    Year: kpi?.target || 0,
  });

  // For editing existing KPIs - track category changes
  const [editingCategory, setEditingCategory] = useState<string>('');

  const handleKPISelection = (kpiId: string) => {
    const selected = businessUnitKPIs.find((k) => k.id === kpiId);
    if (selected) {
      setSelectedKPI(selected);
      setEditingCategory(selected.category || 'Economics');
      setQuarterlyTargets({
        Q1: 0,
        Q2: 0,
        Q3: 0,
        Q4: 0,
        Year: selected.target || 0,
      });
      if (onKPISelect) {
        onKPISelect(kpiId);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedKPI) {
      alert('Please select a KPI to edit');
      return;
    }

    const updatedKPI = {
      ...selectedKPI,
      category: editingCategory,
      quarterlyTargets,
      target: quarterlyTargets.Year, // Use yearly target as the main target
    };

    onSave(updatedKPI);
  };

  const handleQuarterlyTargetChange = (quarter: keyof typeof quarterlyTargets, value: number) => {
    setQuarterlyTargets(prev => ({
      ...prev,
      [quarter]: value
    }));
  };

  const handleChange = (field: keyof KPIFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNewKPISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const kpiData: Partial<KPIData> = {
      name: formData.name,
      current: formData.current,
      target: formData.target,
      unit: formData.unit,
      period: formData.period,
      trend: formData.trend,
      color: formData.color || 'bg-blue-500',
      isVisibleOnDashboard: false,
      category: formData.category as any
    };
    
    onSave(kpiData);
  };

  if (!isEditing) {
    // For adding new KPIs, show the original form
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Add New KPI</h3>
        </div>

        <form onSubmit={handleNewKPISubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                KPI Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter KPI name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select unit type</option>
                <option value="$">$ US Dollar</option>
                <option value="%">% Percent</option>
                <option value="number"># Number (No symbol)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Value
              </label>
              <input
                type="number"
                value={formData.current}
                onChange={(e) => handleChange('current', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Value
              </label>
              <input
                type="number"
                value={formData.target}
                onChange={(e) => handleChange('target', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                {Object.values(KPI_CATEGORIES).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period
              </label>
              <select
                value={formData.period}
                onChange={(e) => handleChange('period', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select period</option>
                <option value="Q1 2025">Q1 2025</option>
                <option value="Q2 2025">Q2 2025</option>
                <option value="Q3 2025">Q3 2025</option>
                <option value="Q4 2025">Q4 2025</option>
                <option value="FY'25">FY'25</option>
                <option value="YTD">YTD</option>
                <option value="Current">Current</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trend
              </label>
              <div className="flex space-x-2">
                {[
                  { value: 'up', label: 'Up', color: 'text-green-500' },
                  { value: 'down', label: 'Down', color: 'text-red-500' },
                  { value: 'neutral', label: 'Neutral', color: 'text-gray-500' }
                ].map(({ value, label, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange('trend', value)}
                    className={`flex items-center px-3 py-2 rounded-md border transition-colors ${
                      formData.trend === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>


          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <X className="w-4 h-4 mr-2 inline" />
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              Save KPI
            </button>
          </div>
        </form>
      </div>
    );
  }

  // For editing existing KPIs - Target Values Only
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Edit KPI Target Values</h3>
        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Actual values come from Excel uploads
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* KPI Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select KPI to Edit Target Values
          </label>
          <div className="grid grid-cols-1 gap-3">
            {businessUnitKPIs.map((kpiItem, index) => (
              <div
                key={index}
                onClick={() => handleKPISelection(kpiItem.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedKPI?.name === kpiItem.name
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{kpiItem.name}</h4>
                    <div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Current:</span> {kpiItem.current.toLocaleString()}{kpiItem.unit}
                        <div className="text-xs text-blue-600">From Excel uploads</div>
                      </div>
                      <div>
                        <span className="font-medium">Target:</span> {kpiItem.target.toLocaleString()}{kpiItem.unit}
                      </div>
                      <div>
                        <span className="font-medium">Period:</span> {kpiItem.period}
                      </div>
                      <div>
                        <span className="font-medium">Trend:</span> {kpiItem.trend}
                      </div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${kpiItem.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target Values Input - Only show when KPI is selected */}
        {selectedKPI && (
          <div className="border-t border-gray-200 pt-6">
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Edit KPI: {selectedKPI.name}
              </h4>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Current Value:</span> {selectedKPI.current.toLocaleString()}{selectedKPI.unit}
                    <div className="text-xs text-blue-600">Automatically updated from Excel uploads</div>
                  </div>
                  <div>
                    <span className="font-medium">Unit:</span> {selectedKPI.unit}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Q1 Target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Q1 2025 Target
                </label>
                <input
                  type="number"
                  value={quarterlyTargets.Q1}
                  onChange={(e) => handleQuarterlyTargetChange('Q1', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  placeholder="Q1 target"
                />
                <div className="text-xs text-gray-500 mt-1">Jan - Mar</div>
              </div>

              {/* Q2 Target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Q2 2025 Target
                </label>
                <input
                  type="number"
                  value={quarterlyTargets.Q2}
                  onChange={(e) => handleQuarterlyTargetChange('Q2', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  placeholder="Q2 target"
                />
                <div className="text-xs text-gray-500 mt-1">Apr - Jun</div>
              </div>

              {/* Q3 Target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Q3 2025 Target
                </label>
                <input
                  type="number"
                  value={quarterlyTargets.Q3}
                  onChange={(e) => handleQuarterlyTargetChange('Q3', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  placeholder="Q3 target"
                />
                <div className="text-xs text-gray-500 mt-1">Jul - Sep</div>
              </div>

              {/* Q4 Target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Q4 2025 Target
                </label>
                <input
                  type="number"
                  value={quarterlyTargets.Q4}
                  onChange={(e) => handleQuarterlyTargetChange('Q4', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  placeholder="Q4 target"
                />
                <div className="text-xs text-gray-500 mt-1">Oct - Dec</div>
              </div>

              {/* Year Target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2025 Year Target
                </label>
                <input
                  type="number"
                  value={quarterlyTargets.Year}
                  onChange={(e) => handleQuarterlyTargetChange('Year', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  placeholder="Annual target"
                />
                <div className="text-xs text-gray-500 mt-1">Full Year</div>
              </div>
            </div>

            {/* Target Summary */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-3">Target Summary for {selectedKPI.name}</h5>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-blue-900">Q1</div>
                  <div className="text-blue-700">{quarterlyTargets.Q1.toLocaleString()}{selectedKPI.unit}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-900">Q2</div>
                  <div className="text-blue-700">{quarterlyTargets.Q2.toLocaleString()}{selectedKPI.unit}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-900">Q3</div>
                  <div className="text-blue-700">{quarterlyTargets.Q3.toLocaleString()}{selectedKPI.unit}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-900">Q4</div>
                  <div className="text-blue-700">{quarterlyTargets.Q4.toLocaleString()}{selectedKPI.unit}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-900">2025</div>
                  <div className="text-blue-700">{quarterlyTargets.Year.toLocaleString()}{selectedKPI.unit}</div>
                </div>
              </div>
            </div>

            {/* EPICG Category Selection */}
            <div className="mt-6 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tracking Frequency Category
              </label>
                  Tracking Frequency
                value={editingCategory}
                onChange={(e) => setEditingCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Tracking Frequency</option>
                {KPI_CATEGORY_ORDER.map((categoryId) => {
                  <option value="">Select tracking frequency</option>
                  return (
                    <option key={categoryId} value={categoryId}>
                      {category.label} ({category.shortForm})
                    </option>
                  );
                })}
              </select>
              {editingCategory && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: <span className="font-medium">
                    {KPI_CATEGORIES[editingCategory.toUpperCase() as keyof typeof KPI_CATEGORIES]?.label} 
                    ({KPI_CATEGORIES[editingCategory.toUpperCase() as keyof typeof KPI_CATEGORIES]?.shortForm})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="w-4 h-4 mr-2 inline" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedKPI}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2 inline" />
            Update Target Values
          </button>
        </div>
      </form>
    </div>
  );
}