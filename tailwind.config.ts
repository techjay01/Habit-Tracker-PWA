import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fef9ee',
          100: '#fdf0d5',
          200: '#fadfaa',
          300: '#f7c874',
          400: '#f3aa3c',
          500: '#f09118',
          600: '#e17510',
          700: '#ba5710',
          800: '#944414',
          900: '#783914',
          950: '#411b07',
        },
        surface: {
          DEFAULT: '#0f0e0c',
          1: '#1a1916',
          2: '#242220',
          3: '#2e2c29',
          4: '#3a3733',
        },
      },
    },
  },
  plugins: [],
};

export default config;
