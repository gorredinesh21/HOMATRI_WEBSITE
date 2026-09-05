/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-figtree)", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      colors: {
        homatri: {
          orange: "#E8501E",
          "orange-dark": "#C64212",
          "orange-light": "#FDEEE6",
          green: "#16A34A",
          "green-light": "#F0FDF4",
          forest: "#1E6B4E",
          "forest-deep": "#124A36",
          "forest-mist": "#E8F1EC",
          cream: "#FDF8F0",
          sand: "#F6EFE3",
          dark: "#1E293B",
          muted: "#64748B",
          border: "#E7DFD2",
        },
      },
    },
  },
  plugins: [],
};
