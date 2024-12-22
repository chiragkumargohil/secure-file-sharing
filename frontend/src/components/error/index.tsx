import { TError } from "@/types";
import { AlertTriangle, FileX, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const Error = ({ type, message }: TError) => {
  const errorConfig = {
    "no-access": {
      icon: Lock,
      title: "Access Denied",
      description:
        message || "You do not have permission to access this resource.",
    },
    "not-found": {
      icon: FileX,
      title: "404 - Page Not Found",
      description: message || "The page you are looking for does not exist.",
    },
    "server-error": {
      icon: AlertTriangle,
      title: "Oops! Something Went Wrong",
      description:
        message ||
        "We encountered an unexpected error. Please try again later.",
    },
    "file-not-found": {
      icon: FileX,
      title: "File Not Found",
      description:
        message ||
        "The file you are looking for does not exist or has been moved.",
    },
  };

  const { icon: Icon, title, description } = errorConfig[type];

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto h-12 w-12 text-primary" />
        <div className="mb-6">
          <Icon className="mx-auto h-16 w-16" />
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{description}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error;
