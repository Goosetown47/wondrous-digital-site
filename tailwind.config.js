/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          gradient: 'linear-gradient(135deg, #F867AC 0%, #3C33C0 100%)',
          pink: '#F867AC',
          'dark-purple': '#1F0943',
          'original-dark-purple': '#1F0943',
          'medium-purple': '#302940',
          'light-purple': '#7F7393',
          'superlight-pink': '#EFD0F2',
        },
        gray: {
          600: 'rgb(102 112 129)', // Changed from default #6B7280 to a darker gray
        },
        'faq-text': 'rgb(164 170 199)',
        'faq-text-90': 'rgb(164 170 199 / 90%)',
      },
      fontFamily: {
        'sans': ['Avenir', 'Inter', 'system-ui', 'sans-serif'],
        'display': ['Canastra', 'Playfair Display', 'serif'],
        'avenir': ['Avenir', 'Inter', 'system-ui', 'sans-serif'],
        'canastra': ['Canastra', 'Playfair Display', 'serif'],
      },
      fontWeight: {
        'black': '900',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'premium': '0px 24px 25px rgba(0, 0, 0, 0.1)',
        'card': '0px 4px 15px rgba(0, 0, 0, 0.08)',
        'button-primary': '3px 3px 0 var(--primary-button-shadow-color, #374151)',
        'button-primary-hover': '1px 1px 0 var(--primary-button-shadow-color, #374151)',
        'button-secondary': '3px 3px 0 var(--secondary-button-shadow-color, #D1D5DB)',
        'button-secondary-hover': '1px 1px 0 var(--secondary-button-shadow-color, #D1D5DB)',
        'button-pink': '3px 3px 0 var(--primary-button-shadow-color, #374151)',
        'button-pink-hover': '1px 1px 0 var(--primary-button-shadow-color, #374151)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};