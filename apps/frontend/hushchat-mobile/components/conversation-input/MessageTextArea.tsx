/**
 * MessageTextArea
 *
 * Platform-agnostic textarea component for message composition.
 */

import React, { forwardRef, useMemo } from "react";
import {
  TextInput,
  TextInputContentSizeChangeEvent,
  TextInputSelectionChangeEvent,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
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

interface MessageTextAreaProps {
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
  onKeyPress: (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;
  onKeyDown?: (e: WebKeyboardEvent) => void;
  onSubmitEditing: () => void;
}

export const MessageTextArea = forwardRef<TextInput, MessageTextAreaProps>(
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
      onKeyDown,
      onSubmitEditing,
    },
    ref
  ) => {
    const textInputStyle = useMemo(
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

    const webProps = PLATFORM.IS_WEB ? { onKeyDown } : { textAlignVertical: "top" as const };

    return (
      <TextInput
        ref={ref}
        className={classNames(
          "flex-1 text-base text-text-primary-light dark:text-text-primary-dark outline-none",
          PLATFORM.IS_WEB ? "py-4 custom-scrollbar" : "py-3"
        )}
        placeholder={placeholder}
        placeholderTextColor={COLOR_PLACEHOLDER}
        multiline
        scrollEnabled
        editable={!disabled}
        value={value}
        onChangeText={onChangeText}
        onContentSizeChange={onContentSizeChange}
        onSelectionChange={onSelectionChange}
        onKeyPress={onKeyPress}
        style={textInputStyle}
        returnKeyType="send"
        enablesReturnKeyAutomatically
        autoFocus={autoFocus}
        onSubmitEditing={onSubmitEditing}
        {...webProps}
      />
    );
  }
);

MessageTextArea.displayName = "MessageTextArea";
