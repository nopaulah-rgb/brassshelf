import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Extracted from brassshelf.com computed styles
        brand: {
          text: "#121212", // rgb(18,18,18)
          muted: "rgba(18,18,18,0.75)",
          surface: "#ffffff",
          cta: "#121212",
          ctaText: "#f3f3f3",
        },
      },
      fontFamily: {
        sans: ["Assistant", "sans-serif"],
      },
      letterSpacing: {
        tightish: "0.6px",
        wideish: "1px",
      },
    },
  },
  plugins: [],
} satisfies Config;
