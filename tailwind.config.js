/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0e0c13",
        panel: "#1a1722",
        raised: "#25212f",
        line: "#353042",
        text: "#f4f1ea",
        muted: "#a29cb0",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-ink": "rgb(var(--accent-ink) / <alpha-value>)",
        danger: "#ff5d55",
        info: "#9b8cff",
      },
      fontFamily: {
        sans: [
          "ui-rounded",
          "SF Pro Rounded",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "1.5rem",
      },
      spacing: {
        tap: "3.5rem",
      },
    },
  },
  plugins: [],
};
