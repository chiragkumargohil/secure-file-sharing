export type TRegisterData = {
  username: string;
  email: string;
  password: string;
};

export type TLoginData = {
  email: string;
  password: string;
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