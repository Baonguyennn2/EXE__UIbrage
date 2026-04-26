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
      <Route path="/marketplace/assets/ultimate-fantasy-ui-pack" element={<DetailPage />} />
      <Route path="/marketplace/checkout" element={<CheckoutPage />} />
      <Route path="/marketplace/order-success" element={<OrderConfirmPage />} />

      <Route path="/auth/login" element={<LoginPage variant="v1" />} />
      <Route path="/auth/login/success" element={<LoginPage variant="v2" />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage variant="overview" />} />
      <Route path="/admin/sales" element={<AdminDashboardPage variant="sales" />} />
      <Route path="/admin/creators" element={<AdminDashboardPage variant="users" />} />
      <Route path="/admin/asset-approval" element={<AdminDashboardPage variant="moderation" />} />
      <Route path="/admin/reports" element={<AdminDashboardPage variant="reports" />} />
      <Route path="/admin/my-assets" element={<MyLibraryPage />} />
      <Route path="/admin/upload-asset" element={<UploadAssetPage variant="create" />} />
      <Route path="/admin/upload-asset/review" element={<UploadAssetPage variant="review" />} />

      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/dashboard/overview" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/dashboard/sales" element={<Navigate to="/admin/sales" replace />} />
      <Route path="/dashboard/users" element={<Navigate to="/admin/creators" replace />} />
      <Route path="/dashboard/moderation" element={<Navigate to="/admin/asset-approval" replace />} />
      <Route path="/dashboard/reports" element={<Navigate to="/admin/reports" replace />} />
      <Route path="/dashboard/assets" element={<Navigate to="/admin/my-assets" replace />} />
      <Route path="/dashboard/assets/upload" element={<Navigate to="/admin/upload-asset" replace />} />
      <Route path="/dashboard/assets/upload/review" element={<Navigate to="/admin/upload-asset/review" replace />} />

      <Route path="/library" element={<MyLibraryPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/routes" element={<RouteIndexPage />} />

      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
      <Route path="/checkout" element={<Navigate to="/marketplace/checkout" replace />} />

      <Route path="/page-1" element={<Navigate to="/marketplace" replace />} />
      <Route path="/page-1/:slug" element={<LegacyFrameRoute />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
