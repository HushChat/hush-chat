/**
 * HiddenFileInput
 *
 * Hidden file input for web file selection.
 */

import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { ACCEPT_FILE_TYPES } from "@/constants/mediaConstants";

interface HiddenFileInputProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const HiddenFileInput = forwardRef<HTMLInputElement, HiddenFileInputProps>(
  ({ onChange }, ref) => {
    return (
      <input
        ref={ref}
        type="file"
        accept={ACCEPT_FILE_TYPES}
        multiple
        style={styles.input}
        onChange={onChange}
      />
    );
  }
);

HiddenFileInput.displayName = "HiddenFileInput";

const styles = StyleSheet.create({
  input: {
    display: "none",
  } as any,
});
