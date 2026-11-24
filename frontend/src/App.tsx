import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Public
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import FindAccountPage from './pages/FindAccountPage'

// Onboarding
import RegisterPage from './components/onboarding/RegisterPage'
import OnboardingShell from './components/onboarding/OnboardingShell'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminFlats from './pages/admin/Flats'
import AdminProperties from './pages/admin/Properties'
import AdminResidents from './pages/admin/Residents'
import AdminBilling from './pages/admin/Billing'
import AdminVisitors from './pages/admin/Visitors'
import AdminAssets from './pages/admin/Assets'
import AdminParking from './pages/admin/Parking'
import AdminStaff from './pages/admin/Staff'
import AdminNotices from './pages/admin/Notices'
import AdminComplaints from './pages/admin/Complaints'
import AdminSettings from './pages/admin/Settings'
import AdminUsers from './pages/admin/Users'
import AdminExpenses from './pages/admin/Expenses'
import AdminBulkExpenseEntry from './pages/admin/BulkExpenseEntry'
import AdminFinance from './pages/admin/Finance'
import AdminExpenseAnalytics from './pages/admin/ExpenseAnalytics'
import AdminMonthlyReport from './pages/admin/MonthlyReport'
import AdminIncome from './pages/admin/Income'
import AdminInvoices from './pages/admin/Invoices'
import AdminEvents from './pages/admin/Events'
import AdminVendors from './pages/admin/Vendors'
import AdminBulkPropertySetup from './pages/admin/BulkPropertySetup'
import AdminHelpers from './pages/admin/Helpers'
import AdminCommittee from './pages/admin/Committee'
import AdminBulkResidentEntry from './pages/admin/BulkResidentEntry'
import AdminBulkStaffEntry from './pages/admin/BulkStaffEntry'
import AdminBulkHelperEntry from './pages/admin/BulkHelperEntry'
import AdminACLSettings from './pages/admin/ACLSettings'
import AdminPropertyResidentSetup from './pages/admin/PropertyResidentSetup'
import AdminResidentProfile from './pages/admin/ResidentProfile'
import AdminAlerts from './pages/admin/Alerts'

// Shared
import Notes from './pages/Notes'
import UnauthorizedPage from './pages/UnauthorizedPage'

// Resident pages
import ResidentDashboard from './pages/resident/Dashboard'
import ResidentPay from './pages/resident/Pay'
import ResidentBills from './pages/resident/Bills'
import ResidentComplaints from './pages/resident/Complaints'
import ResidentNotices from './pages/resident/Notices'
import ResidentVisitors from './pages/resident/Visitors'
import ResidentDirectory from './pages/resident/Directory'
import ResidentNotifications from './pages/resident/Notifications'
import ResidentProfile from './pages/resident/Profile'
import ResidentHelpers from './pages/resident/Helpers'
import ResidentCommittee from './pages/resident/Committee'

// Resident security
import ResidentSecuritySettings from './pages/resident/SecuritySettings'

// Guard pages
import GuardVisitorEntry from './pages/guard/VisitorEntry'
import GuardDashboard from './pages/guard/Dashboard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/find-account" element={<FindAccountPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/setup/:token" element={<OnboardingShell />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'sub_admin', 'member']} />}>
              <Route element={<Layout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/properties" element={<AdminProperties />} />
                <Route path="/admin/flats" element={<Navigate to="/admin/properties" replace />} />
                <Route path="/admin/residents" element={<AdminResidents />} />
                <Route path="/admin/billing" element={<AdminBilling />} />
                <Route path="/admin/visitors" element={<AdminVisitors />} />
                <Route path="/admin/assets" element={<AdminAssets />} />
                <Route path="/admin/parking" element={<AdminParking />} />
                <Route path="/admin/staff" element={<AdminStaff />} />
                <Route path="/admin/notices" element={<AdminNotices />} />
                <Route path="/admin/complaints" element={<AdminComplaints />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/expenses" element={<AdminExpenses />} />
                <Route path="/admin/expense-bulk-entry" element={<AdminBulkExpenseEntry />} />
                <Route path="/admin/finance" element={<AdminFinance />} />
                <Route path="/admin/expense-analytics" element={<AdminExpenseAnalytics />} />
                <Route path="/admin/monthly-report" element={<AdminMonthlyReport />} />
                <Route path="/admin/income" element={<AdminIncome />} />
                <Route path="/admin/invoices" element={<AdminInvoices />} />
                <Route path="/admin/events" element={<AdminEvents />} />
                <Route path="/admin/vendors" element={<AdminVendors />} />
                <Route path="/admin/notes" element={<Notes />} />
                <Route path="/admin/bulk-setup" element={<AdminBulkPropertySetup />} />
                <Route path="/admin/helpers" element={<AdminHelpers />} />
                <Route path="/admin/committee" element={<AdminCommittee />} />
                <Route path="/admin/resident-bulk-entry" element={<AdminBulkResidentEntry />} />
                <Route path="/admin/staff-bulk-entry" element={<AdminBulkStaffEntry />} />
                <Route path="/admin/helper-bulk-entry" element={<AdminBulkHelperEntry />} />
                <Route path="/admin/acl-settings" element={<AdminACLSettings />} />
                <Route path="/admin/property-resident-setup" element={<AdminPropertyResidentSetup />} />
                <Route path="/admin/residents/:id" element={<AdminResidentProfile />} />
                <Route path="/admin/alerts" element={<AdminAlerts />} />
              </Route>
            </Route>

            {/* Resident routes */}
            <Route element={<ProtectedRoute allowedRoles={['owner', 'tenant']} />}>
              <Route element={<Layout />}>
                <Route path="/resident/dashboard" element={<ResidentDashboard />} />
                <Route path="/resident/pay" element={<ResidentPay />} />
                <Route path="/resident/bills" element={<ResidentBills />} />
                <Route path="/resident/complaints" element={<ResidentComplaints />} />
                <Route path="/resident/notices" element={<ResidentNotices />} />
                <Route path="/resident/visitors" element={<ResidentVisitors />} />
                <Route path="/resident/directory" element={<ResidentDirectory />} />
                <Route path="/resident/notifications" element={<ResidentNotifications />} />
                <Route path="/resident/profile" element={<ResidentProfile />} />
                <Route path="/resident/notes" element={<Notes />} />
                <Route path="/resident/helpers" element={<ResidentHelpers />} />
                <Route path="/resident/committee" element={<ResidentCommittee />} />
                <Route path="/resident/security-settings" element={<ResidentSecuritySettings />} />
              </Route>
            </Route>

            {/* Guard routes */}
            <Route element={<ProtectedRoute allowedRoles={['security']} />}>
              <Route element={<Layout />}>
                <Route path="/guard/visitor-entry" element={<GuardVisitorEntry />} />
                <Route path="/guard/dashboard" element={<GuardDashboard />} />
                <Route path="/guard/notes" element={<Notes />} />
              </Route>
            </Route>

            {/* Unauthorized */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}