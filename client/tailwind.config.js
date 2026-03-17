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
        // KaamLink Brand Palette - Professional, Trustworthy, High-Tech
        primary: {
          DEFAULT: '#4F46E5', // Deep Indigo (trust, professional)
          foreground: '#FFFFFF',
          50: '#E8E7FF',
          100: '#C7C2FF',
          200: '#A59BFF',
          300: '#8374FF',
          400: '#634DE5',
          500: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
          800: '#312E81',
          900: '#1E1B4B',
        },
        secondary: {
          DEFAULT: '#64748B', // Soft Slate (modern, neutral)
          foreground: '#FFFFFF',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        accent: {
          DEFAULT: '#F97316', // Action Orange (energy, vibrant)
          foreground: '#FFFFFF',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
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
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.625rem',
        sm: '0.5rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'glass-hover': '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        'card': '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06)',
        'glow': '0 0 24px rgba(79, 70, 229, 0.15)',
        'glow-accent': '0 0 24px rgba(249, 115, 22, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

