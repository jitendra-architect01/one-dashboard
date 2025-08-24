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
        backgroundColor: kpiColor.replace('bg-', '').includes('purple') ? 'rgba(147, 51, 234, 0.8)' :
                        kpiColor.replace('bg-', '').includes('blue') ? 'rgba(59, 130, 246, 0.8)' :
                        kpiColor.replace('bg-', '').includes('green') ? 'rgba(34, 197, 94, 0.8)' :
                        kpiColor.replace('bg-', '').includes('orange') ? 'rgba(249, 115, 22, 0.8)' :
                        kpiColor.replace('bg-', '').includes('indigo') ? 'rgba(99, 102, 241, 0.8)' :
                        kpiColor.replace('bg-', '').includes('teal') ? 'rgba(20, 184, 166, 0.8)' :
                        kpiColor.replace('bg-', '').includes('pink') ? 'rgba(236, 72, 153, 0.8)' :
                        kpiColor.replace('bg-', '').includes('red') ? 'rgba(239, 68, 68, 0.8)' :
                        kpiColor.replace('bg-', '').includes('yellow') ? 'rgba(245, 158, 11, 0.8)' :
                        'rgba(107, 114, 128, 0.8)',
        borderColor: kpiColor.replace('bg-', '').includes('purple') ? 'rgba(147, 51, 234, 1)' :
                     kpiColor.replace('bg-', '').includes('blue') ? 'rgba(59, 130, 246, 1)' :
                     kpiColor.replace('bg-', '').includes('green') ? 'rgba(34, 197, 94, 1)' :
                     kpiColor.replace('bg-', '').includes('orange') ? 'rgba(249, 115, 22, 1)' :
                     kpiColor.replace('bg-', '').includes('indigo') ? 'rgba(99, 102, 241, 1)' :
                     kpiColor.replace('bg-', '').includes('teal') ? 'rgba(20, 184, 166, 1)' :
                     kpiColor.replace('bg-', '').includes('pink') ? 'rgba(236, 72, 153, 1)' :
                     kpiColor.replace('bg-', '').includes('red') ? 'rgba(239, 68, 68, 1)' :
                     kpiColor.replace('bg-', '').includes('yellow') ? 'rgba(245, 158, 11, 1)' :
                     'rgba(107, 114, 128, 1)',
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
            return `${context.parsed.y.toLocaleString()}${kpiUnit}`;
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
            return `${value.toLocaleString()}${kpiUnit}`;
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