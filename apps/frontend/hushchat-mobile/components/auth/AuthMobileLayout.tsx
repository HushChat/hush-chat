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

import React, { ReactNode } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PLATFORM } from "@/constants/platformConstants";

type TAuthMobileLayoutProps = {
  colors: { background: string; textPrimary: string };
  children: ReactNode;
  image: ImageSourcePropType;
  onBack?: () => void;
};

const PADDING_TOP = 64;
const PADDING_BOTTOM = 32;
const KEYBOARD_OFFSET = PLATFORM.IS_IOS ? 60 : 0;
const IMAGE_HEIGHT = 240;
const IMAGE_OPACITY = 0.9;
const BACK_GAP = 20;
const CONTENT_TOP = PADDING_TOP + BACK_GAP;

export default function AuthMobileLayout({
  colors,
  children,
  image,
  onBack,
}: TAuthMobileLayoutProps) {
  return (
    <View style={[style.container, { backgroundColor: colors.background }]}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={style.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : null}

      <KeyboardAvoidingView
        behavior={PLATFORM.IS_IOS ? "padding" : "height"}
        keyboardVerticalOffset={KEYBOARD_OFFSET}
        style={style.kav}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            style.content,
            { paddingTop: CONTENT_TOP, paddingBottom: PADDING_BOTTOM },
          ]}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={style.footerImageWrap}>
        <Image
          source={image}
          style={[
            style.image,
            { height: IMAGE_HEIGHT, opacity: IMAGE_OPACITY },
          ]}
        />
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    position: "absolute",
    top: PLATFORM.IS_IOS ? 50 : 30,
    left: 20,
    zIndex: 1000,
    padding: 10,
    borderRadius: 25,
    elevation: 3,
  },
  kav: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24 },
  footerImageWrap: { alignItems: "center", paddingBottom: 20 },
  image: { width: "100%", resizeMode: "contain" },
});
