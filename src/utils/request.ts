// src/utils/request.ts
import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";
import type { ApiResult } from "@/types";
import { storage } from "./storage";

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 15000,
});

service.interceptors.request.use((config) => {
  const token = storage.get<string>("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

service.interceptors.response.use(
  (response): any => {
    const res = response.data as ApiResult;
    if (res.code !== 0) {
      if (res.code === 401) {
        storage.remove("token");
        storage.remove("user");
        window.location.href = "/login";
      }
      ElMessage.error(res.message || "请求失败");
      return Promise.reject(new Error(res.message));
    }
    return res.data;
  },
  (error) => {
    ElMessage.error(error.message || "网络异常");
    return Promise.reject(error);
  },
);

export function request<T>(config: AxiosRequestConfig): Promise<T> {
  return service.request(config) as unknown as Promise<T>;
}
