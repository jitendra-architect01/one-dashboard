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
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string>('sales');
  const [selectedMonth, setSelectedMonth] = useState<string>('1');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { updateKPIs, businessUnits, updateKPI } = useData();

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

    // Use the new handleFileUpload function for better message handling
    handleFileUpload(files);
  };

  const processFile = async (uploadedFile: UploadedFile) => {
    console.log('Starting to process file:', uploadedFile.file.name);
    
    // Clear previous messages
    setUploadSuccess(null);
    setUploadError(null);
    
    setUploadedFiles(prev => 
      prev.map(f => f === uploadedFile ? { ...f, status: 'processing' } : f)
    );

    try {
      console.log('Reading Excel file...');
      // Actually parse the Excel file
      const fileData = await readExcelFile(uploadedFile.file);
      console.log('File data read successfully:', fileData.length, 'rows');
      
      console.log('Validating data structure...');
      // Validate the data structure
      const validationResult = validateExcelData(fileData, uploadedFile.businessUnit);
      
      if (validationResult.errors.length > 0) {
        console.log('Validation errors:', validationResult.errors);
        const errorMessage = `Validation failed: ${validationResult.errors.join(', ')}`;
        setUploadError(errorMessage);
        setUploadedFiles(prev => 
          prev.map(f => f === uploadedFile ? { 
            ...f, 
            status: 'error',
            errors: validationResult.errors
          } : f)
        );
        return;
      }
      
      console.log('Processing Excel data...');
      // Process the actual Excel data
      const processedData = await processExcelData(uploadedFile.businessUnit, fileData, uploadedFile.month, uploadedFile.year);
      console.log('Data processed successfully:', processedData.calculatedKPIs.length, 'KPIs');
      
      setUploadedFiles(prev => 
        prev.map(f => f === uploadedFile ? { 
          ...f, 
          status: 'success',
          preview: processedData.preview
        } : f)
      );

      console.log('Updating KPIs with processed data...');
      // Update KPIs with the processed data
      await updateKPIsFromData(uploadedFile.businessUnit, processedData.calculatedKPIs);
      console.log('File processing completed successfully');
      
      // Set success message
      setUploadSuccess(`Successfully uploaded and processed ${processedData.calculatedKPIs.length} KPIs for ${uploadedFile.businessUnit}`);
      
    } catch (error) {
      console.error('Error processing Excel file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file. Please check the format and try again.';
      setUploadError(errorMessage);
      setUploadedFiles(prev => 
        prev.map(f => f === uploadedFile ? { 
          ...f, 
          status: 'error',
          errors: [errorMessage]
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
    const requiredColumns = ['Metric_Name', 'Data_Type'];
    
    requiredColumns.forEach(col => {
      if (!headers.some((h: string) => h && h.toLowerCase().includes(col.toLowerCase()))) {
        errors.push(`Missing required column: ${col}`);
      }
    });
    
    // Check for at least some month columns (should be between Metric_Name and Data_Type)
    const metricNameIndex = headers.findIndex((h: string) => 
      h && h.toLowerCase().includes('metric') && h.toLowerCase().includes('name')
    );
    const dataTypeIndex = headers.findIndex((h: string) => 
      h && h.toLowerCase().includes('data') && h.toLowerCase().includes('type')
    );
    
    if (metricNameIndex === -1 || dataTypeIndex === -1) {
      errors.push('Missing required columns: Metric_Name or Data_Type');
      return { errors };
    }
    
    // Check if there are month columns between Metric_Name and Data_Type
    const monthColumns = headers.slice(metricNameIndex + 1, dataTypeIndex);
    if (monthColumns.length === 0) {
      errors.push('No month columns found between Metric_Name and Data_Type');
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
    
    const dataTypeIndex = headers.findIndex((h: string) => 
      h && h.toLowerCase().includes('data') && h.toLowerCase().includes('type')
    );
    
    // Get month columns (between Metric_Name and Data_Type)
    const monthColumns = headers.slice(metricNameIndex + 1, dataTypeIndex);
    
    // Process each row
    const processedMetrics = dataRows
      .filter(row => row && row[metricNameIndex]) // Filter out empty rows
      .map(row => {
        const metricName = row[metricNameIndex];
        
        // Extract monthly values from month columns
        const monthlyValues = monthColumns.map((monthHeader: string, index: number) => {
          const columnIndex = metricNameIndex + 1 + index;
          return parseFloat(row[columnIndex]) || 0;
        });
        
        // Find the KPI in the current business unit to get target and unit
        const currentKPI = businessUnits[businessUnit]?.kpis.find(kpi => 
          kpi.name.toLowerCase() === metricName.toLowerCase()
        );
        
        return {
          metric: metricName,
          monthlyData: monthlyValues,
          target: currentKPI?.target || 0,
          unit: currentKPI?.unit || '',
          current: monthlyValues[monthlyValues.length - 1] || 0 // Use last month's value as current
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
      console.log(`Starting to update ${calculatedKPIs.length} KPIs for ${businessUnit}`);
      
      if (calculatedKPIs.length === 0) {
        console.log('No KPIs to update');
        return;
      }
      
      let successCount = 0;
      let errorCount = 0;
      
      // Update each KPI with its monthly data
      for (const kpi of calculatedKPIs) {
        console.log(`Processing KPI: ${kpi.name}`);
        
        // Validate KPI data
        if (!kpi.name || kpi.current === undefined || isNaN(kpi.current)) {
          console.error(`Invalid KPI data for ${kpi.name}:`, kpi);
          errorCount++;
          continue;
        }
        
        // Find the existing KPI in the business unit
        const existingKPI = businessUnits[businessUnit]?.kpis.find(existing => 
          existing.name.toLowerCase() === kpi.name.toLowerCase()
        );
        
        if (existingKPI) {
          console.log(`Found existing KPI: ${existingKPI.name}, updating...`);
          
          // Update the KPI with new monthly data and current value
          try {
            console.log(`Updating KPI ${existingKPI.name} with current value: ${kpi.current}`);
            
            // Add timeout to prevent hanging
            const updatePromise = updateKPI(businessUnit, existingKPI.id, {
              // monthlyData: kpi.monthlyData, // Temporarily removed - database schema doesn't support this field
              current: kpi.current
            });
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Update timeout after 30 seconds')), 30000)
            );
            
            await Promise.race([updatePromise, timeoutPromise]);
            console.log(`Successfully updated KPI: ${existingKPI.name}`);
            successCount++;
          } catch (updateError) {
            console.error(`Error updating KPI ${existingKPI.name}:`, updateError);
            errorCount++;
            // Continue with other KPIs instead of failing completely
          }
        } else {
          console.log(`No existing KPI found for: ${kpi.name}`);
          errorCount++;
        }
      }
      
      console.log(`Update completed: ${successCount} successful, ${errorCount} errors`);
      
      if (errorCount > 0) {
        throw new Error(`Updated ${successCount} KPIs successfully, but ${errorCount} failed`);
      }
      
      console.log(`Successfully updated ${calculatedKPIs.length} KPIs for ${businessUnit}`);
    } catch (error) {
      console.error('Error updating KPIs:', error);
      throw new Error('Failed to update KPIs with uploaded data');
    }
  };

  const downloadTemplate = (businessUnit: string) => {
    // Fetch current KPIs for the selected business unit
    const currentKPIs = businessUnits[businessUnit]?.kpis || [];

    // Get current month and year for dynamic column generation
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11 (January = 0)
    
    // Generate month headers from January to current month
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthsToShow = monthNames.slice(0, currentMonth + 1);
    
    // Generate Excel template content based on business unit
    const templateHeaders = [
      'Metric_Name',
      ...monthsToShow,
      'Data_Type'
    ];

    // Generate template data from current KPIs
    const generateTemplateData = () => {
      if (currentKPIs.length === 0) {
        // Fallback to sample data if no KPIs exist
        return getSampleMetrics(businessUnit, monthsToShow.length);
      }

      return currentKPIs.map(kpi => {
        // Create monthly data array for months from January to current month
        const monthlyData = [];
        
        for (let i = 0; i <= currentMonth; i++) {
          if (kpi.monthlyData && kpi.monthlyData.length > i) {
            // Use existing monthly data if available
            monthlyData.push(kpi.monthlyData[i].toString());
          } else {
            // Use current value divided by number of months as placeholder
            const monthlyValue = Math.round(kpi.current / (currentMonth + 1));
            monthlyData.push(monthlyValue.toString());
          }
        }

        return [
          kpi.name,
          ...monthlyData,
          'actual'
        ];
      });
    };

    // Get sample metrics based on business unit (fallback) - updated for dynamic months
    const getSampleMetrics = (unit: string, monthCount: number) => {
      const samples = {
        sales: [
          ['Year_1_ARR_Net_Pipeline', ...Array(monthCount).fill('0'), 'actual'],
          ['Total_ARR_Pipeline', ...Array(monthCount).fill('0'), 'actual'],
          ['Win_Rate', ...Array(monthCount).fill('0'), 'actual']
        ],
        marketing: [
          ['Total_DMs_Booked', ...Array(monthCount).fill('0'), 'actual'],
          ['MQL_to_SQL_Percentage', ...Array(monthCount).fill('0'), 'actual'],
          ['Cost_per_MQL', ...Array(monthCount).fill('0'), 'actual']
        ],
        professionalServices: [
          ['PS_Revenue_Generated', ...Array(monthCount).fill('0'), 'actual'],
          ['PS_Margin_Percentage', ...Array(monthCount).fill('0'), 'actual'],
          ['Inflight_CSAT_Score', ...Array(monthCount).fill('0'), 'actual']
        ],
        customerSuccess: [
          ['Total_ARR', ...Array(monthCount).fill('0'), 'actual'],
          ['Total_Churn_ARR', ...Array(monthCount).fill('0'), 'actual'],
          ['Total_Adoption_Percentage', ...Array(monthCount).fill('0'), 'actual']
        ],
        productEngineering: [
          ['Total_New_Features_Delivered', ...Array(monthCount).fill('0'), 'actual'],
          ['Total_Release_Variance', ...Array(monthCount).fill('0'), 'actual'],
          ['Total_Defect_Leakage', ...Array(monthCount).fill('0'), 'actual']
        ],
        humanResources: [
          ['Total_Offers_Made', ...Array(monthCount).fill('0'), 'actual'],
          ['Total_Onboardings', ...Array(monthCount).fill('0'), 'actual'],
          ['Voluntary_Attrition', ...Array(monthCount).fill('0'), 'actual']
        ]
      };
      return samples[unit as keyof typeof samples] || samples.sales;
    };

    const templateData = generateTemplateData();
    const allData = [templateHeaders, ...templateData];

    // Create Excel workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(allData);
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 25 }, // Metric_Name
      ...Array(monthsToShow.length).fill({ wch: 12 }), // Monthly columns
      { wch: 10 }  // Data_Type
    ];
    ws['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'KPI Data Template');
    
    // Generate Excel file and download
    const unitName = businessUnitOptions.find(u => u.id === businessUnit)?.name || businessUnit;
    XLSX.writeFile(wb, `${unitName}_KPI_Template.xlsx`);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Clear previous messages
    setUploadSuccess(null);
    setUploadError(null);
    
    const validFiles: File[] = [];
    
    // Validate file types
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
        validFiles.push(file);
      } else {
        alert(`Unsupported file type: ${file.name}. Please upload: Excel (.xlsx, .xls), CSV (.csv), Text (.txt, .tsv), or JSON (.json) files`);
      }
    });
    
    if (validFiles.length === 0) return;
    
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      businessUnit: selectedBusinessUnit,
      month: selectedMonth,
      year: selectedYear,
      status: 'pending' as const,
      errors: [],
      preview: []
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Process each file
    newFiles.forEach(processFile);
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

        {/* Success and Error Messages */}
        {uploadSuccess && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{uploadSuccess}</p>
              </div>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{uploadError}</p>
              </div>
            </div>
          </div>
        )}

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
          <h3 className="text-lg font-medium text-blue-900 mb-3">How to use Employee Bulk Upload:</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Select the business unit for the employees you want to add</li>
            <li>Download the employee template (Excel format recommended)</li>
            <li>Fill in employee information in the template with all required fields</li>
            <li>Upload your employee data file using the drag & drop area</li>
            <li>Review the employee data preview for accuracy</li>
            <li>New employees will be added to the system with default passwords</li>
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