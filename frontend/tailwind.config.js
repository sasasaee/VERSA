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
          placeholder: 'var(--placeholder)',
          'search-border': 'var(--search-border)',
          'card-border': 'var(--card-border)',
          'navbar-border': 'var(--navbar-profile-border)',
          'qw-border': 'var(--quickwrite-border)',
          'qw-select-border': 'var(--quickwrite-select-border)',
          'dash-date': 'var(--dash-date-text)',
          'dash-genre': 'var(--dash-genre-text)',
          'dash-dots': 'var(--dash-dots-text)',
          'prof-border': 'var(--profile-border)',
        }
      },
      animation: {
        'swing': 'swing 3s infinite ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
      },
      keyframes: {
        swing: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}