export type DrawingTool = "pen" | "highlighter";

export type DrawPath = {
  id: string;
  points: string;
  color: string;
  strokeWidth: number;
  opacity: number;
  tool: DrawingTool;
};

export type ImageEditorProps = {
  visible: boolean;
  imageUri: string;
  onSave: (editedUri: string) => void;
  onCancel: () => void;
};
