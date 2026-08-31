// src/utils/request.ts
import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResult } from '@/types'
import { storage } from './storage'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
})

service.interceptors.request.use((config) => {
  const token = storage.get<string>('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

function isApiResult(res: unknown): res is ApiResult {
  return (
    typeof res === 'object' &&
    res !== null &&
    'code' in res &&
    typeof (res as ApiResult).code === 'number'
  )
}

service.interceptors.response.use(
  (response): any => {
    const res = response.data
    console.log('[request] response:', res)
    if (!isApiResult(res)) {
      const msg =
        '接口返回格式异常（可能是 Mock 未启用或请求未命中 MSW），请检查网络/刷新页面'
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    }
    if (res.code !== 0) {
      if (res.code === 401) {
        storage.remove('token')
        storage.remove('user')
        window.location.hash = '/login'
      }
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
    console.log('[request] returning data:', res.data)
    return res.data
  },
  (error) => {
    ElMessage.error(error.message || '网络异常')
    return Promise.reject(error)
  },
)

export function request<T>(config: AxiosRequestConfig): Promise<T> {
  return service.request(config) as unknown as Promise<T>
}
