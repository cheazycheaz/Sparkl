// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6666ff',
        secondary: '#f3f4f6',
      },
      fontFamily: {
        sans: ['Satoshi', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
      },
    },
  },
  plugins: [],
}
