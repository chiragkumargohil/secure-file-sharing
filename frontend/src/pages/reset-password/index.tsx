import { ResetPasswordForm } from "@/components/forms";
import { useParams } from "react-router-dom";

const ResetPasswordPage = () => {
  const { uid, token } = useParams();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Reset Password</h1>
      <ResetPasswordForm uid={uid as string} token={token as string} />
    </div>
  );
};

export default ResetPasswordPage;
