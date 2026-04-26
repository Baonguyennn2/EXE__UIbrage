export const canonicalFrameRoutes = [
  { title: 'Homepage V1', path: '/marketplace', note: 'Figma slug: homepage-1', slug: 'homepage-1' },
  { title: 'Homepage V2', path: '/marketplace/discover', note: 'Figma slug: homepage-2', slug: 'homepage-2' },
  { title: 'Register', path: '/auth/register', note: 'Figma slug: register', slug: 'register' },
  { title: 'Detail', path: '/marketplace/assets/ultimate-fantasy-ui-pack', note: 'Figma slug: detail', slug: 'detail' },
  { title: 'Checkout', path: '/marketplace/checkout', note: 'Figma slug: checkout', slug: 'checkout' },
  { title: 'Order Success', path: '/marketplace/order-success', note: 'Figma slug: order-confirm', slug: 'order-confirm' },
  { title: 'Admin Dashboard 1', path: '/dashboard/overview', note: 'Figma slug: admin-dashboard-1', slug: 'admin-dashboard-1' },
  { title: 'Admin Dashboard 2', path: '/dashboard/sales', note: 'Figma slug: admin-dashboard-2', slug: 'admin-dashboard-2' },
  { title: 'Admin Dashboard 3', path: '/dashboard/users', note: 'Figma slug: admin-dashboard-3', slug: 'admin-dashboard-3' },
  { title: 'Admin Dashboard 4', path: '/dashboard/moderation', note: 'Figma slug: admin-dashboard-4', slug: 'admin-dashboard-4' },
  { title: 'Upload Asset 1', path: '/dashboard/assets/upload', note: 'Figma slug: upload-asset-1', slug: 'upload-asset-1' },
  { title: 'Upload Asset 2', path: '/dashboard/assets/upload/review', note: 'Figma slug: upload-asset-2', slug: 'upload-asset-2' },
  { title: 'My Library', path: '/library', note: 'Figma slug: my-library', slug: 'my-library' },
  { title: 'Community', path: '/community', note: 'Figma slug: community', slug: 'community' },
  { title: 'Admin Dashboard 5', path: '/dashboard/reports', note: 'Figma slug: admin-dashboard-5', slug: 'admin-dashboard-5' },
  { title: 'Login 1', path: '/auth/login', note: 'Figma slug: login-1', slug: 'login-1' },
  { title: 'Login 2', path: '/auth/login/success', note: 'Figma slug: login-2', slug: 'login-2' },
]

export const legacyRouteBySlug = Object.fromEntries(
  canonicalFrameRoutes.map((route) => [route.slug, route.path]),
)

export const qaRoutePatterns = [
  '/marketplace',
  '/marketplace/discover',
  '/marketplace/assets/:slug',
  '/marketplace/checkout',
  '/marketplace/order-success',
  '/auth/login',
  '/auth/login/success',
  '/auth/register',
  '/dashboard/overview',
  '/dashboard/sales',
  '/dashboard/users',
  '/dashboard/moderation',
  '/dashboard/reports',
  '/dashboard/assets/upload',
  '/dashboard/assets/upload/review',
  '/library',
  '/community',
]
