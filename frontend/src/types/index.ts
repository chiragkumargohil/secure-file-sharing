export type TRegisterData = {
  username: string;
  email: string;
  password: string;
};

export type TLoginData = {
  email: string;
  password: string;
  mfa_code?: string;
};

export type TUserAccess = {
  id?: string;
  email: string;
  role: "admin" | "editor" | "viewer";
};

export type TDriveAccess = {
  id?: string;
  owner: string;
  role: "admin" | "editor" | "viewer";
};

export type TLoggedInUser = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  drives?: TDriveAccess[];
  drive: string | null;
  role: "admin" | "editor" | "viewer";
  isMfaEnabled: boolean;
};

export type TAuthState = {
  auth: {
    user: TLoggedInUser | null;
  };
};

export type TError = {
  type: "no-access" | "not-found" | "server-error" | "file-not-found";
  message?: string;
};
