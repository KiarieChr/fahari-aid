/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Brand Colors
                primary: {
                    DEFAULT: '#22c1e6',
                    hover: '#19a5c5',
                    light: 'rgba(34, 193, 230, 0.1)',
                },
                secondary: {
                    DEFAULT: '#a855f7',
                    light: 'rgba(168, 85, 247, 0.1)',
                },
                accent: '#eff3c1',
                // Dark Theme
                dark: {
                    bg: '#120D20',
                    surface: '#1A1625',
                    'surface-2': '#2a2438',
                    border: 'rgba(255, 255, 255, 0.05)',
                },
                // Light Theme
                light: {
                    bg: '#f1f5f9',
                    surface: '#ffffff',
                    'surface-2': '#e2e8f0',
                    border: 'rgba(0, 0, 0, 0.1)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                'glow': '0 0 20px rgba(34, 193, 230, 0.3)',
                'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
        },
    },
    plugins: [],
}
