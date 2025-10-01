/* const plugin = require("tailwindcss/plugin"); */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./frontend/**/*.{js,ts,jsx,tsx}",
  ],
  /*   safelist: ["bg-[#98bae3]", "bg-[#a0c5d9]", "bg-[#facc15]"], */
  theme: {
    extend: {
    },
  },
  plugins: [],
};

export default config;
