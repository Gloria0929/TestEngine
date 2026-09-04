// src/types/api.ts
export type { ApiResult, PageResult, PageQuery, OptionItem } from './index'
export interface User {
  id: string
  username: string
  name: string
  email: string
  role: string
  avatar?: string
}
