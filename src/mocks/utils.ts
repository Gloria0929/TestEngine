// src/mocks/utils.ts
import type { ApiResult, PageQuery, PageResult } from '@/types'

export function ok<T>(data: T): ApiResult<T> {
  return { code: 0, message: 'ok', data }
}
export function fail(code: number, message: string): ApiResult<null> {
  return { code, message, data: null }
}
export function page<T>(list: T[], query: PageQuery): PageResult<T> {
  const { pageNum, pageSize, keyword } = query
  let filtered = list
  if (keyword) {
    filtered = filtered.filter((it) =>
      Object.values(it as Record<string, unknown>)
        .some((v) => String(v ?? '').toLowerCase().includes(String(keyword).toLowerCase())),
    )
  }
  const total = filtered.length
  const start = (pageNum - 1) * pageSize
  return { list: filtered.slice(start, start + pageSize), total, pageNum, pageSize }
}
