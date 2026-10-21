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
        // The current game's colour (GameTheme sets --game); falls back to the theme accent.
        game: "rgb(var(--game, var(--accent)) / <alpha-value>)",
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
      boxShadow: {
        // Chunky buttons: a darker bottom edge that disappears when pressed.
        press: "0 4px 0 0 rgb(0 0 0 / 0.38)",
        "press-sm": "0 3px 0 0 rgb(0 0 0 / 0.32)",
        // Cards: a hairline highlight on the top edge.
        card: "inset 0 1px 0 0 rgb(255 255 255 / 0.05)",
      },
      spacing: {
        tap: "3.5rem",
      },
    },
  },
  plugins: [],
};
