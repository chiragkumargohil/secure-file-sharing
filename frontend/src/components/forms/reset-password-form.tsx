import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import usersApi from "@/apis/users.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ResetPasswordForm = ({ uid, token }: { uid: string; token: string }) => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      setIsSubmitting(true);
      await usersApi.resetPassword(uid, token, {
        password: formData.get("password") as string,
      });
      toast.success("Password reset successfully");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-md mx-auto">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="showPassword"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="showPassword">Show Password</Label>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
