"use client";

import { useState } from "react";
import { Download, Trash2, Share2, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import resourcesApi from "@/apis/resources.api";
import ShareSettingsModal from "../modals/share-settings-modal";
// import { ShareFileModal } from "../modals/share-file-modal";

interface FileCardProps {
  id: string;
  name: string;
  size: number;
  updatedAt: Date;
  onDelete: () => void;
}

export function FileCard({
  id,
  name,
  size,
  updatedAt,
  onDelete,
}: FileCardProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const onDownload = async () => {
    try {
      const response = await resourcesApi.downloadFile(id);
      console.log(response);
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
    }
  };

  const handleDelete = async () => {
    try {
      await resourcesApi.deleteFile(id);
      onDelete();
    } catch (error) {
      console.error(error);
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
              <DropdownMenuItem onClick={onDownload}>Download</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-sm text-gray-500 mb-4">
          <p>Size: {formatFileSize(size)}</p>
          <p>Updated: {updatedAt.toLocaleString()}</p>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsShareDialogOpen(true)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>

      {isShareDialogOpen && (
        <ShareSettingsModal
          id={id}
          open={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
        />
      )}
    </Card>
  );
}
