// src/api/auth.ts
import { request } from '@/utils/request'
import type { LoginPayload, LoginResult } from '@/types/api'

export function login(payload: LoginPayload): Promise<LoginResult> {
  return request({ url: '/api/auth/login', method: 'post', data: payload })
}
export function logout(): Promise<null> {
  return request({ url: '/api/auth/logout', method: 'post' })
}
export function updateProfile(data: { name: string; email: string }): Promise<null> {
  return request({ url: '/api/auth/profile', method: 'put', data })
}
export function changePassword(data: { oldPassword: string; newPassword: string }): Promise<null> {
  return request({ url: '/api/auth/password', method: 'post', data })
}
