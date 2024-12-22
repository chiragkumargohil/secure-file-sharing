import { useState } from "react";
import { Button } from "../ui";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
import { isValidEmail } from "@/lib/functions";
import useAuth from "@/hooks/use-auth";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onUserAdded: (user: TUserAccess) => void;
};

const AddUserAccessModal = ({ open, setOpen, onUserAdded }: Props) => {
  const { user } = useAuth();
  const [newUser, setNewUser] = useState({
    email: "",
    role: "viewer" as TUserAccess["role"],
  });
  const [isLoading, setIsLoading] = useState(false);

  const addUser = async () => {
    if (!newUser.email) {
      toast.error("Please enter an email");
      return;
    }

    if (!isValidEmail(newUser.email)) {
      toast.error("Please enter a valid email");
      return;
    }

    if (user?.email === newUser.email) {
      toast.error("You can't add yourself");
      return;
    }

    try {
      setIsLoading(true);
      await usersApi.upsertDriveAccess(newUser.email, { role: newUser.role });
      onUserAdded(newUser);
      setNewUser({ email: "", role: "viewer" });
      toast.success("User added successfully");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add user");
    } finally {
      setIsLoading(false);
    }
  };

  const Footer = () => {
    return (
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button onClick={addUser} disabled={isLoading}>
          Add User
        </Button>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title="Add user access"
      footer={<Footer />}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="role">Role</Label>
          <Select
            onValueChange={(value: TUserAccess["role"]) =>
              setNewUser({ ...newUser, role: value })
            }
            defaultValue={newUser.role}
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
        </div>
      </div>
    </Modal>
  );
};

export default AddUserAccessModal;
