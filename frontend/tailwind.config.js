/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0F1E',
        card: '#111827',
        primary: {
          DEFAULT: '#6366F1', // Electric Indigo
          hover: '#4F46E5',
        },
        income: '#10B981',
        expense: '#F43F5E',
        text: {
          primary: '#F9FAFB',
          secondary: '#9CA3AF',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
