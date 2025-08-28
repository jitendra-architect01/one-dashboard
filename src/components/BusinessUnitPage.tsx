import React, { useState } from "react";
import { Calendar, ChevronDown, CheckCircle, Clock, AlertCircle, XCircle, Edit3, Save, X, AlertTriangle, Circle, Filter, Search } from "lucide-react";
import { useData } from "../context/DataContext";
import type { KPIData } from "../hooks/useSupabaseData";
import { KPI_CATEGORIES, KPI_CATEGORY_ORDER } from "../types/data";
import KPICard from "./KPICard";
import InitiativeSection from "./InitiativeSection";
import TrendlineChart from "./TrendlineChart";

interface EditableActionItemProps {
  item: {
    id: string;
    action: string;
    owner: string;
    status: "Not Started" | "In Progress" | "Completed" | "Overdue";
    dueDate: string;
    priority: "Low" | "Medium" | "High";
    team: string;
    initiativeTitle: string;
  };
  onUpdate: (id: string, updates: any) => Promise<void>;
}

const EditableActionItem: React.FC<EditableActionItemProps> = ({ item, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: item.status,
    priority: item.priority,
    dueDate: item.dueDate,
  });

  const handleSave = async () => {
    try {
      await onUpdate(item.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update action item:", error);
    }
  };

  const handleCancel = () => {
    setEditData({
      status: item.status,
      priority: item.priority,
      dueDate: item.dueDate,
    });
    setIsEditing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "In Progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "Overdue":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isEditing) {
    return (
      <tr className="border-b hover:bg-gray-50">
        <td className="px-6 py-4 text-sm text-gray-900">{item.action}</td>
        <td className="px-6 py-4 text-sm text-gray-900">{item.initiativeTitle}</td>
        <td className="px-6 py-4 text-sm text-gray-900">{item.owner}</td>
        <td className="px-6 py-4 text-sm">
          <select
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </td>
        <td className="px-6 py-4 text-sm">
          <select
            value={editData.priority}
            onChange={(e) => setEditData({ ...editData, priority: e.target.value as any })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </td>
        <td className="px-6 py-4 text-sm">
          <input
            type="date"
            value={editData.dueDate === "No due date" ? "" : editData.dueDate}
            onChange={(e) => setEditData({ ...editData, dueDate: e.target.value || "No due date" })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </td>
        <td className="px-6 py-4 text-sm">
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-800"
              title="Save"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="text-red-600 hover:text-red-800"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-6 py-4 text-sm text-gray-900">{item.action}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{item.initiativeTitle}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{item.owner}</td>
      <td className="px-6 py-4 text-sm">
        <div className="flex items-center space-x-2">
          {getStatusIcon(item.status)}
          <span>{item.status}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
          {item.priority}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">{item.dueDate}</td>
      <td className="px-6 py-4 text-sm">
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-800"
          title="Edit"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export default function BusinessUnitPage({
  businessUnitCode,
  color = "bg-blue-500",
}: {
  businessUnitCode: string;
  color?: string;
}) {
  const [expandedInitiatives, setExpandedInitiatives] = useState<number[]>([]);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const [selectedKPIForTrend, setSelectedKPIForTrend] = useState<string>("");
  const [actionItemFilters, setActionItemFilters] = useState({
    owner: '',
    priority: '',
    status: '',
    dueDateFrom: '',
    dueDateTo: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { businessUnits, updateActionItem } = useData();

  const businessUnit =
    businessUnits[businessUnitCode as keyof typeof businessUnits];
  const kpis = businessUnit?.kpis || [];
  const initiatives = businessUnit?.initiatives || [];

  // Set the first KPI as selected for trend display by default
  React.useEffect(() => {
    if (kpis.length > 0 && !selectedKPIForTrend) {
      setSelectedKPIForTrend(kpis[0].id);
    }
  }, [kpis, selectedKPIForTrend]);

  // Determine current quarter
  const getCurrentQuarter = () => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    if (month >= 0 && month <= 2) return { id: "Q1", year };
    if (month >= 3 && month <= 5) return { id: "Q2", year };
    if (month >= 6 && month <= 8) return { id: "Q3", year };
    return { id: "Q4", year };
  };

  const currentQuarter = getCurrentQuarter();

  const quarters = [
    { id: "Q1", label: `Q1 ${currentQuarter.year}`, months: [0, 1, 2] },
    { id: "Q2", label: `Q2 ${currentQuarter.year}`, months: [3, 4, 5] },
    { id: "Q3", label: `Q3 ${currentQuarter.year}`, months: [6, 7, 8] },
    { id: "Q4", label: `Q4 ${currentQuarter.year}`, months: [9, 10, 11] },
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

  const handleKPIClick = (kpiId: string) => {
    setSelectedKPIForTrend(kpiId);
  };

  const selectedKPI = kpis.find(kpi => kpi.id === selectedKPIForTrend);

  // Get all action items from all initiatives for this business unit
  const allActionItems = initiatives.flatMap((initiative) =>
    (initiative.actionItems || []).map((item) => ({
      ...item,
      initiativeTitle: initiative.title,
      status: mapActionItemStatus(item.status) as
        | "Not Started"
        | "In Progress"
        | "Completed"
        | "Overdue",
      priority: mapActionItemPriority(item.priority) as
        | "High"
        | "Medium"
        | "Low",
    }))
  );

  // Filter action items based on filter criteria
  const filteredActionItems = allActionItems.filter(item => {
    // Search filter
    if (actionItemFilters.search && !item.action.toLowerCase().includes(actionItemFilters.search.toLowerCase())) {
      return false;
    }
    
    // Owner filter
    if (actionItemFilters.owner && item.owner !== actionItemFilters.owner) {
      return false;
    }
    
    // Priority filter
    if (actionItemFilters.priority && item.priority !== actionItemFilters.priority) {
      return false;
    }
    
    // Status filter
    if (actionItemFilters.status && item.status !== actionItemFilters.status) {
      return false;
    }
    
    // Due date range filter
    if (actionItemFilters.dueDateFrom || actionItemFilters.dueDateTo) {
      const itemDate = new Date(item.dueDate);
      const fromDate = actionItemFilters.dueDateFrom ? new Date(actionItemFilters.dueDateFrom) : null;
      const toDate = actionItemFilters.dueDateTo ? new Date(actionItemFilters.dueDateTo) : null;
      
      if (fromDate && itemDate < fromDate) return false;
      if (toDate && itemDate > toDate) return false;
    }
    
    return true;
  });

  // Get unique values for filter dropdowns
  const uniqueOwners = [...new Set(allActionItems.map(item => item.owner))].sort();
  const uniquePriorities = ['High', 'Medium', 'Low'];
  const uniqueStatuses = ['Not Started', 'In Progress', 'Completed', 'Overdue'];

  const clearFilters = () => {
    setActionItemFilters({
      owner: '',
      priority: '',
      status: '',
      dueDateFrom: '',
      dueDateTo: '',
      search: ''
    });
  };

  // Get status icon and color for action items
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "In Progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "Overdue":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([currentQuarter.id]);

  if (!businessUnit) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Business Unit Not Found
            </h1>
            <p className="text-gray-600">
              The business unit "{businessUnitCode}" could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div
            className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mr-4`}
          >
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {businessUnit.name}
            </h1>
            <p className="text-lg text-gray-600">
              Performance dashboard and strategic initiatives
            </p>
          </div>
        </div>

        {/* 1. Key Performance Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Key Performance Indicators
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowQuarterDropdown(!showQuarterDropdown)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Quarter Filter
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>

          {/* Quarter Selection Dropdown */}
          {showQuarterDropdown && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Select Quarters to Aggregate
              </h4>
              <div className="flex flex-wrap gap-2">
                {quarters.map((quarter) => (
                  <button
                    key={quarter.id}
                    onClick={() => handleQuarterToggle(quarter.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      selectedQuarters.includes(quarter.id)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {quarter.label}
                  </button>
                ))}
              </div>
              {selectedQuarters.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing aggregated data for: {selectedQuarters.join(", ")}
                </p>
              )}
            </div>
          )}

          {/* KPIs organized by EPICG categories */}
          <div className="space-y-8">
            {KPI_CATEGORY_ORDER.map((categoryId) => {
              const category = KPI_CATEGORIES[categoryId.toUpperCase() as keyof typeof KPI_CATEGORIES];
              const categoryKPIs = kpis.filter(kpi => kpi.category === categoryId);
              
              if (categoryKPIs.length === 0) return null;
              
              return (
                <div key={categoryId} className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{category.shortForm}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.label}</h3>
                      <p className="text-sm text-gray-600">{categoryKPIs.length} KPIs</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categoryKPIs.map((kpi) => {
                      const aggregatedKPI = getAggregatedKPIData(kpi);
                      return (
                        <div 
                          key={kpi.id} 
                          onClick={() => handleKPIClick(kpi.id)}
                          className="cursor-pointer"
                        >
                          <KPICard 
                            kpi={aggregatedKPI} 
                            isSelected={kpi.id === selectedKPIForTrend}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {/* Show message if no KPIs exist */}
            {kpis.length === 0 && (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No KPIs Available</h3>
                <p className="text-gray-600">Add KPIs through the admin panel to see them organized by EPICG categories.</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Performance Trends - Single KPI Display */}
        {selectedKPI && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Performance Trends
              </h2>
              <div className="text-sm text-gray-600">
                Showing: <span className="font-medium text-gray-900">{selectedKPI.name}</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    {selectedKPI.name}
                  </h3>
                  <p className="text-xs text-gray-500">{selectedKPI.period}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${selectedKPI.color}`} />
              </div>
              <TrendlineChart
                kpiName={selectedKPI.name}
                kpiUnit={selectedKPI.unit}
                kpiColor={selectedKPI.color}
                monthlyData={selectedKPI.monthlyData}
              />
            </div>
          </div>
        )}

        {/* 3. Strategic Initiatives */}
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

        {/* 4. Action Item Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Action Item Tracker
            </h2>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {filteredActionItems.length} of {allActionItems.length} items
              </span>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Search */}
                <div className="xl:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Actions
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={actionItemFilters.search}
                      onChange={(e) => setActionItemFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search by action description..."
                    />
                  </div>
                </div>

                {/* Owner Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner
                  </label>
                  <select
                    value={actionItemFilters.owner}
                    onChange={(e) => setActionItemFilters(prev => ({ ...prev, owner: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Owners</option>
                    {uniqueOwners.map(owner => (
                      <option key={owner} value={owner}>{owner}</option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={actionItemFilters.priority}
                    onChange={(e) => setActionItemFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Priorities</option>
                    {uniquePriorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={actionItemFilters.status}
                    onChange={(e) => setActionItemFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Due Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date From
                  </label>
                  <input
                    type="date"
                    value={actionItemFilters.dueDateFrom}
                    onChange={(e) => setActionItemFilters(prev => ({ ...prev, dueDateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {filteredActionItems.length} of {allActionItems.length} action items
                </div>
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {allActionItems.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Initiative
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredActionItems.map((item, index) => (
                      <EditableActionItem
                        key={`${item.initiativeTitle}-${index}`}
                        item={item}
                        onUpdate={async (id, updates) => {
                          await updateActionItem(id, updates);
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredActionItems.length === 0 && allActionItems.length > 0 && (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matching action items</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filter criteria to see more results.</p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No action items found for this business unit.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
