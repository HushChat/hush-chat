import { useState } from "react";
import { router } from "expo-router";
import { confirmSignup, resendOtp } from "@/services/authService";
import { AUTH_LOGIN_PATH } from "@/constants/routes";
import { ToastUtils } from "@/utils/toastUtils";

export const useVerifyOtpForm = (email: string) => {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onCodeChange = (code: string) => {
    setConfirmationCode(code);
    setErrorMessage("");
  };

  const handleVerifyOtp = async () => {
    setErrorMessage("");
    setIsLoading(true);

    if (!confirmationCode.trim()) {
      setErrorMessage("Please enter the OTP");
      setIsLoading(false);
      return;
    }

    if (!/^\d+$/.test(confirmationCode)) {
      setErrorMessage("OTP should contain only numbers");
      setIsLoading(false);
      return;
    }

    try {
      const response = await confirmSignup(email, parseInt(confirmationCode));
      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 300)); // 300ms delay

      router.push(AUTH_LOGIN_PATH);
    } catch (error: any) {
      setErrorMessage("OTP verification failed. Please try again." + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage("");

    if (!email) {
      setErrorMessage("Error Occurred. Please Try Again!");
      return;
    }

    try {
      const response = await resendOtp(email);
      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }

      ToastUtils.success("Verification code sent successfully!");
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return {
    confirmationCode,
    errorMessage,
    onCodeChange,
    handleVerifyOtp,
    handleResendOtp,
    isLoading,
  };
};
