import { useState } from "react";
import { Button } from "../ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Modal from "./modal";
import { TUserAccess } from "@/types";
import usersApi from "@/apis/users.api";
import { toast } from "sonner";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: TUserAccess;
  onUserUpdated: (user: TUserAccess) => void;
};

const EditUserAccessModal = ({ open, setOpen, user, onUserUpdated }: Props) => {
  const [editingUser, setEditingUser] = useState<TUserAccess | null>(user);

  const updateUserRole = async () => {
    try {
      const { email, role } = editingUser!;
      await usersApi.upsertDriveAccess(email, { role });
      onUserUpdated({ ...user, role });
      toast.success("User role updated successfully");
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const Footer = () => {
    return <Button onClick={updateUserRole}>Confirm</Button>;
  };

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title="Edit user access"
      description={`Change the role for ${user.email}`}
      footer={<Footer />}
    >
      <Select
        onValueChange={(value: TUserAccess["role"]) => {
          setEditingUser((prev) => ({ ...prev!, role: value }));
        }}
        defaultValue={user.role}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
    </Modal>
  );
};

export default EditUserAccessModal;
