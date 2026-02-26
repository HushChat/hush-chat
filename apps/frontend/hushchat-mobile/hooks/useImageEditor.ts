import { useCallback, useState } from "react";

type EditableImage = {
  uri: string;
  index: number;
};

export function useImageEditor() {
  const [editingImage, setEditingImage] = useState<EditableImage | null>(null);
  const [editedUris, setEditedUris] = useState<Map<number, string>>(new Map());

  const openEditor = useCallback((uri: string, index: number) => {
    setEditingImage({ uri, index });
  }, []);

  const closeEditor = useCallback(() => {
    setEditingImage(null);
  }, []);

  const saveEdit = useCallback(
    (editedUri: string) => {
      if (!editingImage) return;
      setEditedUris((prev) => new Map(prev).set(editingImage.index, editedUri));
      setEditingImage(null);
    },
    [editingImage]
  );

  const getEditedUri = useCallback(
    (index: number, originalUri: string): string => {
      return editedUris.get(index) ?? originalUri;
    },
    [editedUris]
  );

  const reset = useCallback(() => {
    setEditingImage(null);
    setEditedUris(new Map());
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
