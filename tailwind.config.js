/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      colors: {
        brand: {
          blue: '#0047AB',         // Official 1AA Royal / Cobalt Blue
          'blue-light': '#2563EB',
          'blue-azure': '#3B82F6',
          'blue-dark': '#002F75',
          orange: '#FF8C00',       // Official 1AA Vibrant Dark Orange
          'orange-light': '#FFA028',
          'orange-glow': '#FFB04A',
          'orange-dark': '#E06B00',
        },
        obsidian: {
          950: '#030712',          // Pure deep obsidian base
          900: '#080e1e',          // Apple space dark surface
          850: '#0e162b',          // Card pedestal
          800: '#16223d',          // Subtle border
          700: '#213054',          // Hover border
        }
      },
      boxShadow: {
        'apple-card': '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'apple-card-hover': '0 30px 60px -15px rgba(0, 71, 171, 0.25), 0 0 1px 1px rgba(59, 130, 246, 0.3)',
        'glow-blue': '0 0 30px -5px rgba(0, 71, 171, 0.5)',
        'glow-orange': '0 0 30px -5px rgba(255, 140, 0, 0.5)',
        'dock': '0 25px 60px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
