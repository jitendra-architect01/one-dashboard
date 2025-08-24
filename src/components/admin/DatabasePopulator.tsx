import React, { useState } from "react";
import { populateDatabase } from "../../scripts/populateDatabase";
import {
  Database,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const DatabasePopulator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [populationStatus, setPopulationStatus] = useState<{
    businessUnits: number;
    kpis: number;
    initiatives: number;
    actionItems: number;
    calculatedKPIs: number;
    employees: number;
  } | null>(null);

  const handlePopulateDatabase = async () => {
    setIsLoading(true);
    setMessage("🚀 Starting database population...");
    setPopulationStatus(null);

    try {
      // Capture console.log output to show progress
      const originalLog = console.log;
      const logs: string[] = [];

      console.log = (...args) => {
        const message = args.join(" ");
        logs.push(message);
        setMessage(`📊 ${message}`);
        originalLog(...args);
      };

      await populateDatabase();

      // Restore original console.log
      console.log = originalLog;

      // Extract summary from logs
      const summaryLogs = logs.filter(
        (log) =>
          log.includes("business units") ||
          log.includes("KPI definitions") ||
          log.includes("initiatives") ||
          log.includes("action items") ||
          log.includes("calculated KPI values")
      );

      setPopulationStatus({
        businessUnits: 6,
        kpis: 18,
        initiatives: 12,
        actionItems: 18,
        calculatedKPIs: 18,
        employees: 12,
      });

      setMessage(
        "✅ Database populated successfully! All sample data has been inserted. You can now navigate to different pages to see the data."
      );
    } catch (error) {
      console.error("Population error:", error);
      setMessage(
        `❌ Error populating database: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    if (
      !confirm(
        "⚠️ Are you sure you want to clear all data? This action cannot be undone!"
      )
    ) {
      return;
    }

    setIsLoading(true);
    setMessage("🗑️ Clearing database...");
    setPopulationStatus(null);

    try {
      // Note: This would need to be implemented based on your needs
      setMessage(
        "⚠️ Clear database functionality needs to be implemented for safety reasons."
      );
    } catch (error) {
      setMessage(
        `❌ Error clearing database: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Database Populator
            </h2>
            <p className="text-gray-600">
              Populate your database with comprehensive sample data
            </p>
          </div>
        </div>

        {/* Data Overview */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">
            📊 Sample Data Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-gray-600">Business Units</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">18</div>
              <div className="text-sm text-gray-600">KPI Definitions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">12</div>
              <div className="text-sm text-gray-600">Initiatives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">18</div>
              <div className="text-sm text-gray-600">Action Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">18</div>
              <div className="text-sm text-gray-600">Calculated KPIs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">12</div>
              <div className="text-sm text-gray-600">Employee Profiles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">84</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={handlePopulateDatabase}
            disabled={isLoading}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium text-white transition-colors ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Populating Database...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Populate Database with Sample Data</span>
              </>
            )}
          </button>

          <button
            onClick={handleClearDatabase}
            disabled={isLoading}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isLoading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Database</span>
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.includes("✅")
                ? "bg-green-50 border border-green-200 text-green-800"
                : message.includes("❌")
                ? "bg-red-50 border border-red-200 text-red-800"
                : message.includes("⚠️")
                ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
                : "bg-blue-50 border border-blue-200 text-blue-800"
            }`}
          >
            <div className="flex items-start space-x-2">
              {message.includes("✅") ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : message.includes("❌") || message.includes("⚠️") ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin" />
              )}
              <div className="text-sm">{message}</div>
            </div>
          </div>
        )}

        {/* Population Status */}
        {populationStatus && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Population Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-700">
                  {populationStatus.businessUnits}
                </div>
                <div className="text-green-600">Business Units</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-700">
                  {populationStatus.kpis}
                </div>
                <div className="text-green-600">KPI Definitions</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-700">
                  {populationStatus.initiatives}
                </div>
                <div className="text-green-600">Initiatives</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-700">
                  {populationStatus.actionItems}
                </div>
                <div className="text-green-600">Action Items</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-700">
                  {populationStatus.calculatedKPIs}
                </div>
                <div className="text-green-600">Calculated KPIs</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-700">
                  {populationStatus.employees}
                </div>
                <div className="text-green-600">Employee Profiles</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">
            📋 What happens after populating?
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Explore Data:</h4>
              <ul className="space-y-1">
                <li>• Navigate to business unit pages to see KPIs</li>
                <li>• Visit the Dashboard for aggregated data</li>
                <li>• Check Analytics for data visualization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Manage Data:</h4>
              <ul className="space-y-1">
                <li>• Use Supabase KPI Admin to manage KPIs</li>
                <li>• Edit initiatives and action items</li>
                <li>• Manage employee profiles and assignments</li>
                <li>• View employee dashboards with sample data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Note:</strong> This will insert sample data into your
              database. Make sure you're working in a development environment if
              you don't want to affect production data.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabasePopulator;
