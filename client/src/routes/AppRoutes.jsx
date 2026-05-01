import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import LoginPage from '../pages/LoginPage.jsx'
import RouteIndexPage from '../pages/RouteIndexPage.jsx'
import HomepagePage from '../pages/HomepagePage.jsx'
import MarketplacePage from '../pages/MarketplacePage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import DetailPage from '../pages/DetailPage.jsx'
import CheckoutPage from '../pages/CheckoutPage.jsx'
import OrderConfirmPage from '../pages/OrderConfirmPage.jsx'
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx'
import UploadAssetPage from '../pages/UploadAssetPage.jsx'
import MyLibraryPage from '../pages/MyLibraryPage.jsx'
import CommunityPage from '../pages/CommunityPage.jsx'
import PostDetailPage from '../pages/PostDetailPage.jsx'
import CreatePostPage from '../pages/CreatePostPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import VerifyEmailPage from '../pages/VerifyEmailPage.jsx'
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from '../pages/ResetPasswordPage.jsx'
import ProfileEditPage from '../pages/ProfileEditPage.jsx'
import WishlistPage from '../pages/WishlistPage.jsx'
import UserProfilePage from '../pages/UserProfilePage.jsx'
import ManageAssetsPage from '../pages/ManageAssetsPage.jsx'
import EarningsPage from '../pages/EarningsPage.jsx'
import MessagePage from '../pages/MessagePage.jsx'
import GoogleCallbackPage from '../pages/GoogleCallbackPage.jsx'
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
      <Route path="/" element={
        localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).role === 'admin' 
        ? <Navigate to="/admin/dashboard" replace /> 
        : <HomepagePage />
      } />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/marketplace/assets/:id" element={<DetailPage />} />
      <Route path="/profile/:username" element={<UserProfilePage />} />
      
      {/* Customer Protected Routes */}
      <Route path="/wishlist" element={
        <ProtectedRoute allowedRoles={['customer']}><WishlistPage /></ProtectedRoute>
      } />
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
        <ProtectedRoute allowedRoles={['customer', 'creator']}><ProfileEditPage /></ProtectedRoute>
      } />
      <Route path="/assets/upload" element={
        <ProtectedRoute allowedRoles={['customer', 'creator', 'admin']}><UploadAssetPage variant="create" /></ProtectedRoute>
      } />
      <Route path="/assets/manage" element={
        <ProtectedRoute allowedRoles={['customer', 'creator', 'admin']}><ManageAssetsPage /></ProtectedRoute>
      } />
      <Route path="/assets/edit/:id" element={
        <ProtectedRoute allowedRoles={['customer', 'creator', 'admin']}><UploadAssetPage variant="edit" /></ProtectedRoute>
      } />
      <Route path="/earnings" element={
        <ProtectedRoute allowedRoles={['customer', 'creator', 'admin']}><EarningsPage /></ProtectedRoute>
      } />

      {/* Auth Routes */}
      <Route path="/auth/login" element={<LoginPage variant="v1" />} />
      <Route path="/auth/login/success" element={<LoginPage variant="v2" />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/api/auth/google/callback" element={<GoogleCallbackPage />} />

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
      <Route path="/admin/all-assets" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage variant="all-assets" /></ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage variant="reports" /></ProtectedRoute>
      } />
      <Route path="/admin/my-assets" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage variant="library" /></ProtectedRoute>
      } />
      <Route path="/admin/upload-asset" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage variant="upload" /></ProtectedRoute>
      } />
      <Route path="/admin/messages" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage variant="messages" /></ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage variant="settings" /></ProtectedRoute>
      } />

      <Route path="/messages" element={
        <ProtectedRoute allowedRoles={['customer', 'creator']}><MessagePage /></ProtectedRoute>
      } />

      <Route path="/community" element={<CommunityPage />} />
      <Route path="/community/create" element={
        <ProtectedRoute allowedRoles={['customer', 'admin']}><CreatePostPage /></ProtectedRoute>
      } />
      <Route path="/community/posts/:id" element={<PostDetailPage />} />
      
      <Route path="/routes" element={<RouteIndexPage />} />

      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
