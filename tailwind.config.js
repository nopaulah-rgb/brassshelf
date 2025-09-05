module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Assistant", "sans-serif"],
      },
      letterSpacing: {
        tightish: "0.6px",
        wideish: "1px",
      },
      colors: {
        brand: {
          text: "#121212",
          muted: "rgba(18,18,18,0.75)",
          surface: "#ffffff",
          cta: "#121212",
          ctaText: "#f3f3f3",
        },
        olive: {
          50: '#fafaf5',
          100: '#f5f5e9',
          200: '#e6e6c7',
          300: '#d4d4a4',
          400: '#b8b86e',
          500: '#9d9d4d',
          600: '#7a7a3d',
          700: '#5c5c2e',
          800: '#3d3d1f',
          900: '#1f1f10',
        },
      },
    },
  },
  plugins: [],
}; 