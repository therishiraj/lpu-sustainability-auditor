/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        panel: {
          bg: '#F5F7FA',
          raised: '#FFFFFF',
          inset: '#EEF1F5',
          line: '#E1E5EA',
          line2: '#CBD3DB',
        },
        amber: {
          DEFAULT: '#F7941D',
          dim: '#B96F14',
          glow: 'rgba(247, 148, 29, 0.22)',
        },
        moss: {
          DEFAULT: '#1671C9',
          dim: '#0F4E8C',
          glow: 'rgba(22, 113, 201, 0.20)',
        },
        coral: {
          DEFAULT: '#DC3B2E',
          dim: '#A32A20',
          glow: 'rgba(220, 59, 46, 0.18)',
        },
        ink: {
          100: '#1A2230',
          300: '#43505F',
          500: '#78848F',
          700: '#A9B1B9',
          900: '#DEE2E6',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        instrument: '0 1px 2px rgba(16,24,32,0.06), 0 1px 1px rgba(16,24,32,0.04)',
        glowAmber: '0 0 0 1px rgba(247,148,29,0.35), 0 4px 14px rgba(247,148,29,0.15)',
        glowMoss: '0 0 0 1px rgba(22,113,201,0.35), 0 4px 14px rgba(22,113,201,0.15)',
        glowCoral: '0 0 0 1px rgba(220,59,46,0.35), 0 4px 14px rgba(220,59,46,0.15)',
      },
      backgroundImage: {
        'grid-fade': 'none',
      },
      backgroundSize: {
        grid: '22px 22px',
      },
      keyframes: {
        pulseRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(247,148,29,0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(247,148,29,0)' },
        },
        sweep: {
          '0%': { backgroundPosition: '0% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fillLine: {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.8s ease-in-out infinite',
        sweep: 'sweep 2.4s linear infinite',
        fillLine: 'fillLine 0.6s ease-out forwards',
        rise: 'rise 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};
