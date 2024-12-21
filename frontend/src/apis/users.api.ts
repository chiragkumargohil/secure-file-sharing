// user related apis

import { TLoginData, TRegisterData } from "@/types";
import { api } from "./index";

const usersApi = {
  register: async (data: TRegisterData) => {
    const response = await api.post("users/register/", data);
    return response.data;
  },
  login: async (data: TLoginData) => {
    const response = await api.post("users/login/", data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post("users/logout/");
    return response.data;
  },
  userProfile: async () => {
    const response = await api.get("users/profile/");
    return response.data;
  },

  // drive access
  getDriveAccessEmails: async function () {
    const response = await api.get("users/access/");
    return response.data;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upsertDriveAccess: async function (email: string, data: any) {
    const response = await api.post(`users/access/${email}/`, data);
    return response.data;
  },
  deleteDriveAccess: async function (email: string) {
    const response = await api.delete(`users/access/${email}/`);
    return response.data;
  },
};

export default usersApi;
