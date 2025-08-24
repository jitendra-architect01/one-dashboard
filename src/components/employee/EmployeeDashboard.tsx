import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Target, 
  TrendingUp,
  Calendar,
  User,
  Bell,
  BarChart3
} from 'lucide-react';

interface EmployeeTask {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate: string;
  initiative: string;
  estimatedHours: number;
  actualHours: number;
}

interface EmployeeGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string;
  progress: number;
  category: 'performance' | 'development' | 'behavioral' | 'project';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task_assigned' | 'deadline_approaching' | 'goal_updated';
  isRead: boolean;
  createdAt: string;
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'goals' | 'performance'>('overview');
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [goals, setGoals] = useState<EmployeeGoal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Mock data - In real implementation, this would come from Supabase
  useEffect(() => {
    // Simulate loading employee data
    setTasks([
      {
        id: '1',
        title: 'Complete Q1 Sales Analysis Report',
        description: 'Analyze Q1 sales performance and identify key trends',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2025-02-15',
        initiative: 'Sales Performance Optimization',
        estimatedHours: 8,
        actualHours: 5
      },
      {
        id: '2',
        title: 'Update CRM with new lead data',
        description: 'Import and validate new leads from marketing campaigns',
        status: 'not_started',
        priority: 'medium',
        dueDate: '2025-02-10',
        initiative: 'Lead Management Enhancement',
        estimatedHours: 4,
        actualHours: 0
      },
      {
        id: '3',
        title: 'Prepare client presentation',
        description: 'Create presentation for ABC Corp quarterly review',
        status: 'completed',
        priority: 'high',
        dueDate: '2025-02-05',
        initiative: 'Client Relationship Management',
        estimatedHours: 6,
        actualHours: 7
      }
    ]);

    setGoals([
      {
        id: '1',
        title: 'Quarterly Sales Target',
        description: 'Achieve $500K in new sales for Q1 2025',
        targetValue: 500000,
        currentValue: 320000,
        unit: '$',
        targetDate: '2025-03-31',
        progress: 64,
        category: 'performance'
      },
      {
        id: '2',
        title: 'Complete Sales Training Certification',
        description: 'Finish advanced sales methodology training program',
        targetValue: 100,
        currentValue: 75,
        unit: '%',
        targetDate: '2025-02-28',
        progress: 75,
        category: 'development'
      }
    ]);

    setNotifications([
      {
        id: '1',
        title: 'New Task Assigned',
        message: 'You have been assigned to "Complete Q1 Sales Analysis Report"',
        type: 'task_assigned',
        isRead: false,
        createdAt: '2025-02-01T10:00:00Z'
      },
      {
        id: '2',
        title: 'Deadline Approaching',
        message: 'Your task "Update CRM with new lead data" is due in 3 days',
        type: 'deadline_approaching',
        isRead: false,
        createdAt: '2025-02-07T09:00:00Z'
      }
    ]);
  }, []);

  const updateTaskStatus = (taskId: string, newStatus: EmployeeTask['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const updateTaskHours = (taskId: string, hours: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, actualHours: hours } : task
    ));
  };

  const getStatusColor = (status: EmployeeTask['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: EmployeeTask['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      default: return 'text-green-700 bg-green-100';
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
  const avgGoalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length;

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
            <p className="text-lg text-gray-600">Here's your personal dashboard and task overview</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-6 h-6" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.username}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'tasks', label: 'My Tasks', icon: CheckCircle },
              { id: 'goals', label: 'My Goals', icon: Target },
              { id: 'performance', label: 'Performance', icon: TrendingUp }
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Completed Tasks</p>
                    <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600">{inProgressTasks}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Overdue</p>
                    <p className="text-3xl font-bold text-red-600">{overdueTasks}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Goal Progress</p>
                    <p className="text-3xl font-bold text-purple-600">{avgGoalProgress.toFixed(0)}%</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
              <div className="space-y-4">
                {tasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">My Tasks</h3>
            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                      <p className="text-gray-600 mt-1">{task.description}</p>
                      <p className="text-sm text-gray-500 mt-2">Initiative: {task.initiative}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as EmployeeTask['status'])}
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
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Estimated: {task.estimatedHours}h
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">Actual:</span>
                      <input
                        type="number"
                        value={task.actualHours}
                        onChange={(e) => updateTaskHours(task.id, parseFloat(e.target.value) || 0)}
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
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">My Goals</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {goals.map(goal => (
                <div key={goal.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{goal.title}</h4>
                      <p className="text-gray-600 mt-1">{goal.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      goal.category === 'performance' ? 'bg-blue-100 text-blue-800' :
                      goal.category === 'development' ? 'bg-green-100 text-green-800' :
                      goal.category === 'behavioral' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {goal.category}
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
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
                  <div className="text-sm text-gray-600">Task Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
                  <div className="text-sm text-gray-600">On-Time Delivery</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">4.2/5</div>
                  <div className="text-sm text-gray-600">Performance Rating</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-900">Completed Q4 Sales Analysis ahead of schedule</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-900">Achieved 120% of monthly sales target</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-900">Improved client satisfaction score to 4.8/5</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}