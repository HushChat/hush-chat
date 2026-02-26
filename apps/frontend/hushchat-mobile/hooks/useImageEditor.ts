import { useCallback, useRef, useState } from "react";

type EditableImage = {
  uri: string;
  index: number;
};

export function useImageEditor() {
  const [editingImage, setEditingImage] = useState<EditableImage | null>(null);
  const editedUrisRef = useRef<Map<number, string>>(new Map());

  const openEditor = useCallback((uri: string, index: number) => {
    setEditingImage({ uri, index });
  }, []);

  const closeEditor = useCallback(() => {
    setEditingImage(null);
  }, []);

  const saveEdit = useCallback(
    (editedUri: string) => {
      if (!editingImage) return;
      editedUrisRef.current.set(editingImage.index, editedUri);
      setEditingImage(null);
    },
    [editingImage]
  );

  const getEditedUri = useCallback((index: number, originalUri: string): string => {
    return editedUrisRef.current.get(index) ?? originalUri;
  }, []);

  const reset = useCallback(() => {
    setEditingImage(null);
    editedUrisRef.current = new Map();
  }, []);

  return {
    editingImage,
    isEditing: editingImage !== null,
    openEditor,
    closeEditor,
    saveEdit,
    getEditedUri,
    reset,
  };
}
