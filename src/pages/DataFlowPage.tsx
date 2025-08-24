import React from 'react';
import DataFlowExplanation from '../components/admin/DataFlowExplanation';

export default function DataFlowPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Flow & KPI Calculation Engine
          </h1>
          <p className="text-lg text-gray-600">
            Understanding how your enterprise platform processes data and calculates KPIs
          </p>
        </div>
        
        <DataFlowExplanation />
      </div>
    </div>
  );
}