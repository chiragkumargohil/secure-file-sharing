import usersApi from "@/apis/users.api";
import { SignupForm } from "@/components/forms";
import { parseForm } from "@/lib/functions";
import { TRegisterData } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SignupPage = () => {
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const formDataObj = parseForm(event);

      const { username, email, password } = formDataObj as TRegisterData;

      await usersApi.register({ username, email, password });
      toast.success("Account created successfully");

      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <SignupForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default SignupPage;
