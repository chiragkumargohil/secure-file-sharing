import { ForgotPasswordForm } from "@/components/forms";

const ForgotPasswordPage = () => {
  return (
    <div className="container mx-auto py-10 h-dvh">
      <div>
        <h1 className="text-3xl font-bold mb-6 text-center">Forgot Password</h1>
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
