import usersApi from "@/apis/users.api";
import { LoginForm } from "@/components/forms";
import { useAuth } from "@/hooks/use-auth";
import { parseForm } from "@/lib/functions";
import { TLoginData } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const formDataObj = parseForm(event);
      const { email, password, mfa_code } = formDataObj as TLoginData;

      const data = await usersApi.login({ email, password, mfa_code });
      toast.success("Login successful");

      login(data?.user);

      navigate("/");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      const message = error?.response?.data?.error;
      toast.error(message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default LoginPage;
