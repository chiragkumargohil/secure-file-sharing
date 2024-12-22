import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FilePreview from "../file-preview";

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  file: {
    name: string;
    type: string;
    url: string;
  };
}

const FilePreviewModal = ({ open, onClose, file }: FilePreviewModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl">{file.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <FilePreview file={file} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewModal;
