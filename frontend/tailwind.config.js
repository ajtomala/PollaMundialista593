/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ec: {
          yellow: '#FFD100',
          'yellow-dark': '#C9A400',
          blue: '#003DA5',
          'blue-light': '#1A5BB5',
          'blue-dark': '#002880',
          red: '#C8102E',
          'red-dark': '#A50D24',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"Nunito"', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pop-in': 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        popIn: { from: { transform: 'scale(0.8)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        slideUp: { from: { transform: 'translateY(100%)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
      borderRadius: { xl2: '18px' },
    },
  },
  plugins: [],
}
