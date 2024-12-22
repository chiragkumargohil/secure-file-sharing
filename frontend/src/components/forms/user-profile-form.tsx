import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import usersApi from "@/apis/users.api";
import { setUser } from "@/redux/slices/auth-slice";
import { toast } from "sonner";
import MFAQRCode from "../mfa-qr-code";

const UserProfileForm = () => {
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());
      await usersApi.updateProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        is_mfa_enabled: data.isMfaEnabled === "on",
      });
      dispatch(
        setUser({
          ...user,
          firstName: data.firstName,
          lastName: data.lastName,
          isMfaEnabled: data.isMfaEnabled === "on",
        })
      );
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <form className="space-y-8 max-w-full" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          disabled
          defaultValue={user.email}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          required
          disabled
          defaultValue={user.username}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="firstName">First name</Label>
        <Input
          id="firstName"
          name="firstName"
          required
          defaultValue={user.firstName}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last name</Label>
        <Input
          id="lastName"
          name="lastName"
          required
          defaultValue={user.lastName}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isMfaEnabled"
          name="isMfaEnabled"
          defaultChecked={user.isMfaEnabled}
        />
        <Label htmlFor="isMfaEnabled">Enable Two-Factor Authentication</Label>
      </div>

      {user.isMfaEnabled && <MFAQRCode />}

      <Button type="submit" className="w-full">
        Update
      </Button>
    </form>
  );
};

export default UserProfileForm;
