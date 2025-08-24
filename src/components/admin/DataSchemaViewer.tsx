import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Database, FileSpreadsheet, Calculator, Eye, Download } from 'lucide-react';
import { useData } from '../../context/DataContext';

const businessUnitOptions = [
  { id: 'sales', name: 'Sales' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'professionalServices', name: 'Professional Services' },
  { id: 'productEngineering', name: 'Product & Engineering' },
  { id: 'customerSuccess', name: 'Customer Success' },
  { id: 'humanResources', name: 'Human Resources' },
];

export default function DataSchemaViewer() {
  const [selectedUnit, setSelectedUnit] = useState('sales');
  const { getDataSchema } = useData();
  
  const schema = getDataSchema(selectedUnit);

  const generateExcelTemplate = (businessUnit: string) => {
    // Generate Excel template content based on business unit
    const templateHeaders = [
      'Metric_Name',
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
      'Target_Value', 'Unit', 'Data_Type'
    ];

    // Get sample metrics based on business unit
    const getSampleMetrics = (unit: string) => {
      const samples = {
        sales: [
          ['Year_1_ARR_Net_Pipeline', '2100000', '2200000', '2350000', '2450000', '2550000', '2650000', '2700000', '2750000', '2800000', '2850000', '2900000', '2950000', '3200000', '$', 'actual'],
          ['Total_ARR_Pipeline', '3500000', '3600000', '3750000', '3850000', '3950000', '4050000', '4100000', '4150000', '4180000', '4200000', '4250000', '4300000', '4500000', '$', 'actual'],
          ['Win_Rate', '20', '21', '21', '22', '22', '22', '23', '22', '22', '23', '22', '23', '25', '%', 'actual']
        ],
        marketing: [
          ['Total_DMs_Booked', '120', '125', '130', '135', '140', '142', '143', '144', '145', '145', '150', '155', '180', 'meetings', 'actual'],
          ['MQL_to_SQL_Percentage', '42', '43', '44', '44', '45', '45', '45', '45', '45', '46', '46', '47', '50', '%', 'actual'],
          ['Cost_per_MQL', '90', '88', '87', '86', '85', '85', '84', '84', '85', '85', '83', '82', '75', '$', 'actual']
        ],
        professionalServices: [
          ['PS_Revenue_Generated', '1600000', '1650000', '1700000', '1750000', '1800000', '1820000', '1830000', '1840000', '1845000', '1850000', '1860000', '1870000', '2000000', '$', 'actual'],
          ['PS_Margin_Percentage', '65', '66', '67', '67', '68', '68', '68', '68', '68', '69', '69', '70', '70', '%', 'actual'],
          ['Inflight_CSAT_Score', '4.1', '4.1', '4.2', '4.2', '4.2', '4.3', '4.3', '4.3', '4.3', '4.3', '4.4', '4.4', '4.5', '/5', 'actual']
        ],
        customerSuccess: [
          ['Total_ARR', '4200000', '4250000', '4300000', '4350000', '4400000', '4420000', '4440000', '4460000', '4480000', '4500000', '4520000', '4540000', '5000000', '$', 'actual'],
          ['Total_Churn_ARR', '500000', '480000', '470000', '465000', '460000', '455000', '452000', '451000', '450000', '448000', '445000', '440000', '300000', '$', 'actual'],
          ['Total_Adoption_Percentage', '72', '73', '74', '75', '76', '77', '77', '78', '78', '78', '79', '80', '85', '%', 'actual']
        ],
        productEngineering: [
          ['Total_New_Features_Delivered', '24', '25', '26', '26', '27', '27', '28', '28', '28', '28', '29', '30', '32', 'features', 'actual'],
          ['Total_Release_Variance', '88', '89', '90', '91', '91', '92', '92', '92', '92', '93', '93', '94', '95', '%', 'actual'],
          ['Total_Defect_Leakage', '3.2', '3.1', '3.0', '2.9', '2.9', '2.8', '2.8', '2.8', '2.8', '2.7', '2.7', '2.6', '2.0', '%', 'actual']
        ],
        humanResources: [
          ['Total_Offers_Made', '30', '32', '33', '34', '35', '35', '35', '35', '35', '36', '37', '38', '40', 'offers', 'actual'],
          ['Total_Onboardings', '20', '21', '22', '23', '24', '24', '24', '24', '24', '25', '26', '27', '30', 'hires', 'actual'],
          ['Voluntary_Attrition', '9.2', '9.0', '8.8', '8.7', '8.6', '8.5', '8.5', '8.5', '8.5', '8.4', '8.3', '8.2', '7.0', '%', 'actual']
        ]
      };
      return samples[unit as keyof typeof samples] || samples.sales;
    };

    const sampleData = getSampleMetrics(businessUnit);
    const allData = [templateHeaders, ...sampleData];

    // Create Excel workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(allData);
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 25 }, // Metric_Name
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, // Jan-Jun
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, // Jul-Dec
      { wch: 15 }, // Target_Value
      { wch: 8 },  // Unit
      { wch: 10 }  // Data_Type
    ];
    ws['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'KPI Data Template');
    
    // Generate Excel file and download
    const unitName = businessUnitOptions.find(u => u.id === businessUnit)?.name || businessUnit;
    XLSX.writeFile(wb, `${unitName}_KPI_Template.xlsx`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Data Schema & Templates</h2>
          <p className="text-sm text-gray-600">View required data structure for each business unit</p>
        </div>
      </div>

      {/* Business Unit Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Business Unit
        </label>
        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {businessUnitOptions.map(unit => (
            <option key={unit.id} value={unit.id}>{unit.name}</option>
          ))}
        </select>
      </div>

      {/* Schema Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Required Columns */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Required Excel Columns</h3>
          </div>
          
          <div className="space-y-3">
            {schema?.requiredColumns?.map((column: string, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                <span className="font-medium text-gray-900">{column}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Required</span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={() => generateExcelTemplate(selectedUnit)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download KPI Template
            </button>
          </div>
        </div>

        {/* KPI Calculations */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Calculator className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Automated KPI Calculations</h3>
          </div>
          
          <div className="space-y-4">
            {schema?.calculations && Object.entries(schema.calculations).map(([kpi, formula], index) => (
              <div key={index} className="p-4 bg-white rounded-md border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{kpi}</h4>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Auto-calculated</span>
                </div>
                <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                  {formula as string}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sample Data Structure */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Eye className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-blue-900">Sample Excel Data Structure</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">January</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">February</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">March</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schema?.requiredColumns?.slice(0, 4).map((column: string, index: number) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{column}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{Math.floor(Math.random() * 1000)}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{Math.floor(Math.random() * 1000)}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{Math.floor(Math.random() * 1000)}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{Math.floor(Math.random() * 1000)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-sm text-blue-700 mt-4">
          <strong>Note:</strong> Your Excel file should have metrics as rows and months as columns, 
          with a separate "Target\" column for comparison.
        </p>
      </div>
    </div>
  );
}