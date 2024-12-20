"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import "react-datepicker/dist/react-datepicker.css";
import resourcesApi from "@/apis/resources";
import { toast } from "sonner";

interface ShareSettingsModalProps {
  id: string;
  open: boolean;
  onClose: () => void;
}

const ShareSettingsModal = ({ id, open, onClose }: ShareSettingsModalProps) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [linkId, setLinkId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const fetchShareSettings = async () => {
        try {
          const shareSettings = await resourcesApi.getShareSettings(id);
          // set the form values based on the share settings
          const isActive = shareSettings.is_active;
          const expirationDate = shareSettings.expiration_date;
          const linkId = shareSettings.id;

          setIsActive(isActive);
          if (expirationDate) {
            setExpirationDate(new Date(expirationDate));
          }
          if (isActive) { 
            setLinkId(linkId);
          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchShareSettings();
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      const data = await resourcesApi.generateShareableLink(id, {
        is_active: isActive,
        expiration_date: isActive ? expirationDate : null,
      });
      if (data && data.id) {
        setLinkId(data.id);
      }
      toast.success("Settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Settings</DialogTitle>
        </DialogHeader>
        <div id="share-settings-form" className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="share-status" className="text-right">
              Share Status
            </Label>
            <Switch
              id="share-status"
              name="share-status"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="expiration-date">Expiration Date</Label>
            <DatePicker
              id="expiration-date"
              name="expiration-date"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholderText="Select expiration date"
              minDate={new Date()}
              selected={isActive ? expirationDate : null}
              onChange={(date) => setExpirationDate(date)}
              dateFormat="yyyy-MM-dd"
              showTimeSelect
              timeFormat="HH:mm"
              disabled={!isActive}
            />
          </div>
        </div>
        <DialogFooter>
          {linkId && isActive && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/files/public/${linkId}`
                );
                toast.success("Link copied to clipboard");
              }}
            >
              Copy Link
            </Button>
          )}
          <Button type="submit" onClick={handleSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareSettingsModal;
