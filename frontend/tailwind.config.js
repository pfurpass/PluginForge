/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mc: {
          bg: '#1e1f22',
          panel: '#2b2d31',
          panel2: '#313338',
          border: '#3f4248',
          text: '#dbdee1',
          muted: '#949ba4',
          accent: '#5865f2',
          accent2: '#4752c4',
          green: '#3ba55d',
          yellow: '#faa61a',
          red: '#ed4245',
        },
      },
    },
  },
  plugins: [],
};
