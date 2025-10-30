import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";

export const useAppTheme = () => {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  return { colorScheme, isDark, colors };
};
