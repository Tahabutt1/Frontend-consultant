/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sb: {
          navy: '#050b14',
          deep: '#0a1628',
          ink: '#0f2744',
          panel: '#122a45',
          frost: '#e8eef5',
          muted: '#94a3b8',
          accent: '#3b82f6',
          glow: '#38bdf8',
          line: 'rgba(148, 163, 184, 0.12)',
        },
      },
      fontFamily: {
        sans: ['"Outfit"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sb-glow': '0 0 80px -20px rgba(59, 130, 246, 0.35)',
        'sb-card': '0 25px 50px -12px rgba(15, 23, 42, 0.45)',
        'sb-float': '0 8px 32px rgba(15, 23, 42, 0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'sb-hero': 'radial-gradient(ellipse 120% 80% at 50% -30%, rgba(59,130,246,0.25), transparent 55%), radial-gradient(ellipse 80% 50% at 100% 50%, rgba(56,189,248,0.12), transparent), linear-gradient(180deg, #050b14 0%, #0a1628 45%, #0f2744 100%)',
        'sb-mesh': 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, transparent 50%), linear-gradient(225deg, rgba(56,189,248,0.08) 0%, transparent 45%)',
        'sb-border': 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))',
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in-up-chat': 'fade-in-up-chat 0.3s ease-out',
        'sb-float': 'sb-float 18s ease-in-out infinite',
        'sb-pulse': 'sb-pulse 4s ease-in-out infinite',
        'sb-shimmer': 'sb-shimmer 14s ease-in-out infinite',
      },
      keyframes: {
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up-chat': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'sb-float': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-18px) translateX(8px)' },
        },
        'sb-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'sb-shimmer': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
