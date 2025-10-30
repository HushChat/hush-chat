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
