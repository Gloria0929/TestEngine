// src/api/auth.ts
import { request } from '@/utils/request'
import type { LoginPayload, LoginResult } from '@/types/api'

export function login(payload: LoginPayload): Promise<LoginResult> {
  return request({ url: '/api/auth/login', method: 'post', data: payload })
}
export function logout(): Promise<null> {
  return request({ url: '/api/auth/logout', method: 'post' })
}
