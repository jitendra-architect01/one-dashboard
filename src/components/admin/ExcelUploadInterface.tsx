import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface UploadedFile {
  file: File;
  businessUnit: string;
  month: string;
  year: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  preview?: any[];
  errors?: string[];
}

const businessUnitOptions = [
  { id: 'sales', name: 'Sales' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'professionalServices', name: 'Professional Services' },
  { id: 'productEngineering', name: 'Product & Engineering' },
  { id: 'customerSuccess', name: 'Customer Success' },
  { id: 'humanResources', name: 'Human Resources' },
];

export default function ExcelUploadInterface() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [dragActive, setDragActive] = useState(false);
  const { updateKPIs } = useData();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [selectedBusinessUnit, selectedMonth, selectedYear]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    if (!selectedBusinessUnit || !selectedMonth || !selectedYear) {
      alert('Please select business unit, month, and year before uploading');
      return;
    }

    Array.from(files).forEach(file => {
      const supportedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv', // .csv
        'application/csv', // .csv (alternative MIME type)
        'text/plain', // .txt, .tsv
        'application/json' // .json
      ];
      
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const supportedExtensions = ['xlsx', 'xls', 'csv', 'txt', 'tsv', 'json'];
      
      if (supportedTypes.includes(file.type) || supportedExtensions.includes(fileExtension || '')) {
        
        const newFile: UploadedFile = {
          file,
          businessUnit: selectedBusinessUnit,
          month: selectedMonth,
          year: selectedYear,
          status: 'pending'
        };

        setUploadedFiles(prev => [...prev, newFile]);
        processFile(newFile);
      } else {
        alert(`Unsupported file type. Please upload: Excel (.xlsx, .xls), CSV (.csv), Text (.txt, .tsv), or JSON (.json) files`);
      }
    });
  };

  const processFile = async (uploadedFile: UploadedFile) => {
    setUploadedFiles(prev => 
      prev.map(f => f === uploadedFile ? { ...f, status: 'processing' } : f)
    );

    try {
      // Actually parse the Excel file
      const fileData = await readExcelFile(uploadedFile.file);
      
      // Validate the data structure
      const validationResult = validateExcelData(fileData, uploadedFile.businessUnit);
      
      if (validationResult.errors.length > 0) {
        setUploadedFiles(prev => 
          prev.map(f => f === uploadedFile ? { 
            ...f, 
            status: 'error',
            errors: validationResult.errors
          } : f)
        );
        return;
      }
      
      // Process the actual Excel data
      const processedData = await processExcelData(uploadedFile.businessUnit, fileData, uploadedFile.month, uploadedFile.year);
      
      setUploadedFiles(prev => 
        prev.map(f => f === uploadedFile ? { 
          ...f, 
          status: 'success',
          preview: processedData.preview
        } : f)
      );

      // Update KPIs with the processed data
      await updateKPIsFromData(uploadedFile.businessUnit, processedData.calculatedKPIs);
      
    } catch (error) {
      console.error('Error processing Excel file:', error);
      setUploadedFiles(prev => 
        prev.map(f => f === uploadedFile ? { 
          ...f, 
          status: 'error',
          errors: [error instanceof Error ? error.message : 'Failed to process file. Please check the format and try again.']
        } : f)
      );
    }
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Failed to parse Excel file. Please ensure it\'s a valid Excel format.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file.'));
      };
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file);
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const lines = text.split('\n').map(line => line.split(','));
            resolve(lines);
          } catch (error) {
            reject(new Error('Failed to parse CSV file.'));
          }
        };
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const validateExcelData = (data: any[], businessUnit: string) => {
    const errors: string[] = [];
    
    if (!data || data.length < 2) {
      errors.push('File appears to be empty or has insufficient data.');
      return { errors };
    }
    
    const headers = data[0];
    if (!headers || !Array.isArray(headers)) {
      errors.push('Invalid file format. First row should contain column headers.');
      return { errors };
    }
    
    // Check for required columns
    const requiredColumns = ['Metric_Name'];
    const monthColumns = months.map(m => m.toLowerCase());
    
    requiredColumns.forEach(col => {
      if (!headers.some((h: string) => h && h.toLowerCase().includes(col.toLowerCase()))) {
        errors.push(`Missing required column: ${col}`);
      }
    });
    
    // Check for at least some month columns
    const hasMonthColumns = monthColumns.some(month => 
      headers.some((h: string) => h && h.toLowerCase().includes(month))
    );
    
    if (!hasMonthColumns) {
      errors.push('No month columns found. Please include monthly data columns (January, February, etc.)');
    }
    
    return { errors };
  };

  const processExcelData = async (businessUnit: string, excelData: any[], month: string, year: string) => {
    if (!excelData || excelData.length < 2) {
      throw new Error('Invalid Excel data format');
    }
    
    const headers = excelData[0];
    const dataRows = excelData.slice(1);
    
    // Find column indices
    const metricNameIndex = headers.findIndex((h: string) => 
      h && h.toLowerCase().includes('metric') && h.toLowerCase().includes('name')
    );
    
    const monthIndices = months.map(month => 
      headers.findIndex((h: string) => h && h.toLowerCase().includes(month.toLowerCase()))
    );
    
    const targetIndex = headers.findIndex((h: string) => 
      h && h.toLowerCase().includes('target')
    );
    
    const unitIndex = headers.findIndex((h: string) => 
      h && h.toLowerCase().includes('unit')
    );
    
    // Process each row
    const processedMetrics = dataRows
      .filter(row => row && row[metricNameIndex]) // Filter out empty rows
      .map(row => {
        const metricName = row[metricNameIndex];
        const monthlyValues = monthIndices.map(index => 
          index >= 0 ? (parseFloat(row[index]) || 0) : 0
        );
        const target = targetIndex >= 0 ? (parseFloat(row[targetIndex]) || 0) : 0;
        const unit = unitIndex >= 0 ? (row[unitIndex] || '') : '';
        
        return {
          metric: metricName,
          monthlyData: monthlyValues,
          target,
          unit,
          current: monthlyValues[new Date().getMonth()] || monthlyValues[monthlyValues.length - 1] || 0
        };
      });
    
    // Calculate KPIs from the processed data
    const calculatedKPIs = calculateKPIsFromProcessedData(businessUnit, processedMetrics);
    
    return {
      preview: processedMetrics.slice(0, 5).map(metric => ({
        metric: metric.metric,
        value: metric.current,
        target: metric.target
      })),
      calculatedKPIs,
      processedMetrics
    };
  };

  const calculateKPIsFromProcessedData = (businessUnit: string, metrics: any[]) => {
    // Convert processed metrics to KPI format
    return metrics.map((metric, index) => {
      const percentage = metric.target > 0 ? (metric.current / metric.target) * 100 : 0;
      
      return {
        id: index + 1,
        name: metric.metric.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        current: metric.current,
        target: metric.target,
        unit: metric.unit,
        period: 'Current',
        trend: percentage >= 100 ? 'up' : percentage >= 90 ? 'neutral' : 'down',
        color: getBusinessUnitColor(businessUnit),
        isVisibleOnDashboard: false,
        monthlyData: metric.monthlyData
      };
    });
  };

  const getBusinessUnitColor = (businessUnit: string) => {
    const colors = {
      sales: 'bg-blue-500',
      marketing: 'bg-green-500',
      professionalServices: 'bg-orange-500',
      productEngineering: 'bg-indigo-500',
      customerSuccess: 'bg-teal-500',
      humanResources: 'bg-pink-500'
    };
    return colors[businessUnit as keyof typeof colors] || 'bg-gray-500';
  };

  const updateKPIsFromData = async (businessUnit: string, calculatedKPIs: any[]) => {
    try {
      // Update the KPIs in the data context
      updateKPIs(businessUnit, calculatedKPIs);
      console.log(`Successfully updated ${calculatedKPIs.length} KPIs for ${businessUnit}`);
    } catch (error) {
      console.error('Error updating KPIs:', error);
      throw new Error('Failed to update KPIs with uploaded data');
    }
  };

  const downloadTemplate = (businessUnit: string) => {
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
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Excel Data Integration</h1>
            <p className="text-lg text-gray-600">Upload business unit data to automatically calculate KPIs</p>
          </div>
        </div>

        {/* Upload Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Unit *
              </label>
              <select
                value={selectedBusinessUnit}
                onChange={(e) => setSelectedBusinessUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Business Unit</option>
                {businessUnitOptions.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month *
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Month</option>
                {months.map((month, index) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          {selectedBusinessUnit && (
            <div className="mb-6">
              <button
                onClick={() => downloadTemplate(selectedBusinessUnit)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template for {businessUnitOptions.find(u => u.id === selectedBusinessUnit)?.name}
              </button>
            </div>
          )}
        </div>

        {/* File Upload Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Excel File</h2>
          
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept=".xlsx,.xls,.csv,.txt,.tsv,.json"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your Excel or CSV files here, or click to browse
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Supports .xlsx, .xls, .csv, .txt, .tsv, and .json files
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Uploaded Files</h2>
            
            <div className="space-y-4">
              {uploadedFiles.map((uploadedFile, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{uploadedFile.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {businessUnitOptions.find(u => u.id === uploadedFile.businessUnit)?.name} • 
                          {uploadedFile.month} {uploadedFile.year}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {uploadedFile.status === 'processing' && (
                        <div className="flex items-center text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Processing...
                        </div>
                      )}
                      {uploadedFile.status === 'success' && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Success
                        </div>
                      )}
                      {uploadedFile.status === 'error' && (
                        <div className="flex items-center text-red-600">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Error
                        </div>
                      )}
                    </div>
                  </div>

                  {uploadedFile.preview && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Data Preview</h4>
                        <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4 mr-1" />
                          View Full Data
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {uploadedFile.preview.slice(0, 4).map((row, rowIndex) => {
                              const performance = ((row.value / row.target) * 100).toFixed(1);
                              return (
                                <tr key={rowIndex}>
                                  <td className="px-3 py-2 text-sm font-medium text-gray-900">{row.metric}</td>
                                  <td className="px-3 py-2 text-sm text-gray-900">{row.value.toLocaleString()}</td>
                                  <td className="px-3 py-2 text-sm text-gray-900">{row.target.toLocaleString()}</td>
                                  <td className="px-3 py-2 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      parseFloat(performance) >= 100 
                                        ? 'bg-green-100 text-green-800'
                                        : parseFloat(performance) >= 80
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {performance}%
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {uploadedFile.errors && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">Errors:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {uploadedFile.errors.map((error, errorIndex) => (
                          <li key={errorIndex}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">How to use Excel Data Integration:</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Select the business unit, month, and year for your data</li>
            <li>Download the template specific to your business unit (Excel format recommended)</li>
            <li>Fill in your raw data in the template or prepare your own file format</li>
            <li>Upload your data file using the drag & drop area</li>
            <li>Review the data preview and calculated KPIs</li>
            <li>KPIs on your dashboard will automatically update with the new calculations</li>
          </ol>
          
          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Supported File Formats:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-blue-800">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span><strong>Excel:</strong> .xlsx, .xls</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span><strong>CSV:</strong> .csv</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span><strong>Text:</strong> .txt, .tsv</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span><strong>JSON:</strong> .json</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}