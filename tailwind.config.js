/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
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
