import React, { useState } from 'react';
import { Save, X, Plus, Trash2, Search, ChevronDown } from 'lucide-react';
import { ActionItemData } from '../ActionItem';
import { useAuth } from '../../context/AuthContext';

interface InitiativeFormData {
  title: string;
  description: string;
  actionItems: ActionItemData[];
}

interface InitiativeFormProps {
  initiative?: InitiativeFormData;
  onSave: (initiative: InitiativeFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-left flex items-center justify-between ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
export default function InitiativeForm({ initiative, onSave, onCancel, isEditing = false }: InitiativeFormProps) {
  const { listEmployeeProfiles } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [formData, setFormData] = useState<InitiativeFormData>(
    initiative || {
      title: '',
      description: '',
      actionItems: []
    }
  );

  // Load employees and teams on component mount
  React.useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        setLoadingEmployees(true);
        const employeeProfiles = await listEmployeeProfiles();
        setEmployees(employeeProfiles);
        
        // Extract unique teams from employees
        const uniqueTeams = [...new Set(
          employeeProfiles
            .map(emp => emp.team || emp.department)
            .filter(Boolean)
        )].sort();
        setTeams(uniqueTeams);
      } catch (error) {
        console.error('Error loading employee data:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployeeData();
  }, [listEmployeeProfiles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addActionItem = () => {
    const newActionItem: ActionItemData = {
      id: `temp-${Date.now().toString()}`, // Mark as temporary with string conversion
      action: '',
      owner: employees.length > 0 ? employees[0].first_name + ' ' + employees[0].last_name : '',
      status: 'Not Started',
      dueDate: '',
      priority: 'Medium',
      team: teams.length > 0 ? teams[0] : ''
    };
    setFormData(prev => ({
      ...prev,
      actionItems: [...prev.actionItems, newActionItem]
    }));
  };

  const updateActionItem = (index: number, field: keyof ActionItemData, value: any) => {
    setFormData(prev => ({
      ...prev,
      actionItems: prev.actionItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeActionItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actionItems: prev.actionItems.filter((_, i) => i !== index)
    }));
  };

  // Prepare options for searchable selects
  const employeeOptions = employees.map(emp => ({
    value: `${emp.first_name} ${emp.last_name}`,
    label: `${emp.first_name} ${emp.last_name} (${emp.employee_code})`
  }));

  const teamOptions = teams.map(team => ({
    value: team,
    label: team
  }));
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditing ? 'Edit Initiative' : 'Add New Initiative'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initiative Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter initiative title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter initiative description"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Action Items</h4>
            <button
              type="button"
              onClick={addActionItem}
              className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-1 inline" />
              Add Action Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.actionItems.map((actionItem, index) => (
              <div key={actionItem.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-medium text-gray-900">Action Item {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeActionItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Action Description
                    </label>
                    <input
                      type="text"
                      value={actionItem.action}
                      onChange={(e) => updateActionItem(index, 'action', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Describe the action"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Owner
                    </label>
                    <SearchableSelect
                      value={actionItem.owner}
                      onChange={(value) => updateActionItem(index, 'owner', value)}
                      options={employeeOptions}
                      placeholder={loadingEmployees ? "Loading employees..." : "Select owner"}
                      disabled={loadingEmployees || employees.length === 0}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Team
                    </label>
                    <SearchableSelect
                      value={actionItem.team}
                      onChange={(value) => updateActionItem(index, 'team', value)}
                      options={teamOptions}
                      placeholder={loadingEmployees ? "Loading teams..." : "Select team"}
                      disabled={loadingEmployees || teams.length === 0}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={actionItem.dueDate}
                      onChange={(e) => updateActionItem(index, 'dueDate', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={actionItem.status}
                      onChange={(e) => updateActionItem(index, 'status', e.target.value as ActionItemData['status'])}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={actionItem.priority}
                      onChange={(e) => updateActionItem(index, 'priority', e.target.value as ActionItemData['priority'])}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {formData.actionItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No action items yet. Click "Add Action Item" to get started.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
            {isEditing ? 'Update Initiative' : 'Save Initiative'}
          </button>
        </div>
      </form>
    </div>
  );
}