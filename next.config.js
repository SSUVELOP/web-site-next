/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('tailwindcss'),
  ],
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
  env: {
    FRONT_BASE_URL: process.env.NEXT_PUBLIC_FRONT_BASE_URL,
    BACK_BASE_URL: process.env.NEXT_PUBLIC_BACK_BASE_URL,
  },
}

module.exports = nextConfig
