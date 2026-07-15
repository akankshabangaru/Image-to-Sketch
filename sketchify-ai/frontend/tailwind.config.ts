import type { Config } from 'tailwindcss';

// Design tokens - "graphite studio desk" identity for Sketchify AI.
// graphite = dark UI chrome, paper = the surface images/cards sit on,
// pencil = the single signature accent used sparingly for CTAs/highlights.
const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: '#15161A',
          900: '#1C1E22',
          800: '#25272D',
          700: '#33363D',
          600: '#45484F',
        },
        paper: {
          DEFAULT: '#F4EFE2',
          dim: '#EAE3D1',
          card: '#FBF9F3',
        },
        pencil: {
          DEFAULT: '#F0BF2B',
          deep: '#D9A61F',
          soft: '#F7D874',
        },
        ink: {
          DEFAULT: '#1B1B1D',
          muted: '#5B5D63',
          mist: '#8B8D93',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'paper-grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'sketch-draw': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wobble: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-1deg)' },
          '75%': { transform: 'rotate(1deg)' },
        },
      },
      animation: {
        'sketch-draw': 'sketch-draw 1.8s ease-out forwards',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        wobble: 'wobble 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
