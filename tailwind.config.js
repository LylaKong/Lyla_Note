/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crew: {
          bg: "#0B0C0E",
          card: "#13151A",
          cardHover: "#181B22",
          border: "#20242C",
          borderHover: "#2F3542",
          volt: "#CCFF00",
          orange: "#FF5400",
          text: "#F1F3F7",
          muted: "#8E95A5",
          accent: "#CCFF00",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Pretendard"',
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
