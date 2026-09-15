import { colors } from "./tokens";

const brandPreset = {
  theme: {
    extend: {
      colors,
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "sans-serif"],
      },
    },
  },
};

export default brandPreset;
