import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import { LoginPage, SignupPage } from "./pages";
import { Toaster } from "./components/ui/sonner";
import Home from "./pages/home";
import { useAuth } from "./hooks/use-auth";
import { useEffect } from "react";
import usersApi from "./apis/users";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);

  return user ? <Outlet /> : <Navigate to="/login" />;
};

const LoggedRoute = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);

  return user ? <Navigate to="/" /> : <Outlet />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoggedRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "/signup",
    element: <LoggedRoute />,
    children: [
      {
        path: "/signup",
        element: <SignupPage />,
      },
    ],
  },
]);

const App = () => {
  const { user, login, logout } = useAuth();

  useEffect(() => {
    if (user) return;

    const getUser = async () => {
      try {
        const data = await usersApi.userProfile();
        login({
          email: data.email,
          username: data.username,
        });
      } catch {
        logout();
      }
    };

    getUser();
  }, [user]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

export default App;
