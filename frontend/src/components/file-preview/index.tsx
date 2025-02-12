import { File } from "lucide-react";
import PdfPreview from "../pdf-preview";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FilePreview({ file }: { file: any }) {
  const fileType = file?.type || "";
  const fileUrl = file?.url;

  const renderPreview = () => {
    switch (true) {
      case fileType.startsWith("image"):
        return (
          <div className="relative w-full max-h-96">
            <img
              src={fileUrl}
              alt={file.filename}
              className="w-full h-full object-contain block max-h-96"
              width="100%"
              height="100%"
            />
          </div>
        );
      case fileType.startsWith("video"):
        return (
          <video
            src={fileUrl}
            controls
            className="w-full h-96 object-contain"
          ></video>
        );
      case fileType.startsWith("audio"):
        return <audio src={fileUrl} controls className="w-full h-96"></audio>;
      case fileType.startsWith("application/pdf"):
        return <PdfPreview file={fileUrl} />;
      case ["txt", "csv"].includes(fileType):
        return (
          <iframe
            src={fileUrl}
            title="Text Preview"
            style={{ width: "100%", height: "500px", border: "none" }}
          ></iframe>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-96">
            <File size={64} />
            <p className="mt-4">Preview not available</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div className="p-4">{renderPreview()}</div>
    </div>
  );
}
