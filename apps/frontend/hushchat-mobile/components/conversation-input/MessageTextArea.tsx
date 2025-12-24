import React, { forwardRef, useMemo } from "react";
import {
  TextInput,
  TextInputContentSizeChangeEvent,
  TextInputSelectionChangeEvent,
  TextInputKeyPressEvent,
} from "react-native";
import classNames from "classnames";
import { PLATFORM } from "@/constants/platformConstants";
import {
  COLOR_PLACEHOLDER,
  INPUT_FONT_SIZE,
  INPUT_PADDING_RIGHT_PX,
  WEB_LINE_HEIGHT_ADJUST,
  SCROLLBAR_GUTTER,
} from "@/constants/composerConstants";
import { WebKeyboardEvent } from "@/hooks/useSpecialCharHandler";
import { AppTextInput } from "@/components/AppText";

interface IMessageTextAreaProps {
  value: string;
  placeholder: string;
  disabled?: boolean;
  autoFocus?: boolean;
  minHeight: number;
  maxHeight: number;
  inputHeight: number;
  lineHeight: number;
  verticalPadding: number;
  onChangeText: (text: string) => void;
  onContentSizeChange: (e: TextInputContentSizeChangeEvent) => void;
  onSelectionChange: (e: TextInputSelectionChangeEvent) => void;
  onKeyPress: (e: TextInputKeyPressEvent) => void;
  onKeyDown?: (e: WebKeyboardEvent) => void;
  onSubmitEditing: () => void;
}

const MessageTextArea = forwardRef<TextInput, IMessageTextAreaProps>(
  (
    {
      value,
      placeholder,
      disabled = false,
      autoFocus = false,
      minHeight,
      maxHeight,
      inputHeight,
      lineHeight,
      verticalPadding,
      onChangeText,
      onContentSizeChange,
      onSelectionChange,
      onKeyPress,
      onSubmitEditing,
    },
    ref
  ) => {
    const computedInputStyle = useMemo(
      () => ({
        minHeight,
        maxHeight,
        height: inputHeight,
        lineHeight,
        paddingVertical: PLATFORM.IS_WEB ? verticalPadding : verticalPadding / 2,
        paddingRight: INPUT_PADDING_RIGHT_PX,
        fontSize: INPUT_FONT_SIZE,
        fontFamily: "Poppins-Regular",
        ...(PLATFORM.IS_WEB && {
          lineHeight: lineHeight + WEB_LINE_HEIGHT_ADJUST,
          overflowY: "auto" as const,
          scrollbarGutter: SCROLLBAR_GUTTER,
          outline: "none",
        }),
      }),
      [minHeight, maxHeight, inputHeight, lineHeight, verticalPadding]
    );

    return (
      <AppTextInput
        ref={ref}
        className={classNames(
          "flex-1 text-base text-text-primary-light dark:text-text-primary-dark",
          PLATFORM.IS_WEB ? "py-4 custom-scrollbar" : "py-2"
        )}
        style={computedInputStyle}
        placeholder={placeholder}
        placeholderTextColor={COLOR_PLACEHOLDER}
        editable={!disabled}
        multiline
        scrollEnabled
        autoFocus={autoFocus}
        value={value}
        onChangeText={onChangeText}
        onContentSizeChange={onContentSizeChange}
        onSelectionChange={onSelectionChange}
        onKeyPress={onKeyPress}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="send"
        enablesReturnKeyAutomatically
      />
    );
  }
);

MessageTextArea.displayName = "MessageTextArea";

export { MessageTextArea };
