import React from 'react';
import { Calendar, User, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export interface ActionItemData {
  id: string;
  action: string;
  owner: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  team: string;
}

interface ActionItemProps {
  actionItem: ActionItemData;
  index: number;
}

export default function ActionItem({ actionItem, index }: ActionItemProps) {
  const getStatusIcon = () => {
    switch (actionItem.status) {
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (actionItem.status) {
      case 'Completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Overdue':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = () => {
    switch (actionItem.priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      {/* S.No. */}
      <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">
        {index + 1}
      </td>
      
      {/* Action */}
      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200 max-w-xs">
        <div className="font-medium">{actionItem.action}</div>
      </td>
      
      {/* Owner */}
      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          {actionItem.owner}
        </div>
      </td>
      
      {/* Team */}
      <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">
        {actionItem.team}
      </td>
      
      {/* Status */}
      <td className="px-4 py-3 text-sm border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            {actionItem.status}
          </span>
        </div>
      </td>
      
      {/* Due Date */}
      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          {formatDate(actionItem.dueDate)}
        </div>
      </td>
      
      {/* Priority */}
      <td className="px-4 py-3 text-sm border-b border-gray-200">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor()}`}>
          {actionItem.priority}
        </span>
      </td>
    </tr>
  );
}