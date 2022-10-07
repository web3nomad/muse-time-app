/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'white-coffee': '#E0DDD6',
        'brown-grullo': '#AA9B7C',
        'blue-cadet': '#A6BBCC',
        'orange-tangelo': '#D25F29'
      },
      fontFamily: {
        'din-alternate': ['"DIN Alternate"', 'Helvetica', 'sans-serif'],
        'din-pro': ['DINPro', 'Helvetica', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
  ],
}
