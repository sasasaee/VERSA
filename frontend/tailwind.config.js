/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        skin: {
          base: 'var(--bg-main)',
          card: 'var(--bg-card)',
          text: 'var(--text-main)',
          muted: 'var(--text-muted)',
          primary: 'var(--primary)',
          secondary: 'var(--secondary)',
          accent: 'var(--accent)',
          'on-primary': 'var(--text-on-primary)',
        }
      },
      animation: {
        'swing': 'swing 3s infinite ease-in-out',
      },
      keyframes: {
        swing: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        }
      }
    },
  },
  plugins: [],
}