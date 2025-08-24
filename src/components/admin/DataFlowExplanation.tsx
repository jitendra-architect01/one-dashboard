import React from 'react';
import { Upload, Database, Calculator, TrendingUp, Users, CheckCircle } from 'lucide-react';

const DataFlowExplanation: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Flow & KPI Calculation System</h1>
        <p className="text-lg text-gray-600">
          Understanding how your enterprise platform processes data and calculates KPIs
        </p>
      </div>

      {/* Data Flow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center mb-4">
            <Upload className="w-8 h-8 text-blue-500 mr-3" />
            <h3 className="text-xl font-semibold">1. Data Upload</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Upload Excel files containing business unit metrics and performance data.
          </p>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <strong>Example:</strong><br />
            Sales_January_2025.xlsx<br />
            • New_Leads: 450<br />
            • Qualified_Leads: 180<br />
            • Revenue: $285,000
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center mb-4">
            <Database className="w-8 h-8 text-green-500 mr-3" />
            <h3 className="text-xl font-semibold">2. Data Storage</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Raw data is validated and stored in Supabase PostgreSQL database.
          </p>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <strong>Tables:</strong><br />
            • raw_data_uploads<br />
            • raw_data_entries<br />
            • data_validation_rules
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center mb-4">
            <Calculator className="w-8 h-8 text-purple-500 mr-3" />
            <h3 className="text-xl font-semibold">3. KPI Calculation</h3>
          </div>
          <p className="text-gray-600 mb-4">
            PostgreSQL functions automatically calculate KPIs from raw data.
          </p>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <strong>Auto-calculated:</strong><br />
            • Lead Conversion Rate<br />
            • Deal Close Rate<br />
            • Revenue Attainment
          </div>
        </div>
      </div>

      {/* KPI Calculation Examples */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-500" />
          KPI Calculation Examples
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Sales KPIs</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div><strong>Lead Conversion Rate:</strong></div>
                <div className="font-mono bg-white p-2 rounded">
                  (Qualified_Leads ÷ New_Leads) × 100<br />
                  (180 ÷ 450) × 100 = 40%
                </div>
                
                <div><strong>Deal Close Rate:</strong></div>
                <div className="font-mono bg-white p-2 rounded">
                  (Deals_Closed ÷ Qualified_Leads) × 100<br />
                  (45 ÷ 180) × 100 = 25%
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Revenue KPIs</h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div><strong>Revenue Attainment:</strong></div>
                <div className="font-mono bg-white p-2 rounded">
                  (Actual_Revenue ÷ Target_Revenue) × 100<br />
                  ($285,000 ÷ $320,000) × 100 = 89%
                </div>
                
                <div><strong>Average Deal Size:</strong></div>
                <div className="font-mono bg-white p-2 rounded">
                  Total_Revenue ÷ Deals_Closed<br />
                  $285,000 ÷ 45 = $6,333
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Assignment System */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Users className="w-6 h-6 mr-2 text-green-500" />
          Employee Assignment System
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Automatic Task Creation</h3>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm space-y-2">
                <div><strong>Trigger:</strong> Revenue Attainment &lt; 90%</div>
                <div><strong>Action:</strong> Create "Revenue Recovery Plan"</div>
                <div className="mt-3">
                  <strong>Auto-assigned tasks:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>"Analyze pipeline bottlenecks" → John Smith</li>
                    <li>"Increase outbound prospecting" → Sarah Johnson</li>
                    <li>"Review pricing strategy" → Mike Chen</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Employee Dashboard</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm space-y-2">
                <div><strong>Personal View:</strong></div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Assigned tasks and deadlines</li>
                  <li>Personal performance goals</li>
                  <li>Team KPI contributions</li>
                  <li>Progress tracking</li>
                </ul>
                <div className="mt-3">
                  <strong>Actions Available:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Update task status</li>
                    <li>Log hours worked</li>
                    <li>Add progress comments</li>
                    <li>Mark tasks complete</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Architecture */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <CheckCircle className="w-6 h-6 mr-2 text-purple-500" />
          Technical Architecture
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Database Schema</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <ul className="space-y-1">
                <li><strong>business_units</strong> - Master business unit data</li>
                <li><strong>raw_data_uploads</strong> - File upload tracking</li>
                <li><strong>raw_data_entries</strong> - Individual data points</li>
                <li><strong>kpi_definitions</strong> - Calculation formulas</li>
                <li><strong>calculated_kpis</strong> - Computed KPI values</li>
                <li><strong>employee_profiles</strong> - User information</li>
                <li><strong>initiatives</strong> - Strategic projects</li>
                <li><strong>action_items</strong> - Individual tasks</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Key Features</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <ul className="space-y-1">
                <li>✅ Real-time KPI calculations</li>
                <li>✅ Automated task assignments</li>
                <li>✅ Role-based access control</li>
                <li>✅ Historical data tracking</li>
                <li>✅ Data validation rules</li>
                <li>✅ Audit logging</li>
                <li>✅ Performance analytics</li>
                <li>✅ Employee dashboards</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">1. Connect Supabase</h3>
            <p className="text-sm">Click "Connect to Supabase" to set up your database</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">2. Add Employees</h3>
            <p className="text-sm">Import your team members and assign roles</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">3. Upload Data</h3>
            <p className="text-sm">Start with one business unit to see KPIs calculate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataFlowExplanation;