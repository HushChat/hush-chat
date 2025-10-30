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

import Toast, { ToastOptions, ToastType } from "react-native-toast-message";

const SUCCESS_TOAST = "success";
const ERROR_TOAST = "error";
const INFO_TOAST = "info";
const WARN_TOAST = "warn";

interface ToastFunctions {
  success: (text1: string, text2?: string, options?: ToastOptions) => void;
  error: (text1: string, text2?: string, options?: ToastOptions) => void;
  info: (text1: string, text2?: string, options?: ToastOptions) => void;
  warn: (text1: string, text2?: string, options?: ToastOptions) => void;
}

const showToast = (
  type: ToastType,
  text1: string,
  text2: string = "",
  options: ToastOptions = {},
): void => {
  Toast.show({
    type,
    text1,
    text2,
    position: options.position || "top",
    ...options,
  });
};

export const ToastUtils: ToastFunctions = {
  success: (text1, text2, options) =>
    showToast(SUCCESS_TOAST, text1, text2, options),
  error: (text1, text2, options) =>
    showToast(ERROR_TOAST, text1, text2, options),
  info: (text1, text2, options) => showToast(INFO_TOAST, text1, text2, options),
  warn: (text1, text2, options) => showToast(WARN_TOAST, text1, text2, options),
};
