import axios from "axios";
import { notifyRequestFinished, notifyRequestStarted } from "./slowRequest";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  notifyRequestStarted(
    Number(process.env.NEXT_PUBLIC_SLOW_REQUEST_THRESHOLD_MS ?? 6000),
  );

  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => {
    if (typeof window !== "undefined") notifyRequestFinished();
    return res;
  },
  (error) => {
    if (typeof window !== "undefined") notifyRequestFinished();
    return Promise.reject(error);
  },
);
