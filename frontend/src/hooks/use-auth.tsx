// useAuth
import { setUser } from "@/redux/slices/auth-slice";
import { useDispatch, useSelector } from "react-redux";

const useAuth = () => {
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const login = (user: any) => {
    if (!user || !user.email) return;
    dispatch(
      setUser({
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        drives: Array.isArray(user.drives) ? user.drives : [],
        drive: user.drive ?? null,
        isMfaEnabled: user.is_mfa_enabled ?? false,
        role: user.role,
      })
    );
  };

  const logout = () => {
    dispatch(setUser(null));
  };

  return { user: user ?? null, login, logout };
};

export default useAuth;
