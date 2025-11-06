import axios from "axios";
import { AUTH_API_ENDPOINTS } from "@/constants/apiConstants";
import { IRegisterUserPayload } from "@/types/user/types";

export async function loginUser(email: string, password: string) {
  try {
    const { data } = await axios.post(AUTH_API_ENDPOINTS.LOGIN, {
      email,
      password,
    }, { skipErrorToast: true } );
    return {
      success: true,
      idToken: data.idToken,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      email,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed. Please try again.",
    };
  }
}

export async function registerUser(userData: IRegisterUserPayload) {
  try {
    await axios.post(AUTH_API_ENDPOINTS.REGISTER, userData);
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      message: error.response?.data?.message || "Register failed. Please try again.",
    };
  }
}

export async function confirmSignup(email: string, confirmationCode: number) {
  try {
    await axios.post(AUTH_API_ENDPOINTS.VERIFY_OTP, null, {
      params: { email, confirmationCode },
    });
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      message: error.response?.data?.message || "OTP confirmation failed. Please try again.",
    };
  }
}

export async function resendOtp(email: string) {
  try {
    await axios.post(AUTH_API_ENDPOINTS.RESEND_OTP, null, {
      params: { email },
    });
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      message: error.response?.data?.message || "OTP confirmation failed. Please try again.",
    };
  }
}
