/** @type {import('tailwindcss').Config} */
export const content = [
  "./app/**/*.{js,jsx,ts,tsx}",
  "./components/**/*.{js,jsx,ts,tsx}",
  "./hooks/**/*.{js,jsx,ts,tsx}",
  "./types/**/*.{js,jsx,ts,tsx}",
];
export const presets = [require("nativewind/preset")];
export const theme = {
  extend: {
    colors: {
      //dark background colors
      "primary-dark": "#563dc4",
      "secondary-dark": "#1A243A",
      "text-primary-dark": "#ffffff",
      "text-secondary-dark": "#9ca3af",
      "background-dark": "#090f1d",

      //light background colors
      "primary-light": "#6B4EFF",
      "secondary-light": "#F5F3FF",
      "text-primary-light": "#111827",
      "text-secondary-light": "#6B7280",
      "background-light": "#fafafa",

      // Bubble colors
      "bubble-incoming-light": "#F0EDFF",
      "bubble-incoming-dark": "#1E2840",

      // Surface colors
      "surface-light": "#FFFFFF",
      "surface-dark": "#111827",
      "surface-elevated-light": "#FFFFFF",
      "surface-elevated-dark": "#1A243A",

      // Divider colors
      "divider-light": "#E5E7EB",
      "divider-dark": "#1F2937",

      // Semantic colors
      success: "#22C55E",
      error: "#EF4444",
      warning: "#F59E0B",
    },
    fontFamily: {
      poppins: ["Poppins-Regular"],
      "poppins-medium": ["Poppins-Medium"],
      "poppins-semibold": ["Poppins-SemiBold"],
      "poppins-bold": ["Poppins-Bold"],
    },
    boxShadow: {
      card: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)",
      elevated: "0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
      sheet: "0 -4px 16px rgba(0, 0, 0, 0.12)",
    },
  },
};
export const plugins = [];
