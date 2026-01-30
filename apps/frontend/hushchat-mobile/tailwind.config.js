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
    },
  },
};
export const plugins = [];
