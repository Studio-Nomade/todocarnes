import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0d244f",
        blue: "#8ab1fd",
        "blue-mid": "#98c0fd",
        "blue-50": "#eff4fe",
        "gray-50": "#f8f8f9",
        ink: "#424242",
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
