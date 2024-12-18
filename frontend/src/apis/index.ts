import axios from "axios";
import config from "@/config";

/**
 * An axios instance that is used to make requests to the API.
 */
export const api = axios.create({
  baseURL: `${config.apiUrl}/api/`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
