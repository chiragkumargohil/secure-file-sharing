import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FilePreview from "../file-preview";
import { useEffect, useState } from "react";
import resourcesApi from "@/apis/resources.api";

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  fileId: string;
}

const FilePreviewModal = ({ open, onClose, fileId }: FilePreviewModalProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fileData, setFileData] = useState<any>({
    filename: "",
    url: "",
  });

  useEffect(() => {
    if (!fileId) return;
    const fetchFileDetails = async () => {
      try {
        const response = await resourcesApi.downloadFile(fileId as string);
        const data = response.data;
        const contentDisposition = response.headers["Content-Disposition"];
        const blob = new Blob([data], {
          type: response.headers["content-type"],
        });

        const filename = contentDisposition
          ? contentDisposition.split("filename=")[1]
          : "";

        const url = URL.createObjectURL(blob);
        setFileData({
          filename: filename,
          url,
          type: response.headers["content-type"],
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchFileDetails();
  }, [fileId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl">{fileData.filename}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <FilePreview file={fileData} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewModal;
