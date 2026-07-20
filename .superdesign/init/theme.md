# Design System / Theme Tokens

**Framework**: React + Vite
**CSS approach**: Vanilla CSS with CSS Custom Properties (no Tailwind)
**Fonts**: Orbitron (headings), JetBrains Mono / Fira Code (body), Share Tech Mono (monospace)
**Theme**: Cyberpunk / Glitch — dark mode with neon accents, chamfered corners, scanline overlays

## CSS Variables (`cyberpunk-theme.css`)

```css
:root {
  /* Colors - Dark Mode */
  --cyber-bg: #0a0a0f;
  --cyber-foreground: #e0e0e0;
  --cyber-card: #12121a;
  --cyber-muted: #1c1c2e;
  --cyber-muted-foreground: #6b7280;
  
  /* Accents / Neon */
  --cyber-accent: #00ff88;
  --cyber-accent-secondary: #ff00ff;
  --cyber-accent-tertiary: #00d4ff;
  
  /* UI Elements */
  --cyber-border: #2a2a3a;
  --cyber-input: #12121a;
  --cyber-ring: #00ff88;
  --cyber-destructive: #ff3366;

  /* Typography */
  --font-cyber-heading: "Orbitron", "Share Tech Mono", monospace;
  --font-cyber-body: "JetBrains Mono", "Fira Code", "Consolas", monospace;
  --font-cyber-mono: "Share Tech Mono", monospace;

  /* Radius & Borders */
  --radius-none: 0px;
  --radius-sm: 2px;
  --radius-base: 4px;

  /* Glow Effects (Shadows) */
  --neon-glow-primary: 0 0 5px var(--cyber-accent), 0 0 10px rgba(0, 255, 136, 0.25);
  --neon-glow-primary-sm: 0 0 3px var(--cyber-accent), 0 0 6px rgba(0, 255, 136, 0.18);
  --neon-glow-primary-lg: 0 0 10px var(--cyber-accent), 0 0 20px rgba(0, 255, 136, 0.37), 0 0 40px rgba(0, 255, 136, 0.18);
  
  --neon-glow-secondary: 0 0 5px var(--cyber-accent-secondary), 0 0 20px rgba(255, 0, 255, 0.37);
  --neon-glow-tertiary: 0 0 5px var(--cyber-accent-tertiary), 0 0 20px rgba(0, 212, 255, 0.37);

  /* Transitions */
  --transition-cyber: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-digital: all 100ms steps(4);
}
```

## Keyframes

```css
@keyframes blink { 50% { opacity: 0; } }
@keyframes glitch-anim {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-1px, -1px); }
  80% { transform: translate(1px, 1px); }
}
@keyframes rgbShift {
  0%, 100% { text-shadow: -2px 0 var(--cyber-accent-secondary), 2px 0 var(--cyber-accent-tertiary); }
  50% { text-shadow: 2px 0 var(--cyber-accent-secondary), -2px 0 var(--cyber-accent-tertiary); }
}
@keyframes scanline-scroll {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
```

## Component CSS Classes (`cyberpunk-components.css`)

### Utilities
- `.cyber-scanlines::after` — fixed scanline overlay on the whole page
- `.cyber-grid-bg` — circuit-board grid background pattern
- `.cyber-chamfer` / `.cyber-chamfer-sm` — clip-path chamfered corners (the signature look)
- `.cyber-glitch-text` — RGB glitch text effect with `::before` / `::after` pseudo-elements

### Buttons
- `.cyber-btn` — primary neon green border button, uppercase mono font
- `.cyber-btn-secondary` — magenta variant
- `.cyber-btn-outline` — subtle border button
- `.cyber-btn-ghost` — transparent, text-only
- `.cyber-btn-glitch` — CTA button with neon glow and RGB shift animation

### Cards
- `.cyber-card` — dark card with border, hover: translateY + neon glow
- `.cyber-card-terminal` — terminal-like card with traffic-light dots header
- `.cyber-card-holographic` — glassmorphism card with corner brackets

### Inputs
- `.cyber-input-wrapper` — wrapper with `>` prefix indicator
- `.cyber-input` — dark input field with mono font, neon green text/accent

## Global Reset (`index.css`)

```css
@import './cyberpunk-theme.css';
@import './cyberpunk-components.css';

:root {
  font-family: var(--font-cyber-body);
  line-height: 1.5;
  font-weight: 400;
  color: var(--cyber-foreground);
  background: var(--cyber-bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4, h5, h6 { font-family: var(--font-cyber-heading); }
* { box-sizing: border-box; }
html { min-height: 100%; }
body { margin: 0; min-width: 320px; }
a { color: inherit; }
#root { min-height: 100svh; }
```

## Additional Font Import (`App.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
```

## Key Design Patterns
- **No border-radius** — everything uses `border-radius: 0` or `clip-path` chamfers instead
- **Neon glow** on hover/focus states using `box-shadow` with `var(--neon-glow-*)` tokens
- **Monospace everywhere** — all UI text uses mono fonts
- **Uppercase labels** — filter groups, section headers, button text all uppercase with letter-spacing
- **Dark background** (#0a0a0f) with neon green (#00ff88), magenta (#ff00ff), and cyan (#00d4ff) accents
- **Scanline overlay** on main pages via `.cyber-scanlines`
- **Glitch text effect** on hero headings and brand name
