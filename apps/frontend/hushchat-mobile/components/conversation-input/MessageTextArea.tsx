import React, { forwardRef, useMemo, useEffect, useRef } from "react";
import {
  TextInput,
  TextInputContentSizeChangeEvent,
  TextInputSelectionChangeEvent,
  TextInputKeyPressEvent,
  useColorScheme,
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
import { MENTION_REGEX } from "@/constants/regex";

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
  validMentionUsernames?: Set<string>;
}

const MENTION_COLOR = "#6B4EFF";
const CARET_COLOR_LIGHT = "#333333";
const CARET_COLOR_DARK = "#FFFFFF";

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
      validMentionUsernames,
    },
    ref
  ) => {
    const measureRef = useRef<HTMLDivElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const textInputRef = useRef<TextInput>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const hasMentions =
      PLATFORM.IS_WEB && !!validMentionUsernames && validMentionUsernames.size > 0;

    const computedInputStyle = useMemo(
      () => ({
        minHeight,
        maxHeight,
        height: inputHeight,
        lineHeight,
        paddingVertical: PLATFORM.IS_WEB ? verticalPadding : verticalPadding / 2,
        paddingRight: INPUT_PADDING_RIGHT_PX,
        fontSize: INPUT_FONT_SIZE,
        fontFamily: "Poppins-Regular, OpenMoji-Color",
        ...(PLATFORM.IS_WEB && {
          lineHeight: lineHeight + WEB_LINE_HEIGHT_ADJUST,
          overflowY: "auto" as const,
          scrollbarGutter: SCROLLBAR_GUTTER,
          outline: "none",
        }),
        ...(hasMentions && {
          color: "transparent",
          caretColor: isDark ? CARET_COLOR_DARK : CARET_COLOR_LIGHT,
        }),
      }),
      [minHeight, maxHeight, inputHeight, lineHeight, verticalPadding, hasMentions, isDark]
    );

    const highlightedContent = useMemo(() => {
      if (!hasMentions) return null;

      const mentionRegex = new RegExp(MENTION_REGEX.source, "g");
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = mentionRegex.exec(value)) !== null) {
        const space = match[1] || "";
        const username = match[2];
        const punctuation = match[3] || "";
        const cleanUsername = username.replace(/\.$/, "");
        const matchStart = match.index;

        if (matchStart > lastIndex) {
          parts.push(value.slice(lastIndex, matchStart));
        }

        if (space) {
          parts.push(space);
        }

        if (validMentionUsernames!.has(cleanUsername)) {
          parts.push(
            <span key={matchStart} style={{ color: MENTION_COLOR, fontWeight: "600" }}>
              @{username}
            </span>
          );
        } else {
          parts.push(`@${username}`);
        }

        if (punctuation) {
          parts.push(punctuation);
        }

        lastIndex = matchStart + match[0].length;
      }

      if (lastIndex < value.length) {
        parts.push(value.slice(lastIndex));
      }

      return parts;
    }, [value, validMentionUsernames, hasMentions]);

    // Sync scroll between textarea and highlight overlay
    useEffect(() => {
      if (!hasMentions || !highlightRef.current) return;

      const textInputElement = textInputRef.current as unknown as HTMLElement;
      if (!textInputElement?.addEventListener) return;

      const handleScroll = () => {
        if (highlightRef.current) {
          highlightRef.current.scrollTop = textInputElement.scrollTop;
        }
      };

      textInputElement.addEventListener("scroll", handleScroll);
      return () => textInputElement.removeEventListener("scroll", handleScroll);
    }, [hasMentions]);

    useEffect(() => {
      if (PLATFORM.IS_WEB && measureRef.current) {
        const height = measureRef.current.scrollHeight;
        onContentSizeChange({
          nativeEvent: {
            contentSize: { width: 0, height },
          },
        } as TextInputContentSizeChangeEvent);
      }
    }, [value, onContentSizeChange]);

    const textInput = (
      <AppTextInput
        ref={(instance) => {
          textInputRef.current = instance;
          if (typeof ref === "function") {
            ref(instance);
          } else if (ref) {
            ref.current = instance;
          }
        }}
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
        submitBehavior={PLATFORM.IS_WEB ? "submit" : "newline"}
        returnKeyType={PLATFORM.IS_WEB ? "send" : "default"}
        value={value}
        onChangeText={onChangeText}
        onContentSizeChange={onContentSizeChange}
        onSelectionChange={onSelectionChange}
        onKeyPress={onKeyPress}
        onSubmitEditing={onSubmitEditing}
        enablesReturnKeyAutomatically
      />
    );

    if (PLATFORM.IS_WEB) {
      return (
        <div style={{ position: "relative", display: "flex", flex: 1 }}>
          {hasMentions && (
            <div
              ref={highlightRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                fontSize: INPUT_FONT_SIZE,
                fontFamily: "Poppins-Regular, OpenMoji-Color",
                lineHeight: `${lineHeight + WEB_LINE_HEIGHT_ADJUST}px`,
                padding: `${verticalPadding}px ${INPUT_PADDING_RIGHT_PX}px ${verticalPadding}px 0`,
                color: isDark ? CARET_COLOR_DARK : CARET_COLOR_LIGHT,
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              {highlightedContent}
            </div>
          )}

          {textInput}

          <div
            ref={measureRef}
            style={{
              position: "absolute",
              visibility: "hidden",
              pointerEvents: "none",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              fontSize: INPUT_FONT_SIZE,
              fontFamily: "Poppins-Regular",
              lineHeight: `${lineHeight + WEB_LINE_HEIGHT_ADJUST}px`,
              padding: `${verticalPadding}px ${INPUT_PADDING_RIGHT_PX}px ${verticalPadding}px 0`,
              width: "100%",
              maxWidth: "100%",
            }}
          >
            {value || " "}
          </div>
        </div>
      );
    }

    return textInput;
  }
);

MessageTextArea.displayName = "MessageTextArea";

export { MessageTextArea };
