import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        foreground: "#e5e7eb"
      }
    }
  },
  plugins: []
};

export default config;
