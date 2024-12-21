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
};

export default usersApi;
