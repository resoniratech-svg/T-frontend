import { Routes, Route } from "react-router-dom";

// Layouts
import DashboardLayout from "../layouts/DashboardLayout";

// Auth / Public pages
import Landing from "../pages/common/Landing";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import CompanySelection from "../pages/auth/CompanySelection";
import Unauthorized from "../pages/common/Unauthorized";

// Route guard
import ProtectedRoute from "./ProtectedRoute";

// Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import Settings from "../pages/admin/Settings";
import AccountsDashboard from "../pages/accounts/AccountsDashboard";
import PMDashboard from "../pages/pm/PMDashboard";
import Users from "../pages/admin/Users";
import CreateUser from "../pages/admin/CreateUser";

import Permissions from "../pages/admin/Permissions";
import EditUser from "../pages/admin/EditUser";

import Projects from "../pages/pm/Projects";
import CreateProject from "../pages/pm/CreateProject";
import EditProject from "../pages/pm/EditProject";
import Jobs from "../pages/pm/Jobs";
import CreateJob from "../pages/pm/CreateJob";
import JobDetails from "../pages/pm/JobDetails";
import JobDocuments from "../pages/pm/JobDocuments";

import Clients from "../pages/admin/Clients";
import CreateClient from "../pages/admin/CreateClient";
import ClientDetails from "../pages/admin/ClientDetails";
import EditClient from "../pages/admin/EditClient";
import AdminPROTracking from "../pages/admin/AdminPROTracking";

import Quotations from "../pages/pm/Quotations";
import CreateQuotation from "../pages/pm/CreateQuotation";
import QuotationDetails from "../pages/pm/QuotationDetails";
import QuotationPrint from "../pages/pm/QuotationPrint";

import Proposals from "../pages/admin/Proposals";
import CreateProposal from "../pages/admin/CreateProposal";
import ProposalDetails from "../pages/admin/ProposalDetails";

import Invoices from "../pages/pm/Invoices";
import CreateInvoice from "../pages/pm/CreateInvoice";
import InvoiceDetails from "../pages/accounts/InvoiceDetails";
import Payments from "../pages/accounts/Payments";
import Expenses from "../pages/accounts/Expenses";
import CreateExpense from "../pages/accounts/CreateExpense";
import ExpenseDetails from "../pages/accounts/ExpenseDetails";

import ProfitLoss from "../pages/accounts/ProfitLoss";
import BalanceSheet from "../pages/accounts/BalanceSheet";
import FinancialReports from "../pages/accounts/FinancialReports";
import Receipts from "../pages/accounts/Receipts";
import Ledger from '../pages/accounts/Ledger';
import CreditControl from "../pages/accounts/CreditControl";

import ClientDashboard from "../pages/client_portal/ClientDashboard";
import ClientProjects from "../pages/client_portal/ClientProjects";
import ClientBilling from "../pages/client_portal/ClientBilling";
import ClientQuotations from "../pages/client_portal/ClientQuotations";
import ClientDocuments from "../pages/client_portal/ClientDocuments";
import ClientPROServices from "../pages/client_portal/ClientPROServices";
// ClientProfile is now superseded by MyProfile

// Employee Management
import EmployeeDashboard from "../pages/employees/EmployeeDashboard";
import EmployeeList from "../pages/employees/EmployeeList";
import AddEditEmployee from "../pages/employees/AddEditEmployee";
import EmployeeDetail from "../pages/employees/EmployeeDetail";
import KahramaaServices from "../pages/kahramaa/KahramaaServices";
import MyProfile from "../pages/common/MyProfile";

import { useAuth } from "../context/AuthContext";
import { ROLE_DASHBOARD_MAP } from "../types/user";
import { Navigate } from "react-router-dom";

function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_DASHBOARD_MAP[user.role]} replace />;
}

function PROServicesPage() {
  const { user } = useAuth();
  if (user?.role === "CLIENT") return <ClientPROServices />;
  return <AdminPROTracking />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ─── Public Routes ─────────────────────────────── */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/select-company" element={<CompanySelection />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* ─── Protected Routes with Dashboard Layout ─── */}
      <Route element={<DashboardLayout />}>
        {/* Dashboards (Role-based Base) */}
        <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["ACCOUNTS"]} />}>
          <Route path="/accounts/dashboard" element={<AccountsDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["PROJECT_MANAGER"]} />}>
          <Route path="/pm/dashboard" element={<PMDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["CLIENT"]} />}>
          <Route path="/client/dashboard" element={<ClientDashboard />} />
        </Route>

        {/* Dynamic Sections Base on sidebarMenu permissions */}

        {/* User Management — SUPER_ADMIN only (RBAC enforced) */}
        <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} requiredSections={["User Management"]} />}>
          <Route path="/users" element={<Users />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/edit-user/:id" element={<EditUser />} />

          <Route path="/permissions" element={<Permissions />} />
        </Route>

        {/* Projects */}
        <Route element={<ProtectedRoute requiredSections={["Projects"]} />}>
          <Route path="/projects" element={<Projects />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/edit-project/:id" element={<EditProject />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/create-job" element={<CreateJob />} />
          <Route path="/job-details" element={<JobDetails />} />
        </Route>

        {/* Estimations & Sales (Consolidated) */}
        <Route element={<ProtectedRoute requiredSections={["Estimations"]} />}>
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/quotations/:division" element={<Quotations />} />
          <Route path="/invoices" element={<Quotations />} />
          <Route path="/invoices/:division" element={<Quotations />} />
          <Route path="/create-quotation" element={<CreateQuotation />} />
          <Route path="/create-quotation/:division" element={<CreateQuotation />} />
          <Route path="/edit-quotation/:id" element={<CreateQuotation />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/create-proposal" element={<CreateProposal />} />
          <Route path="/edit-proposal/:id" element={<CreateProposal />} />
          <Route path="/draft-proposals" element={<Proposals filter="Draft" />} />
          <Route path="/proposal-templates" element={<Proposals filter="Templates" />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/create-invoice" element={<CreateInvoice />} />
          <Route path="/create-invoice/:division" element={<CreateInvoice />} />
          <Route path="/edit-invoice/:id" element={<CreateInvoice />} />
        </Route>

        {/* Clients */}
        <Route element={<ProtectedRoute requiredSections={["Client Portal"]} />}>
          <Route path="/clients" element={<Clients />} />
          <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
            <Route path="/create-client" element={<CreateClient />} />
          </Route>
          <Route path="/client-details/:id" element={<ClientDetails />} />
          <Route path="/edit-client/:id" element={<EditClient />} />
          <Route path="/admin/pro-tracking" element={<AdminPROTracking />} />
        </Route>

        <Route element={<ProtectedRoute requiredSections={["Accounting"]} />}>
          <Route path="/credit-control" element={<CreditControl />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/create-expense" element={<CreateExpense />} />
          <Route path="/edit-expense/:id" element={<CreateExpense />} />
          <Route path="/expense-details/:id" element={<ExpenseDetails />} />

          <Route path="/receipts" element={<Receipts />} />
          <Route path="/ledger" element={<Ledger />} />
        </Route>

        {/* Reports */}
        <Route element={<ProtectedRoute requiredSections={["Reports"]} />}>
          <Route path="/financial-reports" element={<FinancialReports />} />
          <Route path="/profit-loss" element={<ProfitLoss />} />
          <Route path="/balance-sheet" element={<BalanceSheet />} />
        </Route>

        {/* Employee Management */}
        <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "PROJECT_MANAGER", "ACCOUNTS", "CLIENT"]} />}>
          <Route path="/employees" element={<EmployeeDashboard />} />
          <Route path="/employees/list" element={<EmployeeList />} />
          <Route path="/employees/create" element={<AddEditEmployee />} />
          <Route path="/employees/edit/:id" element={<AddEditEmployee />} />
          <Route path="/employees/details/:id" element={<EmployeeDetail />} />
        </Route>
        
        {/* Kahramaa Services */}
        <Route element={<ProtectedRoute requiredSections={["Kahramaa Services"]} />}>
          <Route path="/kahramaa-services" element={<KahramaaServices />} />
        </Route>

        {/* Client Portal */}
        <Route element={<ProtectedRoute requiredSections={["Client Portal"]} />}>
          <Route path="/client/projects" element={<ClientProjects />} />
          <Route path="/client/billing" element={<ClientBilling />} />
          <Route path="/client/quotations" element={<ClientQuotations />} />
          <Route path="/client/documents" element={<ClientDocuments />} />
          <Route path="/pro-services" element={<PROServicesPage />} />
          <Route path="/client/pro-services" element={<ClientPROServices />} />
          <Route path="/client/profile" element={<MyProfile />} />
          <Route path="/profile" element={<MyProfile />} />
        </Route>

        {/* Shared items available to basically anyone authenticated correctly */}
        <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "PROJECT_MANAGER", "ACCOUNTS", "CLIENT"]} />}>
          <Route path="/job-documents" element={<JobDocuments />} />
          <Route path="/proposal-details/:id" element={<ProposalDetails />} />
          <Route path="/invoice-details/:id" element={<InvoiceDetails />} />
          <Route path="/quotation-details/:id" element={<QuotationDetails />} />
        </Route>
      </Route>

      {/* Standalone Print Route (Bypasses Layout) */}
      <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "PROJECT_MANAGER", "ACCOUNTS"]} />}>
        <Route path="/quotation/print/:id" element={<QuotationPrint />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;