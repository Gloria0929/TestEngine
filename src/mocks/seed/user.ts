// src/mocks/seed/user.ts
import type { User } from '@/types/api'

export interface SeedUser {
  id: string; username: string; password: string; name: string
  email: string; role: string; permissions: string[]
}
const ALL = ['*']

export const users: SeedUser[] = [
  { id: 'u-1', username: 'Administrator', password: 'admin123', name: '系统管理员', email: 'admin@testengine.io', role: '系统管理员', permissions: ALL },
  { id: 'u-2', username: 'test', password: 'test123', name: '测试工程师', email: 'test@testengine.io', role: '测试工程师', permissions: ['testCase:view', 'testCase:create', 'testCase:edit', 'apiTest:view', 'apiTest:debug', 'testPlan:view', 'bug:view', 'bug:create'] },
  { id: 'u-3', username: 'dev', password: 'dev123', name: '开发工程师', email: 'dev@testengine.io', role: '开发工程师', permissions: ['apiTest:view', 'apiTest:debug', 'bug:view'] },
]

export function toPublicUser(u: SeedUser): User {
  const { password: _pw, permissions: _p, ...rest } = u
  return rest
}
