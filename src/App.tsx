import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import Dashboard from "./pages/Dashboard";
import SalesPage from "./pages/SalesPage";
import MarketingPage from "./pages/MarketingPage";
import ProfessionalServicesPage from "./pages/ProfessionalServicesPage";
import ProductEngineeringPage from "./pages/ProductEngineeringPage";
import CustomerSuccessPage from "./pages/CustomerSuccessPage";
import HumanResourcesPage from "./pages/HumanResourcesPage";
import GeneralAdministrativePage from "./pages/GeneralAdministrativePage";
import SalesAdminPage from "./pages/admin/SalesAdminPage";
import MarketingAdminPage from "./pages/admin/MarketingAdminPage";
import ProfessionalServicesAdminPage from "./pages/admin/ProfessionalServicesAdminPage";
import ProductEngineeringAdminPage from "./pages/admin/ProductEngineeringAdminPage";
import CustomerSuccessAdminPage from "./pages/admin/CustomerSuccessAdminPage";
import HumanResourcesAdminPage from "./pages/admin/HumanResourcesAdminPage";
import GeneralAdministrativeAdminPage from "./pages/admin/GeneralAdministrativeAdminPage";
import CompanyWideKPIAdminPage from "./pages/admin/CompanyWideKPIAdminPage";
import TrendlineAdminPage from "./pages/admin/TrendlineAdminPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ExcelDataAdminPage from "./pages/admin/ExcelDataAdminPage";
import EmployeeManagement from "./components/admin/EmployeeManagement";
import DataFlowPage from "./pages/DataFlowPage";
import EmployeeDashboardPage from "./pages/EmployeeDashboardPage";
import PasswordManagementPage from "./pages/admin/PasswordManagementPage";
import SupabaseKPIAdminPage from "./pages/admin/SupabaseKPIAdminPage";
import DatabaseAdminPage from "./pages/admin/DatabaseAdminPage";
import SecureLoginPage from "./pages/SecureLoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // If not authenticated, show only the secure login page
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<SecureLoginPage />} />
        </Routes>
      </Router>
    );
  }

  // If authenticated, show the full application
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public route (available even when authenticated) */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* Main application routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/marketing" element={<MarketingPage />} />
          <Route
            path="/professional-services"
            element={<ProfessionalServicesPage />}
          />
          <Route
            path="/product-engineering"
            element={<ProductEngineeringPage />}
          />
          <Route path="/customer-success" element={<CustomerSuccessPage />} />
          <Route path="/human-resources" element={<HumanResourcesPage />} />
          <Route
            path="/general-administrative"
            element={<GeneralAdministrativePage />}
          />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/data-flow" element={<DataFlowPage />} />

          {/* Employee routes */}
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute>
                <EmployeeDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/sales/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <SalesAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <MarketingAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professional-services/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ProfessionalServicesAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product-engineering/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ProductEngineeringAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-success/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <CustomerSuccessAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/human-resources/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <HumanResourcesAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/general-administrative/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <GeneralAdministrativeAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/company-kpis"
            element={
              <ProtectedRoute requireAdmin={true}>
                <CompanyWideKPIAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trendlines"
            element={
              <ProtectedRoute requireAdmin={true}>
                <TrendlineAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/excel-upload"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ExcelDataAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute requireAdmin={true}>
                <EmployeeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/password-management"
            element={
              <ProtectedRoute requireAdmin={true}>
                <PasswordManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/supabase-kpis"
            element={
              <ProtectedRoute requireAdmin={true}>
                <SupabaseKPIAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/populate-database"
            element={
              <ProtectedRoute requireAdmin={true}>
                <DatabaseAdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
