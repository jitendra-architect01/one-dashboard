import React from 'react';
import ActionItem, { ActionItemData } from './ActionItem';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface InitiativeSectionProps {
  title: string;
  description: string;
  actionItems: ActionItemData[];
  color: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function InitiativeSection({ 
  title, 
  description, 
  actionItems, 
  color, 
  isExpanded, 
  onToggle 
}: InitiativeSectionProps) {
  const completedItems = actionItems.filter(item => item.status === 'Completed').length;
  const totalItems = actionItems.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${color}`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {completedItems}/{totalItems} Actions
              </div>
              <div className="text-xs text-gray-500">
                {totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}% Complete
              </div>
            </div>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>

        {totalItems > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${color}`}
                style={{ width: `${(completedItems / totalItems) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          {actionItems.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No action items yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      S.No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Owner
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Team
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {actionItems.map((item, index) => (
                    <ActionItem key={item.id} actionItem={item} index={index} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}