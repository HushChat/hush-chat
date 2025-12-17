import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SOUND_ENABLED_KEY } from "@/constants/constants";

export const SoundToggleButton = () => {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SOUND_ENABLED_KEY).then((value) => {
      if (value) setEnabled(value === "true");
    });
  }, []);

  const toggle = async () => {
    const newValue = !enabled;
    setEnabled(newValue);
    await AsyncStorage.setItem(SOUND_ENABLED_KEY, String(newValue));
  };

  return (
    <TouchableOpacity onPress={toggle} className="p-2">
      <Ionicons name={enabled ? "volume-high" : "volume-mute"} size={24} color="#6B7280" />
    </TouchableOpacity>
  );
};
