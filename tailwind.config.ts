import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        border: "#E2E8F0",
        brand: {
          navy: "#0F172A",
          DEFAULT: "#0F172A",
          dark: "#020617",
          light: "#1E293B",
        },
        clinical: {
          teal: "#0D9488",
          DEFAULT: "#0D9488",
          dark: "#0F766E",
          light: "#14B8A6",
          subtle: "#F0FDFA",
        },
        status: {
          operational: "#10B981",
          maintenance: "#F59E0B",
          critical: "#E11D48",
          emerald: "#10B981",
          amber: "#F59E0B",
          coral: "#E11D48",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        clinical: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px 0 rgba(15, 23, 42, 0.03)",
        "clinical-md": "0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -1px rgba(15, 23, 42, 0.04)",
        "clinical-lg": "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)",
        "clinical-hover": "0 12px 24px -4px rgba(13, 148, 136, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
