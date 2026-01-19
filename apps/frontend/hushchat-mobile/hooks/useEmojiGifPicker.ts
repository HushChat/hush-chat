import { useState, useCallback } from "react";

export const useEmojiGifPicker = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showGifPicker, setShowGifPicker] = useState<boolean>(false);

  const openEmojiPicker = useCallback(() => {
    setShowEmojiPicker(true);
  }, []);

  const closeEmojiPicker = useCallback(() => {
    setShowEmojiPicker(false);
  }, []);

  const openGifPicker = useCallback(() => {
    setShowGifPicker(true);
  }, []);

  const closeGifPicker = useCallback(() => {
    setShowGifPicker(false);
  }, []);

  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker((prev) => !prev);
  }, []);

  const toggleGifPicker = useCallback(() => {
    setShowGifPicker((prev) => !prev);
  }, []);

  return {
    showEmojiPicker,
    showGifPicker,
    openEmojiPicker,
    closeEmojiPicker,
    openGifPicker,
    closeGifPicker,
    toggleEmojiPicker,
    toggleGifPicker,
  };
};
