import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPIData {
  name: string;
  current: number;
  target: number;
  unit: string;
  period: string;
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

interface KPICardProps {
  kpi: KPIData;
  onClick?: () => void;
  isSelected?: boolean;
}

export default function KPICard({ kpi, onClick, isSelected = false }: KPICardProps) {
  const percentage = (kpi.current / kpi.target) * 100;
  const isPositive = percentage >= 100;
  
  const getProgressBarColor = () => {
    if (percentage < 75) return 'bg-red-500';
    if (percentage >= 76 && percentage <= 90) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getTrendIcon = () => {
    switch (kpi.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    if (percentage >= 100) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-300 cursor-pointer ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-1">{kpi.name}</h3>
          <p className="text-xs text-gray-500">{kpi.period}</p>
        </div>
        {getTrendIcon()}
      </div>

      <div className="space-y-3">
        <div className="flex items-end space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            {kpi.current.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">{kpi.unit}</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Target: {kpi.target.toLocaleString()} {kpi.unit}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {percentage.toFixed(0)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}