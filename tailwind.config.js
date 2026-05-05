/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#1e293b', 
          600: '#000000', 
          700: '#000000', 
          800: '#000000', 
          900: '#000000', 
          950: '#000000', 
        },
        // Force all blue/indigo/violet utilities to be monochromatic
        blue: {
          50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 
          400: '#9ca3af', 500: '#6b7280', 600: '#000000', 700: '#000000', 
          800: '#000000', 900: '#000000', 950: '#000000'
        },
        indigo: {
          50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 
          400: '#9ca3af', 500: '#6b7280', 600: '#000000', 700: '#000000', 
          800: '#000000', 900: '#000000', 950: '#000000'
        },
        violet: {
          50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 
          400: '#9ca3af', 500: '#6b7280', 600: '#000000', 700: '#000000', 
          800: '#000000', 900: '#000000', 950: '#000000'
        },
        sidebar: {
          DEFAULT: '#000000',
          hover:   '#1a1a1a',
          active:  '#333333',
          border:  '#222222',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted:   '#f8fafc',
          hover:   '#f1f5f9',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'float': '0 10px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.5rem',
        '2xl': '0.5rem',
        '3xl': '0.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}