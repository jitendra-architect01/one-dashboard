import React, { useState } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { ActionItemData } from '../ActionItem';

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

export default function InitiativeForm({ initiative, onSave, onCancel, isEditing = false }: InitiativeFormProps) {
  const [formData, setFormData] = useState<InitiativeFormData>(
    initiative || {
      title: '',
      description: '',
      actionItems: []
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addActionItem = () => {
    const newActionItem: ActionItemData = {
      id: `temp-${Date.now()}`, // Mark as temporary
      action: '',
      owner: '',
      status: 'Not Started',
      dueDate: '',
      priority: 'Medium',
      team: ''
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
                    <input
                      type="text"
                      value={actionItem.owner}
                      onChange={(e) => updateActionItem(index, 'owner', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Action owner"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Team
                    </label>
                    <input
                      type="text"
                      value={actionItem.team}
                      onChange={(e) => updateActionItem(index, 'team', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Team name"
                      required
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