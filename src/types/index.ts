// src/types/index.ts
export interface ApiResult<T = unknown> {
  code: number
  message: string
  data: T
}
export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}
export interface PageQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: unknown
}
export interface OptionItem { label: string; value: string | number }
