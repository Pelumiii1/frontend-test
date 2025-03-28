"use client";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import { useState } from "react";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { Annotation } from "@/types";
import Image from "next/image";
import ExportPDF from "./ExportPDF";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfFile: File | null;
  onAnnotate?: (annotation: Annotation) => void;
}

export const PDFViewer = ({ pdfFile, onAnnotate }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tool, setTool] = useState<
    "highlight" | "underline" | "comment" | "signature" | null
  >(null);
  const [color, setColor] = useState<string>("#ffff00");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  console.log(loading);

  // Handle mouse down to start annotation
  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    page: number
  ) => {
    if (!tool) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "signature") {
      setAnnotations((prev) => [
        ...prev,
        { type: "signature", page, x, y, signatureData: "" },
      ]);
    } else {
      setAnnotations((prev) => [
        ...prev,
        {
          type: tool,
          page,
          x,
          y,
          color: tool !== "comment" ? color : undefined,
        },
      ]);
    }
  };

  // Handle mouse up to finalize annotation
  const handleMouseUp = (
    e: React.MouseEvent<HTMLDivElement>,
    page: number,
    startAnnotation: Annotation
  ) => {
    if (!tool || tool === "signature") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // const y = e.clientY - rect.top;

    const width = Math.abs(x - startAnnotation.x);
    const height = tool === "highlight" ? 20 : 10;

    const updatedAnnotation = {
      ...startAnnotation,
      width,
      height,
      text: tool === "comment" ? prompt("Enter comment:") || "" : undefined,
    };

    setAnnotations((prev) => {
      const newAnnotations = prev.map((ann) =>
        ann.x === startAnnotation.x &&
        ann.y === startAnnotation.y &&
        ann.page === page
          ? updatedAnnotation
          : ann
      );
      onAnnotate?.(updatedAnnotation);
      return newAnnotations;
    });
    setTool(null);
  };

  if (!pdfFile) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No PDF file selected</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Annotation Toolbar */}
      <div className="flex gap-2 my-4 justify-center">
        <button
          onClick={() => setTool("highlight")}
          className={`${
            tool === "highlight" ? "bg-blue-200" : "border"
          } px-2 py-1  rounded`}
        >
          Highlight
        </button>
        <button
          onClick={() => setTool("underline")}
          className={`px-2 py-1  rounded ${
            tool === "underline" ? "bg-blue-200" : "border"
          }`}
        >
          Underline
        </button>
        <button
          onClick={() => setTool("comment")}
          className={`px-2 py-1  rounded ${
            tool === "comment" ? "bg-blue-200" : "border"
          }`}
        >
          Comment
        </button>
        <button
          onClick={() => setTool("signature")}
          className={`px-2 py-1  rounded ${
            tool === "signature" ? "bg-blue-200" : "border"
          }`}
        >
          Signature
        </button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          disabled={tool === "comment"}
          className="ml-2 rounded-full"
        />
      </div>

      <Document
        file={pdfFile}
        className="flex justify-center items-center"
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages);
          setLoading(false);
        }}
        onLoadError={(error) => {
          setError(error.message);
          setLoading(false);
        }}
        loading={
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <p className="text-gray-500">Loading PDF...</p>
          </div>
        }
        error={
          <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
            <p className="text-red-500">Failed to load PDF: {error}</p>
          </div>
        }
      >
        <div className="space-y-4 mt-5">
          {Array.from({ length: numPages }, (_, i) => {
            const pageNum = i + 1;

            return (
              <div
                key={i}
                className="relative bg-white shadow-md rounded-lg overflow-hidden"
                onMouseDown={(e) => handleMouseDown(e, pageNum)}
                onMouseUp={(e) =>
                  annotations.some(
                    (ann) => ann.page === pageNum && ann.type === tool
                  )
                    ? handleMouseUp(
                        e,
                        pageNum,
                        annotations.findLast(
                          (ann) => ann.page === pageNum && ann.type === tool
                        )!
                      )
                    : null
                }
              >
                <Page
                  pageNumber={i + 1}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
                {/* Render Annotations */}
                {annotations
                  .filter((ann) => ann.page === pageNum)
                  .map((ann, index) => (
                    <div
                      key={index}
                      style={{
                        position: "absolute",
                        left: ann.x,
                        top: Math.min(ann.y, ann.y + (ann.height || 0)),
                        width: ann.width || 0,
                        height: Math.abs(ann.height || 0),
                        backgroundColor:
                          ann.type === "highlight"
                            ? `${ann.color}80`
                            : "transparent",
                        borderBottom:
                          ann.type === "underline"
                            ? `2px solid ${ann.color}`
                            : "none",
                        pointerEvents: "none",
                      }}
                    >
                      {ann.type === "comment" && (
                        <div className="absolute bg-yellow-100 p-2 rounded shadow text-sm">
                          {ann.text}
                        </div>
                      )}
                      {ann.type === "signature" && ann.signatureData && (
                        <Image
                          src={ann.signatureData}
                          alt="Signature"
                          className="w-32 h-16"
                          width={50}
                          height={50}
                        />
                      )}
                      {ann.type === "signature" && !ann.signatureData && (
                        <div></div>
                      )}
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </Document>
      <button
        onClick={() => ExportPDF(pdfFile, annotations)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Export Annotated PDF
      </button>
    </div>
  );
};
