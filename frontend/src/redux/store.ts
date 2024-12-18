import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth-slice";
import config from "@/config";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: config.environment !== "production",
});
