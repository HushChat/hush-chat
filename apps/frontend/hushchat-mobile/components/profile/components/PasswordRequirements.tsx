import React from "react";
import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { passwordRules } from "@/utils/passwordRules";

interface IPasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: IPasswordRequirementsProps) {
  if (!password) return null;

  return (
    <View className="mb-6">
      <AppText className="text-xs text-gray-500 mb-2">Password Requirements:</AppText>
      <View>
        {passwordRules.map((rule, index) => {
          const passed = rule.test(password);
          return (
            <AppText
              key={index}
              className={`text-xs ${passed ? "text-green-500" : "text-red-500"}`}
            >
              • {rule.text}
            </AppText>
          );
        })}
      </View>
    </View>
  );
}
