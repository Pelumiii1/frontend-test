// types.ts
export type Annotation = {
  type: "highlight" | "underline" | "comment" | "signature";
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color?: string;
  imageData?: string;
  signatureData?: string;
};
