import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import {
  LoginPage,
  SignupPage,
  PublicFilePage,
  HomePage,
  AccessPage,
  ProfilePage,
} from "./pages";
import { Toaster } from "./components/ui/sonner";
import useAuth from "./hooks/use-auth";
import { useEffect, useState } from "react";
import usersApi from "./apis/users.api";
import { useSelector } from "react-redux";
import ForgotPasswordPage from "./pages/forgot-password";
import ResetPasswordPage from "./pages/reset-password";
import { TAuthState } from "./types";
import PrimaryLayout from "./components/layouts/primary-layout";
import Loader from "./components/loader";

const PrivateRoute = () => {
  const { user } = useSelector((state: TAuthState) => state.auth);
  return user ? <Outlet /> : <Navigate to="/login" />;
};

const PublicRoute = () => {
  const { user } = useSelector((state: TAuthState) => state.auth);
  return user ? <Navigate to="/" /> : <Outlet />;
};

const App = () => {
  const { user } = useSelector((state: TAuthState) => state.auth);
  const { login, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      // Skip user fetching for public file routes
      if (window.location.pathname.includes("/files/public/")) {
        setLoading(false);
        return;
      }

      try {
        const data = await usersApi.userProfile();
        login(data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      initializeUser();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <Loader />; // Prevent rendering until user state is initialized

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <PrimaryLayout>
          <PrivateRoute />
        </PrimaryLayout>
      ),
      children: [
        { path: "/", element: <HomePage /> },
        { path: "/access", element: <AccessPage /> },
        { path: "/profile", element: <ProfilePage /> },
      ],
    },
    {
      path: "/login",
      element: <PublicRoute />,
      children: [{ path: "/login", element: <LoginPage /> }],
    },
    {
      path: "/signup",
      element: <PublicRoute />,
      children: [{ path: "/signup", element: <SignupPage /> }],
    },
    {
      path: "/forgot-password",
      element: <PublicRoute />,
      children: [{ path: "/forgot-password", element: <ForgotPasswordPage /> }],
    },
    {
      path: "/reset-password/:uid/:token",
      element: <PublicRoute />,
      children: [
        { path: "/reset-password/:uid/:token", element: <ResetPasswordPage /> },
      ],
    },
    {
      path: "/files/public/:uuid",
      element: <PublicFilePage />,
    },
    {
      path: "*",
      element: <Navigate to="/" />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

export default App;
