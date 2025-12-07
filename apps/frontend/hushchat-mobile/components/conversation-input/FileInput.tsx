import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";

interface IFileInputProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
}

export const FileInput = forwardRef<HTMLInputElement, IFileInputProps>(
  ({ onChange, accept = "*/*" }, ref) => {
    return (
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple
        style={styles.input}
        onChange={onChange}
      />
    );
  }
);

FileInput.displayName = "FileInput";

const styles = StyleSheet.create({
  input: {
    display: "none",
  } as any,
});
