/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F2F4F8',
          100: '#D9E0EF',
          200: '#B8C2E1',
          300: '#8FA3D3',
          400: '#627CC4',
          500: '#1D2A4D', // current DEFAULT
          600: '#162040', // current hover
          700: '#121A39',
          800: '#0D1224',
          900: '#080A10',
          DEFAULT: '#1D2A4D',
          hover: '#162040',
        },
        secondary: {
          50: '#E6FEFB',
          100: '#CCFDF7',
          200: '#99FBF0',
          300: '#66F9E8',
          400: '#33F7E0',
          500: '#00CABA',
          600: '#00B5A7',
          700: '#008078',
          800: '#004B46',
          900: '#002523',
          DEFAULT: '#00CABA',
          hover: '#00B5A7',
        },
        // Semantic text tokens
        text: {
          primary: '#1D2A4D',
          secondary: '#AAAAAA',
          muted: '#777777',
          dark: '#FFFFFF',  // for dark mode text
        },
        // Semantic background tokens
        background: {
          base: '#FFFFFF',
          inverted: '#121212',
          dark: {
            DEFAULT: '#121212',
            secondary: '#1E1E1E',
            tertiary: '#2D2D2D',
          }
        },
        // Keep existing colors for compatibility
        neutral: {
          light: '#F5F7FA',
          dark: '#3A3A3A',
        },
        dark: {
          DEFAULT: '#121212',
          secondary: '#1E1E1E',
          tertiary: '#2D2D2D',
        }
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
      },
      // Container configurations
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
        },
      },
      textColor: {
        dark: {
          DEFAULT: '#FFFFFF',
          secondary: '#AAAAAA',
          tertiary: '#777777',
          accent: '#00CABA',
        }
      },
      borderColor: {
        dark: {
          DEFAULT: '#333333',
          secondary: '#444444',
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};