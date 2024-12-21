import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import usersApi from "@/apis/users.api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const formData = new FormData(e.currentTarget);
      await usersApi.forgotPassword(formData.get("email") as string);
      toast.success("Password reset link sent successfully");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send password reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-md mx-auto">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}

export default ForgotPasswordForm;
