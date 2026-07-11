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
          bg: '#0F1512',        // deep charcoal-green — app background
          raised: '#141B17',    // raised surface / cards
          inset: '#0B100D',     // recessed surface / wells
          line: '#233028',      // hairline borders
          line2: '#2E3F35',     // slightly brighter border for hover/focus
        },
        amber: {
          DEFAULT: '#E8B339',   // energy / attention
          dim: '#8A6A2A',
          glow: 'rgba(232, 179, 57, 0.35)',
        },
        moss: {
          DEFAULT: '#4FBA8F',   // positive / sustainability
          dim: '#2E6E56',
          glow: 'rgba(79, 186, 143, 0.35)',
        },
        coral: {
          DEFAULT: '#E4634C',   // alerts / degraded
          dim: '#8A3D30',
          glow: 'rgba(228, 99, 76, 0.35)',
        },
        ink: {
          100: '#F4F7F5',
          300: '#C7D2CC',
          500: '#8CA098',
          700: '#5B6D64',
          900: '#37443E',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        instrument: 'inset 0 1px 0 0 rgba(255,255,255,0.03), 0 1px 2px rgba(0,0,0,0.4)',
        glowAmber: '0 0 0 1px rgba(232,179,57,0.4), 0 0 24px rgba(232,179,57,0.18)',
        glowMoss: '0 0 0 1px rgba(79,186,143,0.4), 0 0 24px rgba(79,186,143,0.18)',
        glowCoral: '0 0 0 1px rgba(228,99,76,0.4), 0 0 24px rgba(228,99,76,0.18)',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.045) 1px, transparent 0)',
      },
      backgroundSize: {
        grid: '22px 22px',
      },
      keyframes: {
        pulseRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232,179,57,0.45)' },
          '50%': { boxShadow: '0 0 0 6px rgba(232,179,57,0)' },
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
