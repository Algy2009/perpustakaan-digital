/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF3FF",
          100: "#DCE7FF",
          200: "#C0D4FF",
          300: "#94B6FF",
          400: "#608EFF",
          500: "#3868F6",
          600: "#2453D4",
          700: "#1D44B8",
          800: "#1B3893",
          900: "#1B3375",
          950: "#14214A",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(15 23 42 / 0.04), 0 1px 2px -1px rgb(15 23 42 / 0.04)",
        "card-hover": "0 8px 24px -6px rgb(36 83 212 / 0.12), 0 2px 6px -2px rgb(15 23 42 / 0.05)",
        "card-dark": "0 1px 3px 0 rgb(0 0 0 / 0.35), 0 1px 2px -1px rgb(0 0 0 / 0.25)",
      },
    },
  },
  plugins: [],
};
