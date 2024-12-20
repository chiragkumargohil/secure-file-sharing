"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import resourcesApi from "@/apis/resources";

interface ShareSettingsModalProps {
  id: string;
  open: boolean;
  onClose: () => void;
}

enum AccessType {
  View = "view",
  Edit = "edit",
  Admin = "admin",
}

interface SharedUser {
  email: string;
  accessType: "view" | "edit" | "admin";
}

export function ShareFileModal({ id, open, onClose }: ShareSettingsModalProps) {
  const [sharedWith, setSharedWith] = useState<SharedUser[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newAccessType, setNewAccessType] = useState<AccessType>(
    "view" as AccessType
  );

  useEffect(() => {
    if (open) {
      const getSharedWith = async () => {
        const response = await resourcesApi.getSharedWith(id);
        if (Array.isArray(response.emails)) {
          setSharedWith(
            response.emails.map(
              (email: { receiver_email: string; access_type: string }) => ({
                email: email.receiver_email,
                accessType: email.access_type,
              })
            )
          );
        }
      };

      getSharedWith();
    }
  }, [open]);

  const handleSubmit = async () => {
    await resourcesApi.shareFile(id, {
      data: sharedWith.map((user) => {
        return {
          email: user.email,
          access_type: user.accessType,
        };
      }),
    });
    onClose();
  };

  const addSharedUser = () => {
    if (newEmail && !sharedWith.some((user) => user.email === newEmail)) {
      setSharedWith([
        ...sharedWith,
        { email: newEmail, accessType: newAccessType },
      ]);
      setNewEmail("");
      setNewAccessType("view" as AccessType);
    }
  };

  const removeSharedUser = (email: string) => {
    setSharedWith(sharedWith.filter((user) => user.email !== email));
  };

  const updateAccessType = (email: string, accessType: AccessType) => {
    setSharedWith(
      sharedWith.map((user) =>
        user.email === email ? { ...user, accessType } : user
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>Share with</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Select
                value={newAccessType}
                onValueChange={(value: AccessType) => setNewAccessType(value)}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="download">Download</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addSharedUser}>Add</Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Shared with</Label>
            {sharedWith.map((user) => (
              <div
                key={user.email}
                className="flex items-center justify-between gap-2 bg-secondary p-2 rounded-md"
              >
                <span>{user.email}</span>
                <div className="flex items-center gap-2">
                  <Select
                    value={user.accessType}
                    onValueChange={(value: AccessType) =>
                      updateAccessType(user.email, value)
                    }
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="download">Download</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSharedUser(user.email)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
