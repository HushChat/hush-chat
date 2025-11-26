/**
 * MessageComposer
 *
 * Input component for composing and sending chat messages.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  TextInput,
  TextInputContentSizeChangeEvent,
  TextInputSelectionChangeEvent,
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import classNames from "classnames";
import { debounce } from "lodash";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import PrimaryCircularButton from "@/components/conversations/conversation-thread/composer/PrimaryCircularButton";
import ReplyPreview from "@/components/conversations/conversation-thread/message-list/ReplyPreview";
import MentionSuggestions from "@/components/conversations/conversation-thread/mentions/MentionSuggestions";
import { StorageFactory } from "@/utils/storage/storageFactory";
import { detectMentionToken, replaceMentionAtCaret, setCaretPosition } from "@/utils/mentionUtils";
import { useEnterSubmit } from "@/utils/commonUtils";
import { scheduleOnRN } from "react-native-worklets";
import { useSpecialCharHandler, WebKeyboardEvent } from "@/hooks/useSpecialCharHandler";
import { getDraftKey } from "@/constants/constants";
import { PLATFORM } from "@/constants/platformConstants";
import { ToastUtils } from "@/utils/toastUtils";
import { ACCEPT_IMAGE_TYPES, ACCEPT_DOC_TYPES } from "@/constants/mediaConstants";

import {
  ANIM_EASING,
  COLOR_ACTIVITY,
  COLOR_PLACEHOLDER,
  DEBOUNCE_DELAY,
  INPUT_FONT_SIZE,
  INPUT_PADDING_RIGHT_PX,
  RESIZE_ANIM_MS,
  RESET_ANIM_MS,
  RIGHT_ICON_GUTTER,
  SCROLLBAR_GUTTER,
  SEND_ICON_SIZE,
  WEB_LINE_HEIGHT_ADJUST,
  WEB_MAX_CONTAINER_PX,
  WEB_MIN_CONTAINER_PX,
} from "@/constants/composerConstants";

import type { ConversationParticipant, IMessage } from "@/types/chat/types";
import WebChatContextMenu from "@/components/WebContextMenu";
import { validateFiles } from "@/utils/fileValidation";
import { getConversationMenuOptions } from "@/components/conversations/conversation-thread/composer/menuOptions";
import { AppText } from "@/components/AppText";
import { logInfo } from "@/utils/logger";

type MessageInputProps = {
  onSendMessage: (message: string, parentMessage?: IMessage, files?: File[]) => void;
  onOpenImagePicker?: (files: File[]) => void;
  onOpenImagePickerNative?: () => void;
  onOpenDocumentPickerNative?: () => void;
  conversationId: number;
  disabled?: boolean;
  isSending?: boolean;
  placeholder?: string;
  minLines?: number;
  maxLines?: number;
  lineHeight?: number;
  verticalPadding?: number;
  maxChars?: number;
  autoFocus?: boolean;
  replyToMessage?: IMessage | null;
  onCancelReply?: () => void;
  isGroupChat?: boolean;
};

const ConversationInputBar = ({
  conversationId,
  onSendMessage,
  onOpenImagePicker,
  disabled = false,
  isSending = false,
  placeholder = "Type a message...",
  minLines = 1,
  maxLines = 6,
  lineHeight = 22,
  verticalPadding = PLATFORM.IS_ANDROID ? 20 : 12,
  maxChars,
  autoFocus = false,
  replyToMessage,
  onCancelReply,
  isGroupChat,
  onOpenImagePickerNative,
  onOpenDocumentPickerNative,
}: MessageInputProps) => {
  const storage = useMemo(() => StorageFactory.createStorage(), []);
  const initialHeight = useMemo(
    () => lineHeight * minLines + verticalPadding,
    [lineHeight, minLines, verticalPadding]
  );

  const [message, setMessage] = useState<string>("");
  const [inputHeight, setInputHeight] = useState<number>(initialHeight);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const textInputRef = useRef<TextInput>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const addButtonContainerRef = useRef<View>(null);

  const minHeight = useMemo(() => {
    const base = lineHeight * minLines + verticalPadding;
    return PLATFORM.IS_WEB ? Math.max(base, WEB_MIN_CONTAINER_PX) : base;
  }, [lineHeight, minLines, verticalPadding]);

  const maxHeight = useMemo(() => {
    const base = lineHeight * maxLines + verticalPadding;
    return PLATFORM.IS_WEB ? Math.max(base, WEB_MAX_CONTAINER_PX) : base;
  }, [lineHeight, maxLines, verticalPadding]);

  const animatedHeight = useSharedValue(initialHeight);
  const mentionVisible = mentionQuery !== null;
  const menuOptions = useMemo(
    () => getConversationMenuOptions(fileInputRef, documentInputRef),
    [fileInputRef, documentInputRef]
  );

  useEffect(() => {
    let cancelled = false;
    const loadDraft = async () => {
      try {
        const saved = await storage.get<string>(getDraftKey(conversationId));
        if (cancelled) return;

        const value = saved ?? "";
        setMessage(value);

        const target = value.trim().length
          ? Math.min(maxHeight, Math.max(minHeight, inputHeight))
          : minHeight;

        setInputHeight(target);
        animatedHeight.value = target;
      } catch (e) {
        logInfo("Failed to load draft", e);
      }
    };

    setInputHeight(minHeight);
    animatedHeight.value = minHeight;

    void loadDraft();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    setMessage("");
    setMentionQuery(null);
    setCursorPosition(0);
  }, [conversationId]);

  const saveDraftDebounced = useRef(
    debounce((id: number, text: string) => {
      void storage.save(getDraftKey(id), text);
    }, DEBOUNCE_DELAY)
  ).current;

  useEffect(() => {
    return () => {
      saveDraftDebounced.flush?.();
      saveDraftDebounced.cancel?.();
    };
  }, [saveDraftDebounced]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  const handleContentSizeChange = useCallback(
    (e: TextInputContentSizeChangeEvent) => {
      const next = Math.ceil(e.nativeEvent.contentSize.height);
      const clamped = Math.max(minHeight, Math.min(maxHeight, next));
      setInputHeight(clamped);
      animatedHeight.value = withTiming(clamped, {
        duration: RESIZE_ANIM_MS,
        easing: ANIM_EASING,
      });
    },
    [minHeight, maxHeight, animatedHeight]
  );

  const handleSelectionChange = useCallback((e: TextInputSelectionChangeEvent) => {
    setCursorPosition(e.nativeEvent.selection.start);
  }, []);

  const handleChangeText = useCallback(
    (raw: string) => {
      let text = raw;
      if (typeof maxChars === "number" && text.length > maxChars) {
        text = text.slice(0, maxChars);
      }
      setMessage(text);
      saveDraftDebounced(conversationId, text);

      const token = detectMentionToken(text, cursorPosition);
      setMentionQuery(token);

      if (text.trim().length === 0) {
        setInputHeight(minHeight);
        animatedHeight.value = withTiming(minHeight, {
          duration: RESIZE_ANIM_MS,
          easing: ANIM_EASING,
        });
      }
    },
    [cursorPosition, maxChars, minHeight, conversationId, saveDraftDebounced, animatedHeight]
  );

  const handleSelectMention = useCallback(
    (participant: ConversationParticipant) => {
      const username = participant.user.username;
      const { nextText, nextCaret } = replaceMentionAtCaret(message, cursorPosition, username);

      setMessage(nextText);
      setMentionQuery(null);

      if (PLATFORM.IS_WEB) {
        requestAnimationFrame(() => setCaretPosition(textInputRef, nextCaret));
      } else {
        setCursorPosition(nextCaret);
      }
    },
    [message, cursorPosition]
  );

  const handleSend = useCallback(
    (messageToSend?: string) => {
      const finalMessage = messageToSend !== undefined ? messageToSend.trim() : message.trim();

      if (!finalMessage.trim() || disabled) return;

      saveDraftDebounced.flush?.();
      onSendMessage(finalMessage, replyToMessage || undefined);

      setMessage("");
      animatedHeight.value = withTiming(
        minHeight,
        { duration: RESET_ANIM_MS, easing: ANIM_EASING },
        (finished) => {
          if (finished) {
            scheduleOnRN(setInputHeight, minHeight);
          }
        }
      );

      void storage.remove(getDraftKey(conversationId));

      if (replyToMessage) {
        onCancelReply?.();
      }

      requestAnimationFrame(() => {
        textInputRef.current?.focus();
      });

      setMentionQuery(null);
    },
    [
      message,
      disabled,
      replyToMessage,
      minHeight,
      conversationId,
      saveDraftDebounced,
      onSendMessage,
      animatedHeight,
      storage,
      onCancelReply,
    ]
  );

  const handleAddButtonPress = useCallback(async () => {
    if (PLATFORM.IS_WEB) {
      const element =
        (addButtonContainerRef.current as unknown as {
          getBoundingClientRect?: () => DOMRect;
        }) || null;
      if (element?.getBoundingClientRect) {
        const rect = element.getBoundingClientRect();
        setMenuPos({ x: rect.left, y: rect.bottom + 8 });
      } else {
        setMenuPos({ x: 0, y: 0 });
      }
      setMenuVisible(true);
      return;
    }

    setMobileMenuVisible(true);
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target;
      if (files && files.length > 0) {
        const { errors, validFiles } = validateFiles(files);

        errors.forEach((err) => ToastUtils.error(err));

        if (validFiles.length > 0 && onOpenImagePicker) {
          onOpenImagePicker(validFiles);
        }
      }
      event.target.value = "";
    },
    [onOpenImagePicker]
  );

  const handleMobileMenuSelect = useCallback(
    async (option: "images" | "documents") => {
      try {
        if (option === "images") {
          await onOpenImagePickerNative?.();
        } else if (option === "documents") {
          await onOpenDocumentPickerNative?.();
        }
      } finally {
        setMobileMenuVisible(false);
      }
    },
    [onOpenImagePickerNative, onOpenDocumentPickerNative]
  );

  const enterSubmitHandler = useEnterSubmit(() => handleSend(message));
  const specialCharHandler = useSpecialCharHandler(message, cursorPosition, {
    handlers: { "@": () => setMentionQuery("") },
  });

  const showSend = message.trim().length > 0;

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

  return (
    <View>
      {replyToMessage && (
        <ReplyPreview replyToMessage={replyToMessage} onCancelReply={onCancelReply!} />
      )}

      <View
        className={classNames(
          "flex-row items-end",
          "bg-background-light dark:bg-background-dark",
          "border-gray-200 dark:border-gray-800",
          PLATFORM.IS_WEB ? "p-4" : "p-3"
        )}
      >
        <View ref={addButtonContainerRef} style={styles.addButtonWrapper}>
          <PrimaryCircularButton
            disabled={disabled}
            iconSize={20}
            onPress={handleAddButtonPress}
            toggled={menuVisible || mobileMenuVisible}
          />
        </View>

        <View className={classNames("flex-1", PLATFORM.IS_WEB ? "mx-4" : "mx-3")}>
          <Animated.View style={animatedContainerStyle} className="overflow-hidden">
            <View
              className={classNames(
                "flex-row rounded-3xl bg-gray-300/30 dark:bg-secondary-dark",
                PLATFORM.IS_WEB ? "px-4" : "px-3"
              )}
              style={styles.inputContainer}
            >
              <TextInput
                ref={textInputRef}
                className={classNames(
                  "flex-1 text-base text-text-primary-light dark:text-text-primary-dark outline-none",
                  PLATFORM.IS_WEB ? "py-4 custom-scrollbar" : "py-3"
                )}
                placeholder={replyToMessage ? "Reply to message..." : placeholder}
                placeholderTextColor={COLOR_PLACEHOLDER}
                multiline
                scrollEnabled
                editable={!disabled}
                value={message}
                onChangeText={handleChangeText}
                onContentSizeChange={handleContentSizeChange}
                onSelectionChange={handleSelectionChange}
                onKeyPress={(e) => {
                  specialCharHandler(e);
                  enterSubmitHandler(e);
                }}
                {...(PLATFORM.IS_WEB
                  ? {
                      onKeyDown: (e: WebKeyboardEvent) => {
                        if (mentionVisible && e.key === "Enter") {
                          e.preventDefault();
                          return;
                        }
                        specialCharHandler(e);
                      },
                    }
                  : {})}
                style={textInputStyle}
                returnKeyType="send"
                enablesReturnKeyAutomatically
                autoFocus={autoFocus}
                onSubmitEditing={() => handleSend(message)}
                {...(PLATFORM.IS_WEB ? {} : { textAlignVertical: "top" })}
              />

              {isSending ? (
                <ActivityIndicator
                  size="small"
                  color={COLOR_ACTIVITY}
                  className="absolute right-3 bottom-2"
                />
              ) : showSend ? (
                <Ionicons
                  name="send"
                  size={SEND_ICON_SIZE}
                  onPress={() => handleSend(message)}
                  className="absolute right-3 bottom-2 !text-primary-light dark:!text-primary-dark"
                />
              ) : (
                <Ionicons
                  name="mic-sharp"
                  size={SEND_ICON_SIZE}
                  color={COLOR_ACTIVITY}
                  className="absolute right-3 bottom-2"
                />
              )}
            </View>

            {typeof maxChars === "number" && (
              <View className="absolute bottom-0 right-2">
                <AppText className="text-xs text-gray-400">
                  {message.length}/{maxChars}
                </AppText>
              </View>
            )}
          </Animated.View>
        </View>

        {PLATFORM.IS_WEB && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_IMAGE_TYPES}
              multiple
              style={styles.hiddenInput}
              onChange={handleFileChange}
            />
            <input
              ref={documentInputRef}
              type="file"
              accept={ACCEPT_DOC_TYPES}
              multiple
              style={styles.hiddenInput}
              onChange={handleFileChange}
            />
          </>
        )}
      </View>

      {!PLATFORM.IS_WEB && (
        <Modal
          visible={mobileMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMobileMenuVisible(false)}
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setMobileMenuVisible(false)}
          >
            <View
              style={styles.mobileMenuContainer}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[200px]"
            >
              <TouchableOpacity
                className="flex-row items-center py-3 px-4 active:bg-gray-100 dark:active:bg-gray-700"
                onPress={() => handleMobileMenuSelect("images")}
              >
                <MaterialIcons name="photo-library" size={20} color="#3B82F6" />
                <AppText className="text-sm ml-3 text-gray-900 dark:text-gray-100 font-medium">
                  Upload Images
                </AppText>
              </TouchableOpacity>

              <View className="h-px bg-gray-200 dark:bg-gray-700" />

              <TouchableOpacity
                className="flex-row items-center py-3 px-4 active:bg-gray-100 dark:active:bg-gray-700"
                onPress={() => handleMobileMenuSelect("documents")}
              >
                <MaterialIcons name="insert-drive-file" size={20} color="#3B82F6" />
                <AppText className="text-sm ml-3 text-gray-900 dark:text-gray-100 font-medium">
                  Upload Documents
                </AppText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {PLATFORM.IS_WEB && (
        <WebChatContextMenu
          visible={menuVisible}
          position={menuPos}
          onClose={() => setMenuVisible(false)}
          options={menuOptions}
          onOptionSelect={async (fn) => {
            try {
              await fn();
            } catch {
              ToastUtils.error("Error with file selection");
            } finally {
              setMenuVisible(false);
            }
          }}
        />
      )}

      {isGroupChat && mentionVisible && (
        <MentionSuggestions
          conversationId={conversationId}
          mentionQuery={mentionQuery}
          onSelect={handleSelectMention}
        />
      )}
    </View>
  );
};

export default ConversationInputBar;

const styles = StyleSheet.create({
  addButtonWrapper: {
    alignSelf: "flex-end",
  },
  inputContainer: {
    position: "relative",
    alignItems: "flex-end",
    paddingRight: RIGHT_ICON_GUTTER,
  },
  hiddenInput: {
    display: "none",
  },
  mobileMenuContainer: {
    position: "absolute",
    bottom: 80,
    left: 16,
  },
});
