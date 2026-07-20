# Extractable Components

Components that can be extracted as reusable Superdesign `DraftComponent` entities.

## AppHeader
- **Source**: `client/src/components/AppHeader.jsx`
- **Category**: layout
- **Description**: Full-width cyberpunk header with UIBRAGE glitch brand, main nav, search, notifications, user dropdown, mobile drawer
- **Extractable props**: `activeItem` (string, default: "home"), `showNotification` (boolean, default: false), `notificationCount` (number, default: 0), `isLoggedIn` (boolean, default: false), `username` (string, default: "User")
- **Hardcoded**: Brand text "UIBRAGE", nav items (Browse, Categories, Community, Upload Asset), search placeholder, all icon SVGs, dropdown menu items, all CSS

## Footer (Homepage Footer)
- **Source**: Inline in `client/src/pages/HomepagePage.jsx` (lines 176-218)
- **Category**: layout
- **Description**: 4-column footer with brand, Explore links, Community links, Help links, copyright bar
- **Extractable props**: none (fully static)
- **Hardcoded**: Brand name "UIbrage", tagline, all navigation links and text, social icons, copyright

## SidebarFilters
- **Source**: Inline in `client/src/pages/HomepagePage.jsx` (lines 54-91) and `client/src/pages/MarketplacePage.jsx` (lines 75-150)
- **Category**: layout
- **Description**: Left sidebar with filter groups: FILTERS, UI STYLE (Fantasy, Sci-Fi, Pixel Art, Minimalist), GAME GENRE (RPG, Platformer, Strategy, Casual), ENGINE (Unity, Unreal, Godot), PRICE (Free, Paid)
- **Extractable props**: `activeFilter` (string, default: ""), `activeStyle` (string, default: ""), `activeGenre` (string, default: ""), `activeEngine` (string, default: "")
- **Hardcoded**: Filter group headings, all filter option labels, all icons, all CSS

## AssetCard
- **Source**: Inline in `client/src/pages/HomepagePage.jsx` (lines 127-146) and `client/src/pages/MarketplacePage.jsx` (lines 160-175)
- **Category**: basic
- **Description**: Asset preview card with cover image, category badge, title, price, author name, tags
- **Extractable props**: none (data-driven, not suitable for static extraction)
- **Hardcoded**: Card structure, badge position, tag styling, all CSS classes

## HeroBanner
- **Source**: Inline in `client/src/pages/HomepagePage.jsx` (lines 97-114)
- **Category**: layout
- **Description**: Large hero banner with featured asset label, glitch title, description, price info, CTA button, and cover image
- **Extractable props**: none (data-driven)
- **Hardcoded**: "FEATURED ASSET" label, "PRICE" label, "Get Asset Pack" CTA text, layout structure, all CSS
