/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* ── Accent — burnt orange / industrial copper ─────────────────── */
        primary:                '#b15a1c',   // burnt orange
        'primary-container':    '#cf7b35',   // softer hover
        'primary-fixed':        '#f6d9b8',   // warm amber tint (use on dark)
        'on-primary':           '#ffffff',
        'on-primary-container': '#fff7ed',

        /* ── Light surfaces — warm bone / concrete ─────────────────────── */
        surface:                    '#f4f0e8', // app background
        'surface-container':        '#eae5da', // recessed surfaces
        'surface-container-low':    '#efeae0',
        'surface-container-lowest': '#faf6ed', // elevated cards

        /* ── Foreground on light ───────────────────────────────────────── */
        'on-surface':         '#1b1a17',     // deep warm graphite
        'on-surface-variant': '#615d54',     // muted charcoal
        'outline-variant':    '#d6cfc2',     // warm gray border

        /* ── Inverse — graphite slate for dark surfaces ────────────────── */
        'inverse-surface':    '#1b1a17',     // dark sections / sidebar
        'inverse-on-surface': '#f4f0e8',
        'inverse-primary':    '#e89255',     // warm copper on dark
        'secondary-fixed-dim':'#a8a299',     // muted text on dark

        /* ── Tertiary (kept for backwards compatibility) ───────────────── */
        'tertiary-container':    '#8a4515',
        'on-tertiary-container': '#fff6f2',
      },
      maxWidth: {
        'screen-xl': '1280px',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      boxShadow: {
        'editorial': '0 1px 0 rgba(27,26,23,0.04), 0 12px 28px -16px rgba(27,26,23,0.18)',
        'lift':      '0 20px 50px -24px rgba(27,26,23,0.28)',
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
