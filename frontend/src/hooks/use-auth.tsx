// useAuth
import { setUser } from "@/redux/slices/auth-slice";
import { useDispatch, useSelector } from "react-redux";

export function useAuth() {
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const login = (user: any) => {
    dispatch(setUser(user));
  };

  const logout = () => {
    dispatch(setUser(null));
  };

  return { user: user?.payload ?? null, login, logout };
}
