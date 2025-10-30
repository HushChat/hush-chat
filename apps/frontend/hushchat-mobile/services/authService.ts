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

import axios from "axios";
import { AUTH_API_ENDPOINTS } from "@/constants/apiConstants";
import { IRegisterUserPayload } from "@/types/user/types";

export async function loginUser(email: string, password: string) {
  try {
    const { data } = await axios.post(AUTH_API_ENDPOINTS.LOGIN, {
      email,
      password,
    });
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
      message:
        error.response?.data?.message || "Login failed. Please try again.",
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
      message:
        error.response?.data?.message || "Register failed. Please try again.",
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
      message:
        error.response?.data?.message ||
        "OTP confirmation failed. Please try again.",
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
      message:
        error.response?.data?.message ||
        "OTP confirmation failed. Please try again.",
    };
  }
}
