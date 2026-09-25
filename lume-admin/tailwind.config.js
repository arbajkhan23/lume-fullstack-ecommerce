/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0b0b0d',       // near-black background
        surface: '#141416',    // card / panel surface
        surface2: '#1c1c1f',   // hover / elevated surface
        border: '#28282c',
        muted: '#8a8a92',
        accent: '#c9a36a',     // LUMÉ champagne gold
        'accent-soft': '#e6cd9e',
        success: '#7fae7a',
        danger: '#c9726d',
        warning: '#d1a94d',
        info: '#7a97b8',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        xl2: '18px',
      },
      boxShadow: {
        panel: '0 10px 30px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
