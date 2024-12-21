import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";

type Props = {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const UserProfileForm = ({ handleSubmit }: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);

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

      {/* <div className="flex items-center space-x-2">
        <Switch id="enable2FA" name="enable2FA" />
        <Label htmlFor="enable2FA">Enable Two-Factor Authentication</Label>
      </div> */}

      <Button type="submit" className="w-full">
        Update
      </Button>
    </form>
  );
};

export default UserProfileForm;
