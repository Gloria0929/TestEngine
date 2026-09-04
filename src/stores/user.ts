// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
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
  const user = ref<User | null>(DEFAULT_USER)
  const permissions = ref<string[]>(['*'])

  function hasPermission(point: string): boolean {
    return permissions.value.includes('*') || permissions.value.includes(point)
  }

  return { user, permissions, hasPermission }
})
