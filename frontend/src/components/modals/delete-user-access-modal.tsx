import { Button } from "../ui";
import Modal from "./modal";
import { TUserAccess } from "@/types";
import usersApi from "@/apis/users.api";
import { toast } from "sonner";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: TUserAccess;
  onAction: (user: TUserAccess) => void;
};

const DeleteUserAccessModal = ({ open, setOpen, user, onAction }: Props) => {
  const deleteUser = async (email: string) => {
    try {
      await usersApi.deleteDriveAccess(email);
      onAction(user);
      toast.success("User deleted successfully");
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const Footer = () => {
    return (
      <Button variant="destructive" onClick={() => deleteUser(user.email)}>
        Confirm
      </Button>
    );
  };

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title="Confirm Deletion"
      description={`Are you sure you want to remove ${user.email}'s access?`}
      footer={<Footer />}
    />
  );
};

export default DeleteUserAccessModal;
