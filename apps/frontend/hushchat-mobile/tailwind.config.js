/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/** @type {import('tailwindcss').Config} */
export const content = [
  "./app/**/*.{js,jsx,ts,tsx}",
  "./components/**/*.{js,jsx,ts,tsx}",
  "./hooks/**/*.{js,jsx,ts,tsx}",
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
