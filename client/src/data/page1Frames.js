export const page1Frames = [
  { id: '3:1066', name: 'Homepage', slug: 'homepage-1', title: 'Homepage' },
  { id: '58:2433', name: 'Homepage', slug: 'homepage-2', title: 'Homepage' },
  { id: '4:1661', name: 'Register', slug: 'register', title: 'Register' },
  { id: '5:1853', name: 'Detail', slug: 'detail', title: 'Detail' },
  { id: '8:2745', name: 'Checkout', slug: 'checkout', title: 'Checkout' },
  { id: '8:2932', name: 'Order Confim', slug: 'order-confirm', title: 'Order Confim' },
  { id: '15:4769', name: 'Admin Dasborad', slug: 'admin-dashboard-1', title: 'Admin Dasborad' },
  { id: '14:4190', name: 'Admin Dasborad', slug: 'admin-dashboard-2', title: 'Admin Dasborad' },
  { id: '18:1311', name: 'Admin Dasborad', slug: 'admin-dashboard-3', title: 'Admin Dasborad' },
  { id: '14:3888', name: 'Admin Dasborad', slug: 'admin-dashboard-4', title: 'Admin Dasborad' },
  { id: '16:2', name: 'UpLoad asset', slug: 'upload-asset-1', title: 'UpLoad asset' },
  { id: '64:3387', name: 'UpLoad asset', slug: 'upload-asset-2', title: 'UpLoad asset' },
  { id: '41:183', name: 'My Library', slug: 'my-library', title: 'My Library' },
  { id: '64:4434', name: 'Community', slug: 'community', title: 'Community' },
  { id: '58:961', name: 'Admin Dasborad', slug: 'admin-dashboard-5', title: 'Admin Dasborad' },
  { id: '82:4', name: 'Login', slug: 'login-1', title: 'Login' },
  { id: '82:90', name: 'Login', slug: 'login-2', title: 'Login' },
]

export function getFrameBySlug(slug) {
  return page1Frames.find((frame) => frame.slug === slug)
}
