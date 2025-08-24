import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  User, 
  Target, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Mail,
  Building,
  Users,
  Award,
  UserCheck,
  Calendar,
  TrendingUp,
  Briefcase,
  Star
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string;
  progress: number;
  status: 'active' | 'completed' | 'cancelled';
  category?: 'performance' | 'development' | 'behavioral' | 'project';
}

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

export default function EmployeeDashboardPage() {
  const { user, isEmployee } = useAuth();
  const [activeTab, setActiveTab] = useState<'about' | 'goals' | 'initiatives'>('about');
  const [businessUnitGoals, setBusinessUnitGoals] = useState<Goal[]>([]);
  const [teamGoals, setTeamGoals] = useState<Goal[]>([]);
  const [personalGoals, setPersonalGoals] = useState<Goal[]>([]);
  const [businessUnitInitiatives, setBusinessUnitInitiatives] = useState<Initiative[]>([]);
  const [teamInitiatives, setTeamInitiatives] = useState<Initiative[]>([]);
  const [myActions, setMyActions] = useState<ActionItem[]>([]);

  // Redirect if not an employee
  if (!isEmployee || !user?.employeeProfile) {
    return <Navigate to="/employee-login" replace />;
  }

  const employeeProfile = user.employeeProfile;

  // Load data based on employee's business unit and team
  useEffect(() => {
    // In production, these would be API calls to Supabase
    // For now, using mock data that simulates database relationships
    
    // Business Unit Goals - Goals for the entire business unit
    setBusinessUnitGoals([
      {
        id: '1',
        title: 'Q1 Revenue Target',
        description: 'Achieve $3.2M in revenue for Q1 2025',
        targetValue: 3200000,
        currentValue: 2850000,
        unit: '$',
        targetDate: '2025-03-31',
        progress: 89,
        status: 'active'
      },
      {
        id: '2',
        title: 'Customer Satisfaction',
        description: 'Maintain customer satisfaction score above 4.5/5',
        targetValue: 4.5,
        currentValue: 4.3,
        unit: '/5',
        targetDate: '2025-03-31',
        progress: 96,
        status: 'active'
      }
    ]);

    // Team Goals - Goals specific to the employee's team
    setTeamGoals([
      {
        id: '1',
        title: 'Enterprise Deal Closure',
        description: 'Close 15 enterprise deals this quarter',
        targetValue: 15,
        currentValue: 12,
        unit: 'deals',
        targetDate: '2025-03-31',
        progress: 80,
        status: 'active'
      }
    ]);

    // Personal Goals - Individual employee goals
    setPersonalGoals([
      {
        id: '1',
        title: 'Personal Sales Target',
        description: 'Achieve $500K in personal sales for Q1 2025',
        targetValue: 500000,
        currentValue: 420000,
        unit: '$',
        targetDate: '2025-03-31',
        progress: 84,
        status: 'active',
        category: 'performance'
      },
      {
        id: '2',
        title: 'Sales Training Certification',
        description: 'Complete advanced sales methodology training',
        targetValue: 100,
        currentValue: 75,
        unit: '%',
        targetDate: '2025-02-28',
        progress: 75,
        status: 'active',
        category: 'development'
      }
    ]);

    // Business Unit Initiatives - Strategic initiatives for the business unit
    setBusinessUnitInitiatives([
      {
        id: '1',
        title: 'Pipeline Acceleration Program',
        description: 'Focused initiative to accelerate deal velocity and increase pipeline conversion',
        status: 'active',
        priority: 'high',
        completionPercentage: 65,
        targetDate: '2025-04-30'
      },
      {
        id: '2',
        title: 'New Logo Acquisition Strategy',
        description: 'Comprehensive approach to increase new customer acquisition rates',
        status: 'active',
        priority: 'high',
        completionPercentage: 78,
        targetDate: '2025-03-31'
      }
    ]);

    // Team Initiatives - Initiatives specific to the employee's team
    setTeamInitiatives([
      {
        id: '1',
        title: 'Enterprise Account Expansion',
        description: 'Focus on expanding existing enterprise accounts',
        status: 'active',
        priority: 'medium',
        completionPercentage: 45,
        targetDate: '2025-05-15'
      }
    ]);

    // My Actions - Action items assigned to this specific employee
    setMyActions([
      {
        id: '1',
        title: 'Complete Q1 Sales Analysis Report',
        description: 'Analyze Q1 sales performance and identify key trends',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2025-02-15',
        estimatedHours: 8,
        actualHours: 5,
        initiative: 'Pipeline Acceleration Program'
      },
      {
        id: '2',
        title: 'Update CRM with new lead data',
        description: 'Import and validate new leads from marketing campaigns',
        status: 'not_started',
        priority: 'medium',
        dueDate: '2025-02-10',
        estimatedHours: 4,
        actualHours: 0,
        initiative: 'New Logo Acquisition Strategy'
      },
      {
        id: '3',
        title: 'Prepare client presentation for ABC Corp',
        description: 'Create quarterly review presentation for key client',
        status: 'completed',
        priority: 'high',
        dueDate: '2025-02-05',
        estimatedHours: 6,
        actualHours: 7,
        initiative: 'Enterprise Account Expansion'
      }
    ]);
  }, [employeeProfile.business_unit_id, employeeProfile.team]);

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

  const updateActionStatus = (actionId: string, newStatus: ActionItem['status']) => {
    setMyActions(prev => prev.map(action => 
      action.id === actionId ? { ...action, status: newStatus } : action
    ));
  };

  const updateActionHours = (actionId: string, hours: number) => {
    setMyActions(prev => prev.map(action => 
      action.id === actionId ? { ...action, actualHours: hours } : action
    ));
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
              { id: 'goals', label: 'Goals', icon: Target },
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
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">First Name</div>
                    <div className="text-lg font-semibold text-gray-900">{employeeProfile.first_name}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-600" />
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
                    <UserCheck className="w-5 h-5 text-pink-600" />
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

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-8">
            {/* My Business Unit Goals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Building className="w-6 h-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">My Business Unit Goals</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {businessUnitGoals.map(goal => (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                        <p className="text-gray-600 mt-1">{goal.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(goal.status)}`}>
                        {goal.status}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Current:</span>
                          <span className="font-medium ml-2">
                            {goal.currentValue.toLocaleString()}{goal.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Target:</span>
                          <span className="font-medium ml-2">
                            {goal.targetValue.toLocaleString()}{goal.unit}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Target Date: {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Team Goals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Users className="w-6 h-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">My Team Goals</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {teamGoals.map(goal => (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                        <p className="text-gray-600 mt-1">{goal.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(goal.status)}`}>
                        {goal.status}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Current:</span>
                          <span className="font-medium ml-2">
                            {goal.currentValue.toLocaleString()}{goal.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Target:</span>
                          <span className="font-medium ml-2">
                            {goal.targetValue.toLocaleString()}{goal.unit}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Target Date: {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Personal Goals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Target className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">My Goals</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {personalGoals.map(goal => (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                        <p className="text-gray-600 mt-1">{goal.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(goal.status)}`}>
                          {goal.status}
                        </span>
                        {goal.category && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            goal.category === 'performance' ? 'bg-blue-100 text-blue-800' :
                            goal.category === 'development' ? 'bg-green-100 text-green-800' :
                            goal.category === 'behavioral' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {goal.category}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Current:</span>
                          <span className="font-medium ml-2">
                            {goal.currentValue.toLocaleString()}{goal.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Target:</span>
                          <span className="font-medium ml-2">
                            {goal.targetValue.toLocaleString()}{goal.unit}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Target Date: {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
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
                <h2 className="text-xl font-semibold text-gray-900">My Business Unit Initiatives</h2>
              </div>
              <div className="space-y-4">
                {businessUnitInitiatives.map(initiative => (
                  <div key={initiative.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{initiative.title}</h3>
                        <p className="text-gray-600 mt-1">{initiative.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(initiative.priority)}`}>
                          {initiative.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(initiative.status)}`}>
                          {initiative.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Completion</span>
                          <span className="font-medium">{initiative.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${initiative.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Target Date: {new Date(initiative.targetDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Team Initiatives */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Users className="w-6 h-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">My Team Initiatives</h2>
              </div>
              <div className="space-y-4">
                {teamInitiatives.map(initiative => (
                  <div key={initiative.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{initiative.title}</h3>
                        <p className="text-gray-600 mt-1">{initiative.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(initiative.priority)}`}>
                          {initiative.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(initiative.status)}`}>
                          {initiative.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Completion</span>
                          <span className="font-medium">{initiative.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${initiative.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Target Date: {new Date(initiative.targetDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <CheckCircle className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">My Actions</h2>
              </div>
              <div className="space-y-4">
                {myActions.map(action => (
                  <div key={action.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{action.title}</h3>
                        <p className="text-gray-600 mt-1">{action.description}</p>
                        <p className="text-sm text-gray-500 mt-2">Initiative: {action.initiative}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(action.priority)}`}>
                          {action.priority}
                        </span>
                        <select
                          value={action.status}
                          onChange={(e) => updateActionStatus(action.id, e.target.value as ActionItem['status'])}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1"
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Due: {new Date(action.dueDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        Estimated: {action.estimatedHours}h
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">Actual:</span>
                        <input
                          type="number"
                          value={action.actualHours}
                          onChange={(e) => updateActionHours(action.id, parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          min="0"
                          step="0.5"
                        />
                        <span className="text-gray-600 ml-1">h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}