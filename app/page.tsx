"use client";

import { PDFViewer } from "@/components/PDFViewer";
import UploadArea from "@/components/UploadArea";
import { useState } from "react";

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  return (
    <>
      <UploadArea setPdfFile={setPdfFile} />
      {pdfFile && <PDFViewer pdfFile={pdfFile} />}
    </>
  );
}
