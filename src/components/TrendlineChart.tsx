import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TrendlineChartProps {
  kpiName: string;
  kpiUnit: string;
  kpiColor: string;
  monthlyData?: number[];
}

// Helper function to format unit display
const formatUnit = (unit: string): string => {
  // For numbers, return empty string (no symbol)
  if (unit === 'number') return '';
  // Return the unit as-is (it should already be $, %, or empty)
  return unit;
};

export default function TrendlineChart({ kpiName, kpiUnit, kpiColor, monthlyData }: TrendlineChartProps) {
  // Generate mock YTD data for demonstration
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Use provided monthly data or generate fallback data
  const getTrendData = () => {
    if (monthlyData && monthlyData.length === 12) {
      return monthlyData;
    }
    
    // Fallback: Generate realistic trend data based on KPI type
    const baseValue = Math.random() * 1000 + 500;
    const trend = Math.random() > 0.5 ? 1 : -1; // Positive or negative trend
    
    return months.map((_, index) => {
      const seasonality = Math.sin((index / 12) * 2 * Math.PI) * 50;
      const growth = trend * index * 20;
      const noise = (Math.random() - 0.5) * 100;
      return Math.max(0, baseValue + growth + seasonality + noise);
    });
  };

  const data = {
    labels: months,
    datasets: [
      {
        label: kpiName,
        data: getTrendData(),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue with transparency
        borderColor: 'rgba(59, 130, 246, 1)', // Solid blue
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y.toLocaleString()}${formatUnit(kpiUnit)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#6B7280',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#6B7280',
          callback: function(value: any) {
            return `${value.toLocaleString()}${formatUnit(kpiUnit)}`;
          }
        },
      },
    },
  };

  return (
    <div className="h-80 w-full">
      <Bar data={data} options={options} />
    </div>
  );
}