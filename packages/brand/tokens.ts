export const colors = {
  ink: "#424242",
  blue: "#8ab1fd",
  "blue-mid": "#98c0fd",
  "blue-50": "#eff4fe",
  navy: "#0d244f",
  white: "#ffffff",
  "gray-50": "#f8f8f9",
} as const;

export type BrandColor = keyof typeof colors;
