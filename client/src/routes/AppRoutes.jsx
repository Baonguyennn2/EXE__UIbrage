import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import LoginPage from '../pages/LoginPage.jsx'
import RouteIndexPage from '../pages/RouteIndexPage.jsx'
import HomepagePage from '../pages/HomepagePage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import DetailPage from '../pages/DetailPage.jsx'
import CheckoutPage from '../pages/CheckoutPage.jsx'
import OrderConfirmPage from '../pages/OrderConfirmPage.jsx'
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx'
import UploadAssetPage from '../pages/UploadAssetPage.jsx'
import MyLibraryPage from '../pages/MyLibraryPage.jsx'
import CommunityPage from '../pages/CommunityPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import VerifyEmailPage from '../pages/VerifyEmailPage.jsx'
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from '../pages/ResetPasswordPage.jsx'
import ProfileEditPage from '../pages/ProfileEditPage.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import { legacyRouteBySlug } from '../data/routeCatalog.js'

function LegacyFrameRoute() {
  const { slug } = useParams()
  const target = legacyRouteBySlug[slug]

  return target ? <Navigate to={target} replace /> : <NotFoundPage />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/marketplace" replace />} />

      <Route path="/marketplace" element={<HomepagePage variant="v1" />} />
      <Route path="/marketplace/discover" element={<HomepagePage variant="v2" />} />
      <Route path="/marketplace/assets/:id" element={<DetailPage />} />
      
      {/* Customer Protected Routes */}
      <Route path="/marketplace/checkout" element={
        <ProtectedRoute allowedRoles={['customer']}><CheckoutPage /></ProtectedRoute>
      } />
      <Route path="/marketplace/order-success" element={
        <ProtectedRoute allowedRoles={['customer']}><OrderConfirmPage /></ProtectedRoute>
      } />
      <Route path="/library" element={
        <ProtectedRoute allowedRoles={['customer']}><MyLibraryPage /></ProtectedRoute>
      } />
      <Route path="/profile/edit" element={
        <ProtectedRoute allowedRoles={['customer']}><ProfileEditPage /></ProtectedRoute>
      } />
      <Route path="/assets/upload" element={
        <ProtectedRoute allowedRoles={['customer']}><UploadAssetPage variant="create" /></ProtectedRoute>
      } />

      {/* Auth Routes */}
      <Route path="/auth/login" element={<LoginPage variant="v1" />} />
      <Route path="/auth/login/success" element={<LoginPage variant="v2" />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}><Navigate to="/admin/dashboard" replace /></ProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage variant="overview" /></ProtectedRoute>
      } />
      <Route path="/admin/sales" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage variant="sales" /></ProtectedRoute>
      } />
      <Route path="/admin/creators" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage variant="users" /></ProtectedRoute>
      } />
      <Route path="/admin/asset-approval" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage variant="moderation" /></ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage variant="reports" /></ProtectedRoute>
      } />
      <Route path="/admin/my-assets" element={
        <ProtectedRoute allowedRoles={['admin']}><MyLibraryPage /></ProtectedRoute>
      } />
      <Route path="/admin/upload-asset" element={
        <ProtectedRoute allowedRoles={['admin']}><UploadAssetPage variant="create" /></ProtectedRoute>
      } />

      <Route path="/community" element={<CommunityPage />} />
      <Route path="/routes" element={<RouteIndexPage />} />

      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
