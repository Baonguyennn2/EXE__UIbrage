# Route / Page Mapping

**Framework**: React (Vite) with `react-router-dom` v7
**Router type**: Config-based (BrowserRouter wrapping `<Routes>`)
**Entry**: `client/src/main.jsx` → `client/src/App.jsx` → `client/src/routes/AppRoutes.jsx`

## Full Router Config

```jsx
// client/src/routes/AppRoutes.jsx
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
// ... all page imports ...

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={/* admin redirect or HomepagePage */} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/marketplace/assets/:id" element={<DetailPage />} />
      <Route path="/profile/:username" element={<UserProfilePage />} />

      {/* Customer Protected Routes */}
      <Route path="/wishlist" element={<ProtectedRoute allowedRoles={['customer']}><WishlistPage /></ProtectedRoute>} />
      <Route path="/marketplace/checkout" element={<ProtectedRoute allowedRoles={['customer']}><CheckoutPage /></ProtectedRoute>} />
      <Route path="/marketplace/order-success" element={<ProtectedRoute allowedRoles={['customer']}><OrderConfirmPage /></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute allowedRoles={['customer']}><MyLibraryPage /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute allowedRoles={['customer', 'creator']}><ProfileEditPage /></ProtectedRoute>} />
      <Route path="/assets/upload" element={<ProtectedRoute allowedRoles={['customer', 'creator', 'admin']}><UploadAssetPage variant="create" /></ProtectedRoute>} />
      <Route path="/assets/manage" element={<ProtectedRoute allowedRoles={['customer', 'creator', 'admin']}><ManageAssetsPage /></ProtectedRoute>} />
      <Route path="/assets/edit/:id" element={<ProtectedRoute allowedRoles={['customer', 'creator', 'admin']}><UploadAssetPage variant="edit" /></ProtectedRoute>} />
      <Route path="/earnings" element={<ProtectedRoute allowedRoles={['customer', 'creator', 'admin']}><EarningsPage /></ProtectedRoute>} />

      {/* Auth Routes */}
      <Route path="/auth/login" element={<LoginPage variant="v1" />} />
      <Route path="/auth/login/success" element={<LoginPage variant="v2" />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/api/auth/google/callback" element={<GoogleCallbackPage />} />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage variant="overview" />} />
      <Route path="/admin/sales" element={<AdminDashboardPage variant="sales" />} />
      <Route path="/admin/creators" element={<AdminDashboardPage variant="users" />} />
      <Route path="/admin/asset-approval" element={<AdminDashboardPage variant="moderation" />} />
      <Route path="/admin/all-assets" element={<AdminDashboardPage variant="all-assets" />} />
      <Route path="/admin/reports" element={<AdminDashboardPage variant="reports" />} />
      <Route path="/admin/my-assets" element={<AdminDashboardPage variant="library" />} />
      <Route path="/admin/upload-asset" element={<AdminDashboardPage variant="upload" />} />
      <Route path="/admin/messages" element={<AdminDashboardPage variant="messages" />} />
      <Route path="/admin/withdrawals" element={<AdminDashboardPage variant="withdrawals" />} />
      <Route path="/admin/settings" element={<AdminDashboardPage variant="settings" />} />

      {/* Messaging */}
      <Route path="/messages" element={<ProtectedRoute allowedRoles={['customer', 'creator']}><MessagePage /></ProtectedRoute>} />

      {/* Community */}
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/community/create" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><CreatePostPage /></ProtectedRoute>} />
      <Route path="/community/posts/:id" element={<PostDetailPage />} />

      {/* Route Index & Legacy */}
      <Route path="/routes" element={<RouteIndexPage />} />
      <Route path="/login" element={<Navigate to="/auth/login" />} />
      <Route path="/register" element={<Navigate to="/auth/register" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
```

## Page Summaries

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomepagePage | Landing page with hero banner, featured assets grid, latest assets, sidebar filters, footer |
| `/marketplace` | MarketplacePage | Asset browsing with filter sidebar, search, asset grid cards |
| `/marketplace/assets/:id` | DetailPage | Asset detail with gallery, description (markdown), reviews, price card, author card, recommendations |
| `/profile/:username` | UserProfilePage | Public user profile with tabs |
| `/wishlist` | WishlistPage | Saved assets list |
| `/marketplace/checkout` | CheckoutPage | Billing form + payment methods + order summary |
| `/marketplace/order-success` | OrderConfirmPage | Purchase confirmation |
| `/library` | MyLibraryPage | Purchased assets library |
| `/profile/edit` | ProfileEditPage | Profile settings form |
| `/assets/upload` | UploadAssetPage | Asset upload form with file drop zones |
| `/assets/manage` | ManageAssetsPage | User's asset management |
| `/earnings` | EarningsPage | Revenue dashboard with charts |
| `/community` | CommunityPage | Forum-style community with posts, sidebar topics, tags |
| `/community/create` | CreatePostPage | Post creation form |
| `/community/posts/:id` | PostDetailPage | Single post detail with comments |
| `/messages` | MessagePage | Real-time messaging (socket.io) |
| `/admin/*` | AdminDashboardPage | Multi-variant admin panel (overview, sales, users, moderation, etc.) |
| `/auth/login` | LoginPage | Login form with cyberpunk styling |
| `/auth/register` | RegisterPage | Registration form |
