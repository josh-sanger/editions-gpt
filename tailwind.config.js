/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    fill: {
      'dark-shade': '#2B435E',
      'white': '#ffffff',
    },
    fontFamily: {
      'sans': ['Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
    },
    extend: {
      screens: {
        'small-mobile': '340px',
      },
      colors: {
        'dark-blue': '#4200FF',
        'light-blue': '#00FFA3',
        'white-faded': 'rgba(255, 255, 255, 0.4)',
        'white-faded-less': 'rgba(255, 255, 255, 0.8)',
      },
      spacing: {
        8: '30px',
      },
      backgroundColor: {
        'border': '#cccccc',
        'light-shade': '#F5F6F4',
        'light-accent': '#9C855F',
        'base-color': '#999BA7',
        'dark-accent': '#7E6469',
        'dark-shade': '#2B435E',
        'main-button': '#1e2d3b',
        'main-button-hover': '#141e27',
        'white': '#ffffff',
        'black': '#000000',
      },
      textColor: {
        'dark-shade': '#2B435E',
        'error': '#f44336',
      },
      borderColor: {
        'error': '#f44336',
        'border-color': '#cccccc',
      },
      borderRadius: {
        '4xl': '1.875rem',
      },
      maxWidth: {
        'maxWidth': '768px',
      },
      gridTemplateRows: {
        'layout': '1fr auto',
      },
    },
  },
  plugins: [],
  variants: {
    fill: ['hover'],
  }
};