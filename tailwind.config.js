/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dynamic design tokens extracted from secret_folder/ themes
        theme: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          'surface-hover': 'var(--color-surface-hover)',
          card: 'var(--color-card)',
          border: 'var(--color-border)',
          'border-subtle': 'var(--color-border-subtle)',
          text: 'var(--color-text)',
          'text-muted': 'var(--color-text-muted)',
          primary: 'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
          accent: 'var(--color-accent)',
          highlight: 'var(--color-highlight)',
        },
        // Algorithmic visualization semantic states
        algo: {
          default: 'var(--color-algo-default)',
          comparing: 'var(--color-algo-comparing)',
          swapped: 'var(--color-algo-swapped)',
          sorted: 'var(--color-algo-sorted)',
          pivot: 'var(--color-algo-pivot)',
          overwriting: 'var(--color-algo-overwriting)',
        },
        // Direct palette tokens from secret_folder
        charcoal: '#36454f',
        'slate-gray': '#708090',
        'light-gray': '#d3d3d3',
        'deep-navy': '#1a2332',
        teal: '#2d8b8b',
        seafoam: '#a8dadc',
        'electric-blue': '#0066ff',
        'neon-cyan': '#00ffff',
        'ice-blue': '#d4e4f7',
        'steel-blue': '#4a6fa5',
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'minimal': '0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        'glow': '0 2px 6px -1px rgba(0, 0, 0, 0.16)',
        'card-glow': '0 0 30px rgba(99, 102, 241, 0.10)',
        'card-glow-sm': '0 0 20px rgba(99, 102, 241, 0.07)',
      }
    },
  },
  plugins: [],
};
