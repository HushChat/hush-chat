import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { ACCEPT_FILE_TYPES } from "@/constants/mediaConstants";

interface IFileInputProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileInput = forwardRef<HTMLInputElement, IFileInputProps>(({ onChange }, ref) => {
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
});

FileInput.displayName = "HiddenFileInput";

const styles = StyleSheet.create({
  input: {
    display: "none",
  } as any,
});
