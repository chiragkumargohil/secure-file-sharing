import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import resourcesApi from "@/apis/resources.api";

interface FileWithPreview extends File {
  preview?: string;
}

type Props = {
  fetchData: () => void;
};

const UploadFileModal = ({ fetchData }: Props) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFiles([]);
      setIsDragging(false);
      setIsOpen(false);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files) as FileWithPreview[];
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as FileWithPreview[];
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!files) {
      toast.error("No file selected");
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await resourcesApi.uploadFile(formData);
      toast.success("Files uploaded successfully");
      fetchData();
      setIsOpen(false);
      setFiles([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload files");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 border-dashed">
          <Upload />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <div
          className={`mt-4 h-[125px] rounded-lg border-2 border-dashed p-4 transition-colors ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <Upload className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop files here, or click to select files
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
        {files.length > 0 && (
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center space-x-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <DialogFooter className="flex justify-between">
          <Button onClick={handleSave} disabled={files.length === 0}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadFileModal;
