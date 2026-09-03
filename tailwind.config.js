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
          orange: "#E53A00",
          "orange-dark": "#C43200",
          "orange-light": "#FFF1EC",
          green: "#16A34A",
          "green-light": "#F0FDF4",
          cream: "#FBF9F6",
          dark: "#1E293B",
          muted: "#64748B",
          border: "#E2E8F0",
        },
      },
    },
  },
  plugins: [],
};
