import React, { useState } from 'react';
import { FileSpreadsheet, Database, Upload, Settings } from 'lucide-react';
import ExcelUploadInterface from '../../components/admin/ExcelUploadInterface';
import DataSchemaViewer from '../../components/admin/DataSchemaViewer';

export default function ExcelDataAdminPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'schema'>('upload');

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
            <p className="text-lg text-gray-600">Upload business unit data and manage database schemas</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="w-4 h-4 mr-2 inline" />
              Data Upload
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schema'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="w-4 h-4 mr-2 inline" />
              Data Schema & Templates
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'upload' && <ExcelUploadInterface />}
        {activeTab === 'schema' && <DataSchemaViewer />}
      </div>
    </div>
  );
}