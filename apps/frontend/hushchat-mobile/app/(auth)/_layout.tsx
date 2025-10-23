import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="select-workspace"
        options={{ headerShown: false, title: 'Select Workspace' }}
      />
      <Stack.Screen name="login" options={{ headerShown: false, title: 'Login' }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password-reset" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false, title: 'Register' }} />
      <Stack.Screen name="verify-otp" options={{ headerShown: false, title: 'Verify OTP' }} />
    </Stack>
  );
}
