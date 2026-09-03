// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import type { LoginPayload } from '@/types/api'
import type { User } from '@/types/api'

// 默认会话：应用免登录运行，直接以管理员身份访问
const DEFAULT_USER: User = {
  id: 'u-1',
  username: 'Administrator',
  name: '系统管理员',
  email: 'admin@testengine.io',
  role: '系统管理员',
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(storage.get('token') ?? 'local-token')
  const user = ref<User | null>(storage.get<User>('user') ?? DEFAULT_USER)
  const permissions = ref<string[]>(storage.get<string[]>('permissions') ?? ['*'])

  const isLoggedIn = computed(() => !!token.value)

  function hasPermission(point: string): boolean {
    return permissions.value.includes('*') || permissions.value.includes(point)
  }

  async function login(payload: LoginPayload) {
    const res = await loginApi(payload)
    token.value = res.token
    user.value = res.user
    permissions.value = res.permissions
    storage.set('token', res.token)
    storage.set('user', res.user)
    storage.set('permissions', res.permissions)
  }

  async function logout() {
    await logoutApi().catch(() => {})
    token.value = ''
    user.value = null
    permissions.value = []
    storage.remove('token'); storage.remove('user'); storage.remove('permissions')
  }

  return { token, user, permissions, isLoggedIn, hasPermission, login, logout }
})
