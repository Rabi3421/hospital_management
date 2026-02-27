/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0B1F3A',
          light: '#162E54',
          mid: '#1A3A6B',
          50: '#EEF2F8',
          100: '#D4DCE9',
          200: '#A8BAD3',
          300: '#7D97BD',
          400: '#5175A7',
          500: '#2A5391',
          600: '#1A3A6B',
          700: '#162E54',
          800: '#0F2340',
          900: '#0B1F3A',
        },
        gold: {
          DEFAULT: '#C9A96E',
          light: '#E8D5B0',
          dark: '#A8844A',
          50: '#FAF5EB',
          100: '#F4EAD5',
          200: '#E8D5B0',
          300: '#DBBF8A',
          400: '#CEA965',
          500: '#C9A96E',
          600: '#B8924A',
          700: '#A8844A',
          800: '#8A6A38',
          900: '#6C5229',
        },
        cream: {
          DEFAULT: '#F7F5F0',
          dark: '#EDE9E0',
          darker: '#E0DAD0',
        },
      },
      boxShadow: {
        'gold': '0 8px 32px rgba(201, 169, 110, 0.25)',
        'navy': '0 8px 32px rgba(11, 31, 58, 0.15)',
        'xl-navy': '0 24px 64px rgba(11, 31, 58, 0.12)',
        'card': '0 4px 24px rgba(11, 31, 58, 0.08)',
        'card-hover': '0 16px 48px rgba(11, 31, 58, 0.14)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A96E 0%, #E8D5B0 50%, #A8844A 100%)',
        'navy-gradient': 'linear-gradient(135deg, #0B1F3A 0%, #162E54 100%)',
        'hero-overlay': 'linear-gradient(105deg, rgba(11,31,58,0.88) 0%, rgba(11,31,58,0.65) 45%, rgba(11,31,58,0.20) 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.8s ease forwards',
        'float': 'floatY 4s ease-in-out infinite',
        'float-2': 'floatY2 5s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'scale-in': 'scaleIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatY2: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(201, 169, 110, 0.4)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 12px rgba(201, 169, 110, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(201, 169, 110, 0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};