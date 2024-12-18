import usersApi from "@/apis/users";
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
      const { email, password } = formDataObj as TLoginData;

      await usersApi.login({ email, password });
      toast.success("Login successful");

      login({
        email: email,
      });

      navigate("/");
    } catch (error) {
      console.error(error);
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
