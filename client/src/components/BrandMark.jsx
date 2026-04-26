export default function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 72 72" role="img" aria-label="UIbrage">
      <defs>
        <linearGradient id="brandGlow" x1="12" y1="10" x2="60" y2="64">
          <stop offset="0%" stopColor="#f4e8ff" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <circle cx="36" cy="36" r="32" fill="url(#brandGlow)" opacity="0.14" />
      <circle cx="36" cy="36" r="27" fill="#ffffff" opacity="0.95" />
      <path
        d="M25 23h10v19c0 4.97 4.03 9 9 9h3v-7h-3a2 2 0 0 1-2-2V23h10v19c0 9.39-7.61 17-17 17s-17-7.61-17-17V23Z"
        fill="#7c3aed"
      />
      <path d="M25 23h10v7H25z" fill="#0f172a" opacity="0.92" />
      <path d="M47 23h10v7H47z" fill="#0f172a" opacity="0.92" />
    </svg>
  )
}
