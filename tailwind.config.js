module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  safelist: [],
  theme: {
    fontFamily: {
      sans: ["var(--font-source-sans-pro)", "Noto Sans SC", "sans-serif"],
      serif: [
        "var(--font-source-serif-pro)",
        "var(--font-noto-serif-sc)",
        "serif",
      ],
      mono: ["var(--font-fira-code)", "monospace"],
    },
    extend: {
      lineHeight: {
        ease: "1.8",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
