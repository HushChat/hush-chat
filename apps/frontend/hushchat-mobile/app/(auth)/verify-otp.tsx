import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Image } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { confirmSignup, resendOtp } from '@/services/authService';
import { AUTH_LOGIN_PATH } from '@/constants/routes';
import { ToastUtils } from '@/utils/toastUtils';
import { DEFAULT_ACTIVE_OPACITY } from '@/constants/ui';

export default function VerifyOtp() {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { colors, isDark } = useAppTheme();
  const darkLogo = process.env.EXPO_PUBLIC_LOGO_DARK_URL;
  const lightLogo = process.env.EXPO_PUBLIC_LOGO_LIGHT_URL;
  const { email } = useLocalSearchParams<{ email: string }>();

  const handleVerifyOtp = async () => {
    setErrorMessage('');
    setIsLoading(true);

    if (!confirmationCode.trim()) {
      setErrorMessage('Please enter the OTP');
      setIsLoading(false);
      return;
    }

    if (!/^\d+$/.test(confirmationCode)) {
      setErrorMessage('OTP should contain only numbers');
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
      setErrorMessage('OTP verification failed. Please try again.' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Error Occurred. Please Try Again!');
      return;
    }

    try {
      const response = await resendOtp(email);
      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }

      ToastUtils.success('Verification code sent successfully!');
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={'padding'}
      className="flex-1 justify-center px-5"
      style={{ backgroundColor: colors.background }}
    >
      <View className="p-5 rounded-lg shadow-sm" style={{ backgroundColor: colors.background }}>
        <View className="items-center mb-4">
          <Image
            source={{ uri: isDark ? darkLogo : lightLogo }}
            style={{ width: 120, height: 40, resizeMode: 'contain' }}
          />
        </View>

        <Text className="text-2xl font-bold text-center mb-5" style={{ color: colors.text }}>
          Verify OTP
        </Text>

        {errorMessage ? (
          <Text className="text-sm mb-2 text-center" style={{ color: 'red' }}>
            {errorMessage}
          </Text>
        ) : null}

        <TextInput
          placeholder="OTP"
          value={confirmationCode}
          onChangeText={setConfirmationCode}
          className="border border-gray-300 p-3 rounded-lg mb-4"
          style={{
            backgroundColor: '#f9f9f9',
            color: '#000',
          }}
          placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
          autoCapitalize="none"
          keyboardType="numeric"
        />

        <View className="pb-3">
          <Text className="text-sm text-center">
            Didn&#39;t receive the verification code?{' '}
            <TouchableOpacity onPress={handleResendOtp} activeOpacity={DEFAULT_ACTIVE_OPACITY}>
              <Text className="text-blue-500 underline">Resend</Text>
            </TouchableOpacity>
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleVerifyOtp}
          className="py-3 rounded-lg items-center"
          style={{
            backgroundColor: isDark ? '#0A84FF' : '#007AFF',
            opacity: isLoading ? 0.7 : 1,
          }}
          disabled={isLoading}
        >
          <Text className="text-lg font-semibold" style={{ color: '#fff' }}>
            {isLoading ? 'Verifying...' : 'Verify & Proceed'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
