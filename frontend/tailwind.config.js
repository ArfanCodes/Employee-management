/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary:                '#404dbe',
        'primary-container':    '#5a67d8',
        'primary-fixed':        '#dfe0ff',
        'on-primary':           '#ffffff',
        'on-primary-container': '#faf7ff',
        surface:                '#f9f9ff',
        'surface-container':    '#e7eeff',
        'surface-container-low':'#f0f3ff',
        'surface-container-lowest': '#ffffff',
        'on-surface':           '#121c2c',
        'on-surface-variant':   '#454653',
        'outline-variant':      '#c6c5d5',
        'inverse-surface':      '#273141',
        'inverse-on-surface':   '#ebf1ff',
        'inverse-primary':      '#bdc2ff',
        'secondary-fixed-dim':  '#c8c6c5',
        'tertiary-container':   '#aa5f00',
        'on-tertiary-container':'#fff6f2',
      },
      maxWidth: {
        'screen-xl': '1280px',
      },
    },
  },
  plugins: [],
};
