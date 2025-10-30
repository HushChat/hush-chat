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
