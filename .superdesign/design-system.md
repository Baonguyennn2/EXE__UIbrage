# UIbrage Design System

## Product Context
**Product**: UIbrage — A marketplace for high-quality game UI assets (icons, HUD kits, menus, buttons, etc.)
**Target Audience**: Game developers, indie studios, UI designers looking for game interface assets
**Platform**: Web (desktop + mobile responsive)
**Brand Personality**: Cyberpunk, futuristic, tech-forward, neon-lit, terminal aesthetic

## Core Visual Identity

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--cyber-bg` | `#0a0a0f` | Page background (near-black) |
| `--cyber-foreground` | `#e0e0e0` | Primary text |
| `--cyber-card` | `#12121a` | Card/surface background |
| `--cyber-muted` | `#1c1c2e` | Subtle backgrounds |
| `--cyber-muted-foreground` | `#6b7280` | Secondary text |
| `--cyber-accent` | `#00ff88` | Primary accent (neon green) |
| `--cyber-accent-secondary` | `#ff00ff` | Secondary accent (magenta/pink) |
| `--cyber-accent-tertiary` | `#00d4ff` | Tertiary accent (cyan) |
| `--cyber-border` | `#2a2a3a` | Borders |
| `--cyber-destructive` | `#ff3366` | Error/destructive actions |
| Additional: `#4338ca` / `#4f46e5` / `#6366f1` | Indigo used for purchase buttons, active states, some accents |

### Typography
- **Headings**: `"Orbitron", "Share Tech Mono", monospace` — futuristic, geometric, uppercase
- **Body**: `"JetBrains Mono", "Fira Code", "Consolas", monospace` — technical monospace
- **Mono/Labels**: `"Share Tech Mono", monospace` — used for nav, buttons, labels
- **All text is monospace** — no serif or sans-serif fonts used
- **Headings are uppercase** with letter-spacing: 0.05em–0.1em

### Corner Treatment
- **No rounded corners** — everything uses `border-radius: 0`
- **Chamfered corners** via `clip-path: polygon()` — the signature cyberpunk look
- Two variants: `cyber-chamfer` (10px cuts) and `cyber-chamfer-sm` (6px cuts)

### Glow Effects
- `--neon-glow-primary`: Green glow (`0 0 5px #00ff88, 0 0 10px rgba(0,255,136,0.25)`)
- `--neon-glow-primary-sm`: Subtle green glow
- `--neon-glow-primary-lg`: Large green glow
- `--neon-glow-secondary`: Magenta glow
- `--neon-glow-tertiary`: Cyan glow
- Applied on hover, focus, and active states

### Animations
- **Glitch text**: RGB shift with `::before`/`::after` pseudo-elements
- **Scanline overlay**: Fixed overlay with repeating-linear-gradient
- **RGB Shift**: Text shadow alternating between magenta and cyan
- **Blink cursor**: Step-based blinking

## Component Patterns

### Buttons
- Primary: Green neon border, uppercase mono text, hover fills with green
- Secondary: Magenta variant
- Ghost: Transparent, no border
- Glitch CTA: Filled green with RGB shift animation (used for main CTAs)

### Cards
- Dark background (`--cyber-card`), 1px border, chamfered corners
- Hover: translateY(-2px) + neon glow border
- Terminal variant: With traffic-light dots header
- Holographic variant: Glassmorphism with corner bracket accents

### Inputs
- Dark background, monospace font, neon green text
- `>` prefix indicator (terminal-style)
- Focus: neon glow border

### Layout Structure
- Homepage/Marketplace: Sidebar (filters) + Main content area
- Detail page: Main content + Right sidebar (price card, author card)
- Auth pages: 3-column grid (brand | card | side panel)

## Key Pages (Customer-Facing)
1. **Homepage** — Hero banner + featured assets grid + latest assets + sidebar filters + footer
2. **Marketplace** — Filter sidebar + search header + asset grid
3. **Asset Detail** — Gallery + description + reviews | Price card + author card + recommendations
4. **Checkout** — Billing form + payment methods | Order summary
5. **Community** — Post feed + search | Sidebar topics + tags
6. **Auth (Login/Register)** — Centered card with cyberpunk branding
7. **User Profile** — Tabbed layout with avatar + stats + asset grid
8. **My Library / Wishlist** — Asset lists
