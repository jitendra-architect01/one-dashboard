import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity, Target, Maximize2, Minimize2 } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  target?: number;
  previous?: number;
  [key: string]: any;
}

interface AdvancedChartProps {
  data: ChartData[];
  type: 'line' | 'area' | 'bar' | 'pie' | 'scatter' | 'gauge';
  title: string;
  kpiUnit: string;
  color?: string;
  height?: number;
  showComparison?: boolean;
  showTrend?: boolean;
  isFocused?: boolean;
  onToggleFocus?: () => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];

export default function AdvancedChart({ 
  data, 
  type, 
  title, 
  kpiUnit, 
  color = '#3B82F6',
  height = 300,
  showComparison = false,
  showTrend = false,
  isFocused = false,
  onToggleFocus
}: AdvancedChartProps) {
  const [selectedDataPoint, setSelectedDataPoint] = useState<ChartData | null>(null);

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip 
              formatter={(value: any) => [`${value}${kpiUnit}`, 'Value']}
              labelStyle={{ color: '#333' }}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
            {showComparison && (
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#94A3B8" 
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip formatter={(value: any) => [`${value}${kpiUnit}`, 'Value']} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              fill={`${color}20`}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip formatter={(value: any) => [`${value}${kpiUnit}`, 'Value']} />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            {showComparison && (
              <Bar dataKey="target" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => [`${value}${kpiUnit}`, 'Value']} />
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="value" stroke="#666" fontSize={12} />
            <YAxis dataKey="target" stroke="#666" fontSize={12} />
            <Tooltip formatter={(value: any) => [`${value}${kpiUnit}`, 'Value']} />
            <Scatter dataKey="value" fill={color} />
          </ScatterChart>
        );

      default:
        return null;
    }
  };

  const getChartIcon = () => {
    switch (type) {
      case 'line': return <TrendingUp className="w-4 h-4" />;
      case 'bar': return <BarChart3 className="w-4 h-4" />;
      case 'pie': return <PieIcon className="w-4 h-4" />;
      case 'scatter': return <Activity className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 ${
      isFocused ? 'col-span-full shadow-lg' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getChartIcon()}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Interactive</span>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
          {onToggleFocus && (
            <button
              onClick={onToggleFocus}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFocused ? "Exit Focus Mode" : "Enter Focus Mode"}
            >
              {isFocused ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
      
      <div style={{ height: `${isFocused ? height * 1.5 : height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {selectedDataPoint && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900">Selected: {selectedDataPoint.name}</h4>
          <p className="text-sm text-blue-700">
            Value: {selectedDataPoint.value}{kpiUnit}
            {selectedDataPoint.target && ` | Target: ${selectedDataPoint.target}${kpiUnit}`}
          </p>
        </div>
      )}
    </div>
  );
}