import { Annotation } from "@/types";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
};

const ExportPDF = async (pdfFile: File, annotations: Annotation[]) => {
  try {
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    for (const annotation of annotations) {
      const page = pages[annotation.page - 1];
      if (!page) continue;

      const { height } = page.getSize();

      switch (annotation.type) {
        case "highlight":
          page.drawRectangle({
            x: annotation.x,
            y: height - annotation.y - (annotation.height || 20),
            width: annotation.width || 100,
            height: annotation.height || 20,
            color: annotation.color ? hexToRgb(annotation.color) : rgb(1, 1, 0),
            opacity: 0.4,
          });
          break;
        case "underline":
          page.drawLine({
            start: {
              x: annotation.x,
              y: height - annotation.y - (annotation.height || 2) - 4,
            },
            end: {
              x: annotation.x + (annotation.width || 100),
              y: height - annotation.y - (annotation.height || 2) - 4,
            },
            thickness: 2,
            color: annotation.color ? hexToRgb(annotation.color) : rgb(0, 0, 0),
          });
          break;
        case "comment":
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const text = annotation.text || "";
          const textWidth = font.widthOfTextAtSize(text, 10);
          const textHeight = font.heightAtSize(10);

          // Draw background rectangle
          page.drawRectangle({
            x: annotation.x,
            y: height - annotation.y - textHeight - 4, // Position above text with padding
            width: textWidth + 8, // Add padding around text
            height: textHeight + 4, // Add padding above and below
            color: rgb(1, 1, 0.6), // Light yellow (similar to bg-yellow-100)
            opacity: 0.8,
          });

          // Draw text on top
          page.drawText(text, {
            x: annotation.x + 4, // Offset text inside background
            y: height - annotation.y - textHeight - 2, // Align text within background
            size: 10,
            font,
            color: annotation.color ? hexToRgb(annotation.color) : rgb(0, 0, 0), // Default black
          });
          break;
        case "signature":
          if (annotation.signatureData) {
            const signatureImage = await pdfDoc.embedPng(
              annotation.signatureData
            );
            page.drawImage(signatureImage, {
              x: annotation.x,
              y: height - annotation.y - 64, // Adjust for image height
              width: 128,
              height: 64,
            });
          }
          break;
      }
    }

    const pdfBytesModified = await pdfDoc.save();
    const blob = new Blob([pdfBytesModified], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "annotated.pdf";
    link.click();
  } catch (error) {
    console.error("Error exporting PDF:", error);
  }
};

export default ExportPDF;
