import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import {
  LoginPage,
  SignupPage,
  SharedFilePage,
  HomePage,
  AccessPage,
  ProfilePage,
} from "./pages";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./hooks/use-auth";
import { useEffect } from "react";
import usersApi from "./apis/users.api";
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
        element: <HomePage />,
      },
    ],
  },
  {
    path: "/access",
    element: <PrivateRoute />,
    children: [
      {
        path: "/access",
        element: <AccessPage />,
      },
    ],
  },
  {
    path: "/profile",
    element: <PrivateRoute />,
    children: [
      {
        path: "/profile",
        element: <ProfilePage />,
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
  {
    path: "/files/public/:uuid",
    element: <SharedFilePage />,
  },
  // {
  //   path: "*",
  //   element: <Navigate to="/" />,
  // },
]);

const App = () => {
  const { user, login, logout } = useAuth();

  useEffect(() => {
    if (user) return;

    const getUser = async () => {
      // if current url is '/files/public/:uuid' then return
      if (window.location.pathname.includes("/files/public/")) return;

      try {
        const data = await usersApi.userProfile();
        login(data);
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
