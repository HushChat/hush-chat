import axios from "axios";
import { AUTH_API_ENDPOINTS } from "@/constants/apiConstants";

export async function sendForgotPasswordCode(email: string) {
  try {
    const { data } = await axios.post(
      AUTH_API_ENDPOINTS.FORGOT_PASSWORD,
      null,
      {
        params: { email: email.trim() },
      },
    );

    return {
      success: true,
      message:
        typeof data === "string" ? data : "Password reset request initiated",
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to send verification code",
    };
  }
}

export async function confirmForgotPassword(
  email: string,
  code: string,
  password: string,
  session?: string,
) {
  try {
    const passwordReset = {
      email: email.trim(),
      code: code.trim(),
      password,
      ...(session && { session }),
    };

    await axios.post(AUTH_API_ENDPOINTS.CONFIRM_FORGOT_PASSWORD, passwordReset);

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to reset password",
    };
  }
}
