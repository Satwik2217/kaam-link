/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './app/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // KaamLink Brand Colors
        primary: {
          DEFAULT: '#E85D04', // Vibrant saffron-orange (trust, India)
          foreground: '#FFFFFF',
          50: '#FFF3E0',
          100: '#FFE0B2',
          500: '#E85D04',
          600: '#D04E03',
          700: '#B84302',
        },
        secondary: {
          DEFAULT: '#1B4332', // Deep forest green (growth, safety)
          foreground: '#FFFFFF',
          50: '#D8F3DC',
          500: '#1B4332',
          600: '#163729',
        },
        accent: {
          DEFAULT: '#FFB703', // Warm gold (prosperity, premium)
          foreground: '#1A1A1A',
        },
        background: '#F8F9FA',
        surface: '#FFFFFF',
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        border: '#E2E8F0',
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#16A34A',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#D97706',
          foreground: '#FFFFFF',
        },
        sos: {
          DEFAULT: '#DC2626',
          hover: '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.625rem',
        md: 'calc(0.625rem - 2px)',
        sm: 'calc(0.625rem - 4px)',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};

