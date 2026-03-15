import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f6ff",
          500: "#5b73ff",
          700: "#3647d6",
        },
      },
    },
  },
};

export default config;
