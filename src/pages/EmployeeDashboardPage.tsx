import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Navigate } from 'react-router-dom';
import { 
  User, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Mail,
  Building,
  Users,
  Briefcase,
  Star,
  Calendar,
  Edit3,
  Save,
  X,
  Circle
} from 'lucide-react';

interface Initiative {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  completionPercentage: number;
  targetDate: string;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  initiative: string;
}

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
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
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

export default function EmployeeDashboardPage() {
  const { user, isEmployee } = useAuth();
  const { businessUnits, updateActionItem } = useData();
  const [activeTab, setActiveTab] = useState<'about' | 'initiatives'>('about');

  // Redirect if not an employee
  if (!isEmployee || !user?.employeeProfile) {
    return <Navigate to="/employee-login" replace />;
  }

  const employeeProfile = user.employeeProfile;

  // Get employee's business unit data
  const employeeBusinessUnit = Object.values(businessUnits).find(
    bu => bu.name === employeeProfile.business_unit_name
  );

  // Get initiatives from employee's business unit
  const businessUnitInitiatives = employeeBusinessUnit?.initiatives || [];

  // Get actions assigned to this employee from all initiatives in their business unit
  const myActions = businessUnitInitiatives.flatMap((initiative) =>
    (initiative.actionItems || [])
      .filter(item => item.owner === `${employeeProfile.first_name} ${employeeProfile.last_name}`)
      .map((item) => ({
        ...item,
        initiativeTitle: initiative.title,
      }))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'active':
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      default: return 'text-green-700 bg-green-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {employeeProfile.first_name.charAt(0)}{employeeProfile.last_name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome, {employeeProfile.first_name} {employeeProfile.last_name}!
                </h1>
                <p className="text-lg text-gray-600">{employeeProfile.designation} • {employeeProfile.business_unit_name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Employee Code</div>
              <div className="text-lg font-semibold text-gray-900">{employeeProfile.employee_code}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'about', label: 'About Me', icon: User },
              { id: 'initiatives', label: 'Initiatives & Actions', icon: CheckCircle }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* About Me Tab */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <User className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">About Me</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Employee Code</div>
                    <div className="text-lg font-semibold text-gray-900">{employeeProfile.employee_code}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">First Name</div>
                    <div className="text-lg font-semibold text-gray-900">{employeeProfile.first_name}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Last Name</div>
                    <div className="text-lg font-semibold text-gray-900">{employeeProfile.last_name}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Business Unit</div>
                    <div className="text-lg font-semibold text-gray-900">{employeeProfile.business_unit_name}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Team</div>
                    <div className="text-lg font-semibold text-gray-900">{employeeProfile.team}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Designation</div>
                    <div className="text-lg font-semibold text-gray-900">{employeeProfile.designation}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Skill</div>
                    <div className="text-lg font-semibold text-gray-900">{employeeProfile.skill}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Manager</div>
                    <div className="text-lg font-semibold text-gray-900">{employeeProfile.manager_email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email ID</div>
                    <div className="text-lg font-semibold text-gray-900">{employeeProfile.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initiatives & Actions Tab */}
        {activeTab === 'initiatives' && (
          <div className="space-y-8">
            {/* My Business Unit Initiatives */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Building className="w-6 h-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  My Business Unit Initiatives ({employeeProfile.business_unit_name})
                </h2>
              </div>
              
              {businessUnitInitiatives.length > 0 ? (
                <div className="space-y-4">
                  {businessUnitInitiatives.map(initiative => (
                    <div key={initiative.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{initiative.title}</h3>
                          <p className="text-gray-600 mt-1">{initiative.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor('medium')}`}>
                            {initiative.actionItems?.length || 0} actions
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>Status: Active</div>
                          <div>Priority: High</div>
                          <div>Actions: {initiative.actionItems?.length || 0}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Initiatives Found</h3>
                  <p className="text-gray-600">No initiatives found for your business unit.</p>
                </div>
              )}
            </div>

            {/* My Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <CheckCircle className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  My Actions ({myActions.length} assigned to me)
                </h2>
              </div>
              
              {myActions.length > 0 ? (
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
                      {myActions.map((item, index) => (
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
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Actions Assigned</h3>
                  <p className="text-gray-600">
                    You don't have any actions assigned to you at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}