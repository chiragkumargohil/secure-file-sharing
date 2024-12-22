"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import resourcesApi from "@/apis/resources.api";
import ShareSettingsModal from "../modals/share-settings-modal";
import { ShareFileModal } from "../modals/share-file-modal";
import FilePreviewModal from "../modals/file-preview-modal";
import { toast } from "sonner";

interface FileCardProps {
  id: string;
  name: string;
  size: number;
  updatedAt: Date;
  accessType?: "download" | "view";
  onDelete: () => void;
  hideActions?: boolean;
  viewButtons?: {
    download: boolean;
    view: boolean;
    share: boolean;
    delete: boolean;
  };
}

const FileCard = ({
  id,
  name,
  size,
  updatedAt,
  onDelete,
  accessType = "download",
  viewButtons = {
    download: true,
    view: true,
    share: true,
    delete: true,
  },
  hideActions = false,
}: FileCardProps) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareSpecificDialogOpen, setIsShareSpecificDialogOpen] =
    useState(false);
  const [isViewFileDialogOpen, setIsViewFileDialogOpen] = useState(false);

  const onDownload = async () => {
    try {
      const response = await resourcesApi.downloadFile(id);
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async () => {
    try {
      await resourcesApi.deleteFile(id);
      onDelete();
      toast.success("File deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete file");
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold truncate" title={name}>
            {name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More options">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setIsViewFileDialogOpen(true)}
                disabled={!viewButtons.view}
                className="cursor-pointer"
                title={!viewButtons.view ? "You don't have permission" : ""}
              >
                View file
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDownload}
                disabled={!viewButtons.download || accessType === "view"}
                className="cursor-pointer"
                title={!viewButtons.download ? "You don't have permission" : ""}
              >
                Download
              </DropdownMenuItem>
              {!hideActions && (
                <>
                  <DropdownMenuItem
                    onClick={() => setIsShareDialogOpen(true)}
                    disabled={!viewButtons.share}
                    className="cursor-pointer"
                    title={
                      !viewButtons.share ? "You don't have permission" : ""
                    }
                  >
                    Share publicly
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsShareSpecificDialogOpen(true)}
                    disabled={!viewButtons.share}
                    className="cursor-pointer"
                    title={
                      !viewButtons.share ? "You don't have permission" : ""
                    }
                  >
                    Share with specific users
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600 cursor-pointer"
                    disabled={!viewButtons.delete}
                    title={
                      !viewButtons.delete ? "You don't have permission" : ""
                    }
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-sm text-gray-500 mb-4">
          <p>Size: {formatFileSize(size)}</p>
          <p>
            Updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "-"}
          </p>
        </div>
      </CardContent>

      {isShareDialogOpen && (
        <ShareSettingsModal
          id={id}
          open={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
        />
      )}

      {isShareSpecificDialogOpen && (
        <ShareFileModal
          id={id}
          open={isShareSpecificDialogOpen}
          onClose={() => setIsShareSpecificDialogOpen(false)}
        />
      )}

      {isViewFileDialogOpen && (
        <FilePreviewModal
          open={isViewFileDialogOpen}
          onClose={() => setIsViewFileDialogOpen(false)}
          fileId={id}
        />
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this file?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default FileCard;
