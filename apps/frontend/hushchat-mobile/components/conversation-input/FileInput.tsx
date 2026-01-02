import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";

interface IFileInputProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  multiple?: boolean;
}

export const FileInput = forwardRef<HTMLInputElement, IFileInputProps>(
  ({ onChange, accept = "*/*", multiple = false }, ref) => {
    return (
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
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
