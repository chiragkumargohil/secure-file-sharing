import { File } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FilePreview({ file }: { file: any }) {
  const fileType = file?.filename?.split(".").pop().toLowerCase();
  const fileUrl = file?.fileUrl;

  const renderPreview = () => {
    switch (true) {
      case ["jpg", "jpeg", "png", "gif", "bmp", "svg"].includes(fileType):
        return (
          <div className="relative w-full max-h-96">
            <img
              src={fileUrl}
              alt={file.filename}
              className="w-full h-full object-contain"
            />
          </div>
        );
      case fileType === "mp4":
        return (
          <video
            src={fileUrl}
            controls
            className="w-full h-96 object-contain"
          ></video>
        );
      case fileType === "mp3":
        return <audio src={fileUrl} controls className="w-full h-96"></audio>;
      case fileType === "pdf":
        return (
          <iframe
            src={fileUrl + "#toolbar=0&navpanes=0&scrollbar=0"}
            title="PDF Preview"
            style={{ width: "100%", height: "500px", border: "none" }}
          ></iframe>
        );
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

  const getFileIcon = () => {
    return <File className="mr-2" />;
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center">{getFileIcon()}</div>
      </div>
      <div className="p-4">{renderPreview()}</div>
    </div>
  );
}
