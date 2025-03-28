## Document Signer & Annotation Tool

A React-based web application built with Next.js that allows users to upload PDF files, annotate them with highlights, underlines, comments, and signatures, and export the annotated PDF. This tool is designed for document review and signing workflows.

**Features**
-Upload PDF: Upload a PDF file to view and annotate.
-Annotations:
-Highlight text with customizable colors.
-Underline text with customizable colors.
-Add comments with a yellow background.
-Draw and place signatures anywhere on the document.
-Multi-Page Support: View and annotate multiple pages of a PDF.
-Export: Download the annotated PDF with all annotations preserved.
-Setup and Running Instructions

**Prerequisites**
Node.js: Version 20.6.0 or later (required for Promise.withResolvers support in pdfjs-dist).
npm: Comes with Node.js for package management.

**Installation**
Clone the Repository:
-git clone <repository-url>
-cd document-signer
Install Dependencies:
-npm install
(This installs Next.js, React, and all required libraries listed below.)
Run the Development Server:
-npm run dev
-Open your browser to <http://localhost:3000> to see the app running.
-Build for Production (optional):
npm run build
npm start

**Project Structure**

document-signer/
├── components/
│   ├── ExportPDF.tsx       # Exports annotated PDF using pdf-lib
│   ├── PDFViewer.tsx       # Renders PDF and handles annotations
│   ├── SignatureTool.tsx   # Signature drawing component
│   └── UploadArea.tsx      # PDF upload component
├── pages/
│   └── index.tsx           # Main app page
├── types.ts                # TypeScript types for annotations
├── package.json
└── README.md

**Libraries and Tools Used**
-**Next.js**: Framework for React with server-side rendering and static site generation. Used for its simplicity, built-in routing, and TypeScript support.
-**React**: Core library for building the UI. Chosen for its component-based architecture and ecosystem.
-**react-pdf**: Renders PDF files in the browser using pdf.js. Selected for its ease of integration with React and support for text/annotation layers.
-pdf-lib: Modifies and exports PDFs with annotations. Chosen for its ability to programmatically edit PDFs (e.g., draw shapes, embed images) without a server.
-react-canvas-draw: Provides a canvas for drawing signatures. Used because it offers a simple API for capturing signatures as base64 images.
-TypeScript: Adds static typing to JavaScript. Used to improve code reliability and maintainability.
-Tailwind CSS: Utility-first CSS framework. Included via Next.js for rapid UI styling.

**Why These Choices?**
react-pdf + pdf-lib: react-pdf handles rendering, while pdf-lib handles editing, forming a complete client-side PDF solution without backend dependencies.
react-canvas-draw: Simplifies signature capture compared to building a custom canvas solution.
Next.js + TypeScript: Provides a modern, type-safe development experience with minimal setup.

## Challenges Faced and Solutions

**Canvas Reuse Error with pdf.js:**
-**Challenge:** Early iterations using pdfjs-dist directly threw "Cannot use the same canvas during multiple render operations" errors due to overlapping render calls.
-**Solution:** Managed render tasks with cancellation (renderTask.cancel()) and ensured cleanup in useEffect hooks. Switched to react-pdf for a higher-level abstraction that avoided this issue.
Promise.withResolvers Not Supported:

**Challenge:** react-pdf/pdfjs-dist used Promise.withResolvers(), unsupported in Node.js < 20.
**Solution:** Recommended upgrading to Node.js 20+. Alternatively, a polyfill could be added (not implemented here).
Annotation Height Mismatch:

**Challenge:** Fixed height values for highlights/underlines didn’t fit text well.
Solution: Updated to allow vertical dragging to set height dynamically, improving fit without requiring text layer parsing.
Underline Positioning on Export:

**Challenge:** Underlines appeared on top of text in the exported PDF due to coordinate system differences.
**Solution:** Adjusted the y coordinate in pdf-lib (height - annotation.y - height - offset) to place underlines below text.
Comment Background in Export:

**Challenge:** Comments lacked a background in the exported PDF, unlike the UI.
**Solution:** Added a drawRectangle call before drawText in pdf-lib, using text measurements to size the background.

## Future Features (If I Had More Time)

-Text-Based Annotations:
Integrate react-pdf’s text layer to allow precise text selection for highlights and underlines, mapping mouse coordinates to text bounds for perfect alignment.
-Page Navigation:
Add "Previous" and "Next" buttons or a thumbnail sidebar for easier multi-page navigation, enhancing usability for large documents.
-Undo/Redo Functionality:
Implement an annotation history stack to allow users to undo or redo annotations, improving the editing experience.
-Annotation Editing:
Enable clicking on existing annotations to edit (e.g., resize, recolor, or retype comments), making the tool more interactive.
-Customizable Comment Background:
Add a color picker for comment backgrounds, stored in the Annotation type, to match the customization of highlights/underlines.
