import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import loginImage from "../../assets/login.svg";
import { TLoginData } from "@/types";
import usersApi from "@/apis/users.api";
import { toast } from "sonner";
import useAuth from "@/hooks/use-auth";
import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

type LoginFormProps = {
  className?: string;
} & React.ComponentProps<"form">;

const LoginForm = ({ className }: LoginFormProps) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formValues, setFormValues] = useState<TLoginData>({
    email: "",
    password: "",
    otp: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      const { email, password, otp } = formValues;

      const data = await usersApi.login({ email, password, otp });
      toast.success("Login successful");

      if (data?.is_otp_required) {
        setShowOtp(true);
        toast.success("OTP sent successfully");
        return;
      }

      if (!data?.user) {
        toast.error("User not found");
        return;
      }
      login(data?.user);
      navigate("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      const message = error?.response?.data?.error;
      toast.error(message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your CG Drive account
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="cg@example.com"
                  required
                  value={formValues.email}
                  onChange={handleInputChange}
                />
              </div>
              {!showOtp ? (
                <div className="grid gap-2">
                  <div className="flex items-end">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="ml-auto text-xs underline-offset-2 hover:underline"
                      tabIndex={-1}
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formValues.password}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="otp">OTP</Label>
                  <InputOTP
                    maxLength={6}
                    value={formValues.otp}
                    onChange={(value) =>
                      setFormValues({ ...formValues, otp: value })
                    }
                  >
                    <InputOTPGroup className="flex gap-2 justify-between w-full">
                      <InputOTPSlot index={0} className="w-full" />
                      <InputOTPSlot index={1} className="w-full" />
                      <InputOTPSlot index={2} className="w-full" />
                      <InputOTPSlot index={3} className="w-full" />
                      <InputOTPSlot index={4} className="w-full" />
                      <InputOTPSlot index={5} className="w-full" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              )}
              <div className="flex gap-2">
                {showOtp && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setShowOtp(!showOtp);
                      setFormValues({ ...formValues, otp: "" });
                    }}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Login
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src={loginImage}
              alt="Login"
              className="absolute inset-0 h-full w-full object-contain dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      {/* <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div> */}
    </div>
  );
};

export default LoginForm;
