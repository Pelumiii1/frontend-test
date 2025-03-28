import React, { useRef } from "react";

const UploadArea = ({ setPdfFile }: { setPdfFile: (file: File) => void }) => {
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file.type === "application/pdf") setPdfFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please upload a valid pdf file");
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="border rounded-lg w-fit p-5 cursor-pointer"
    >
      <p onClick={() => uploadRef.current?.click()}>
        Drag and Drop a PDF file or click to upload
      </p>
      <input
        ref={uploadRef}
        type="file"
        accept=".pdf"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

export default UploadArea;
