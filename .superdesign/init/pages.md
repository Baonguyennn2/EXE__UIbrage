# Page Component Dependency Trees

## / (Homepage)
Entry: `client/src/pages/HomepagePage.jsx`
Dependencies:
- `client/src/components/AppHeader.jsx`
  - `client/src/services/api.js` (metadataService, notificationService)
- `client/src/components/LoadingScreen.jsx`
- `client/src/services/api.js` (assetService, metadataService)
- `client/src/App.css` (market-home, main-layout, sidebar-filters, hero-banner, asset-grid, asset-card, latest-grid, market-footer)
- `client/src/index.css`
- `client/src/cyberpunk-theme.css`
- `client/src/cyberpunk-components.css` (cyber-scanlines, cyber-glitch-text, cyber-btn, cyber-btn-glitch, cyber-btn-ghost)

## /marketplace (Marketplace)
Entry: `client/src/pages/MarketplacePage.jsx`
Dependencies:
- `client/src/components/AppHeader.jsx`
  - `client/src/services/api.js`
- `client/src/services/api.js` (assetService, metadataService)
- `client/src/App.css` (marketplace-container, main-layout, sidebar-filters, content-area, marketplace-header, asset-grid, asset-card)
- `client/src/index.css`
- `client/src/cyberpunk-theme.css`
- `client/src/cyberpunk-components.css` (cyber-scanlines, cyber-glitch-text)

## /marketplace/assets/:id (Asset Detail)
Entry: `client/src/pages/DetailPage.jsx`
Dependencies:
- `client/src/components/AppHeader.jsx`
  - `client/src/services/api.js`
- `client/src/components/StarRating.jsx`
- `client/src/components/LoadingScreen.jsx`
- `client/src/services/api.js` (assetService, commentService, userService)
- `client/src/v2-layouts.css` (detail-v2-container, detail-v2-main, detail-v2-header, detail-v2-card, sidebar-v2-stack, price-card, author-card-v2, recommended-list, btn-purchase, btn-wishlist, btn-follow)
- `client/src/App.css` (market-home)
- `client/src/index.css`
- `client/src/cyberpunk-theme.css`
- `client/src/cyberpunk-components.css` (cyber-scanlines)

## /community (Community)
Entry: `client/src/pages/CommunityPage.jsx`
Dependencies:
- `client/src/components/AppHeader.jsx`
  - `client/src/services/api.js`
- `client/src/services/api.js`
- `client/src/v2-layouts.css` (community-layout, community-main, community-search-container, surface-card, community-post, community-side, side-section, topic-list, community-tags)
- `client/src/App.css`
- `client/src/index.css`
- `client/src/cyberpunk-theme.css`
- `client/src/cyberpunk-components.css`

## /marketplace/checkout (Checkout)
Entry: `client/src/pages/CheckoutPage.jsx`
Dependencies:
- `client/src/components/AppHeader.jsx`
  - `client/src/services/api.js`
- `client/src/services/api.js`
- `client/src/v2-layouts.css` (checkout-v2-grid, checkout-v2-left, checkout-section-v2, billing-form-v2, input-group-v2, payment-methods-v2, method-card, checkout-v2-right, order-summary-v2, promo-row-v2, summary-totals-v2, btn-complete-v2)
- `client/src/App.css`
- `client/src/index.css`
- `client/src/cyberpunk-theme.css`
- `client/src/cyberpunk-components.css`

## /auth/login (Login)
Entry: `client/src/pages/LoginPage.jsx`
Dependencies:
- `client/src/components/BrandMark.jsx`
- `client/src/services/api.js`
- `client/src/App.css` (auth-shell, auth-layout, auth-card, auth-form, field)
- `client/src/index.css`
- `client/src/cyberpunk-theme.css`
- `client/src/cyberpunk-components.css`

## /auth/register (Register)
Entry: `client/src/pages/RegisterPage.jsx`
Dependencies:
- `client/src/components/BrandMark.jsx`
- `client/src/services/api.js`
- `client/src/App.css` (auth-shell, auth-layout, auth-card, auth-form, field)
- `client/src/index.css`
- `client/src/cyberpunk-theme.css`
- `client/src/cyberpunk-components.css`

## /assets/upload (Upload Asset)
Entry: `client/src/pages/UploadAssetPage.jsx`
Dependencies:
- `client/src/components/AppHeader.jsx`
  - `client/src/services/api.js`
- `client/src/services/api.js`
- `client/src/v2-layouts.css` (upload-page-v3, upload-container-v3, upload-card-v3, form-section-v3, label-v3, input-v3, textarea-v3, upload-row-v3, drop-zone-v3, tag-input-wrapper-v3, btn-publish-v3)
- `client/src/App.css`
- `client/src/index.css`
- `client/src/cyberpunk-theme.css`
- `client/src/cyberpunk-components.css`

## /profile/:username (User Profile)
Entry: `client/src/pages/UserProfilePage.jsx`
Dependencies:
- `client/src/components/AppHeader.jsx`
  - `client/src/services/api.js`
- `client/src/services/api.js`
- `client/src/v2-layouts.css` (profile-v2-container, profile-v2-nav, profile-nav-item, profile-v2-content, profile-v2-main-list, btn-solid, btn-ghost)
- `client/src/App.css`
- `client/src/index.css`
- `client/src/cyberpunk-theme.css`
- `client/src/cyberpunk-components.css`
