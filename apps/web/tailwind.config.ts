import type { Config } from "tailwindcss";
import brandPreset from "@todocarnes/brand/tailwind-preset";

const config: Config = {
  presets: [brandPreset],
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
