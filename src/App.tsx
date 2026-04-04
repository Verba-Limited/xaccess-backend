import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleHomeRedirect } from '@/routes/RoleHomeRedirect'
import { DashboardLayout } from '@/components/DashboardLayout'
import { FacilityLayout } from '@/components/facility/FacilityLayout'
import { Login } from '@/pages/Login'
import { CreateAccount } from '@/pages/CreateAccount'
import { Dashboard } from '@/pages/Dashboard'
import { AdminManagement } from '@/pages/AdminManagement'
import { CreateAdmin } from '@/pages/CreateAdmin'
import { EditAdmin } from '@/pages/EditAdmin'
import { AdminDetail } from '@/pages/AdminDetail'
import { ChangePassword } from '@/pages/ChangePassword'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { SubscriptionManagement } from '@/pages/subscription/SubscriptionManagement'
import { PaymentOverview } from '@/pages/subscription/PaymentOverview'
import { CreateSubscriptionPlan } from '@/pages/subscription/CreateSubscriptionPlan'
import { EditSubscriptionPlan } from '@/pages/subscription/EditSubscriptionPlan'
import { SubscriptionDetail } from '@/pages/subscription/SubscriptionDetail'
import { EditSubscription } from '@/pages/subscription/EditSubscription'
import { FacilityOverview } from '@/pages/facility/FacilityOverview'
import { FacilityDetail } from '@/pages/facility/FacilityDetail'
import { EditFacility } from '@/pages/facility/EditFacility'
import { CreateFacility } from '@/pages/facility/CreateFacility'
import { RecentActivities } from '@/pages/activity/RecentActivities'
import { CommunityManagement } from '@/pages/CommunityManagement'
import { FacilityLogin } from '@/pages/facility/FacilityLogin'
import { FacilityDashboard } from '@/pages/facility/FacilityDashboard'
import { ResidentManagement } from '@/pages/facility/ResidentManagement'
import { ResidentNew } from '@/pages/facility/ResidentNew'
import { ResidentDetail } from '@/pages/facility/ResidentDetail'
import { SecurityManagement } from '@/pages/facility/SecurityManagement'
import { CreateSecurityAccount } from '@/pages/facility/CreateSecurityAccount'
import { SecurityInformation } from '@/pages/facility/SecurityInformation'
import { EditSecurityProfile } from '@/pages/facility/EditSecurityProfile'
import { AccessManagement } from '@/pages/facility/AccessManagement'
import AccessDetail from '@/pages/facility/AccessDetail'
import { FacilityComposeMessage } from '@/pages/facility/FacilityComposeMessage'
import { FacilityMessageDetail } from '@/pages/facility/FacilityMessageDetail'
import { FacilityMessagesHub } from '@/pages/facility/FacilityMessagesHub'
import { FacilityMessagesLayout } from '@/pages/facility/FacilityMessagesLayout'
import { FacilityMessagesPlaceholder } from '@/pages/facility/FacilityMessagesPlaceholder'
import { FacilityInvoicePlanCreate } from '@/pages/facility/FacilityInvoicePlanCreate'
import { FacilityInvoicePlanEdit } from '@/pages/facility/FacilityInvoicePlanEdit'
import { FacilityInvoicePlans } from '@/pages/facility/FacilityInvoicePlans'
import { FacilityInvoices } from '@/pages/facility/FacilityInvoices'
import { FacilitySettings } from '@/pages/facility/FacilitySettings'
import { FacilityChangePassword } from '@/pages/facility/FacilityChangePassword'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/facility/login" element={<FacilityLogin />} />
        <Route path="/create-account" element={<CreateAccount />} />

        <Route element={<ProtectedRoute roles={['SUPER_ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin-management" element={<AdminManagement />} />
            <Route path="admin-management/create" element={<CreateAdmin />} />
            <Route path="admin-management/change-password" element={<ChangePassword />} />
            <Route path="admin-management/:id/edit" element={<EditAdmin />} />
            <Route path="admin-management/:id" element={<AdminDetail />} />
            <Route
              path="subscription/payment-overview"
              element={<PaymentOverview />}
            />
            <Route path="subscription/plans/create" element={<CreateSubscriptionPlan />} />
            <Route
              path="subscription/plans/:id/edit"
              element={<EditSubscriptionPlan />}
            />
            <Route
              path="subscription/subscriptions/:id/edit"
              element={<EditSubscription />}
            />
            <Route
              path="subscription/subscriptions/:id"
              element={<SubscriptionDetail />}
            />
            <Route path="subscription" element={<SubscriptionManagement />} />
            <Route path="facilities/create" element={<CreateFacility />} />
            <Route path="facilities/:id/edit" element={<EditFacility />} />
            <Route path="facilities/:id" element={<FacilityDetail />} />
            <Route path="facilities" element={<FacilityOverview />} />
            <Route path="activity" element={<RecentActivities />} />
            <Route path="communities" element={<CommunityManagement />} />
            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute roles={['COMMUNITY_ADMIN']} loginPath="/facility/login" />
          }
        >
          <Route path="/facility" element={<FacilityLayout />}>
            <Route index element={<Navigate to="/facility/dashboard" replace />} />
            <Route path="dashboard" element={<FacilityDashboard />} />
            <Route path="residents" element={<ResidentManagement />} />
            <Route path="residents/new" element={<ResidentNew />} />
            <Route path="residents/:id" element={<ResidentDetail />} />
            <Route path="security/new" element={<CreateSecurityAccount />} />
            <Route path="security/:id/edit" element={<EditSecurityProfile />} />
            <Route path="security/:id" element={<SecurityInformation />} />
            <Route path="security" element={<SecurityManagement />} />
            <Route path="access" element={<AccessManagement />} />
            <Route path="access/:id" element={<AccessDetail />} />
            <Route path="messages" element={<FacilityMessagesLayout />}>
              <Route path="compose" element={<FacilityComposeMessage />} />
              <Route element={<FacilityMessagesHub />}>
                <Route index element={<FacilityMessagesPlaceholder />} />
                <Route path=":id" element={<FacilityMessageDetail />} />
              </Route>
            </Route>
            <Route path="invoices/plans/new" element={<FacilityInvoicePlanCreate />} />
            <Route path="invoices/plans/:id/edit" element={<FacilityInvoicePlanEdit />} />
            <Route path="invoices/plans" element={<FacilityInvoicePlans />} />
            <Route path="invoices" element={<FacilityInvoices />} />
            <Route path="settings" element={<FacilitySettings />} />
            <Route path="settings/password" element={<FacilityChangePassword />} />
          </Route>
        </Route>

        <Route path="*" element={<RoleHomeRedirect />} />
      </Routes>
    </AuthProvider>
  )
}
