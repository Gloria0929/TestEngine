// src/mocks/utils.ts
import type { ApiResult, PageQuery, PageResult } from '@/types'

export function ok<T>(data: T): ApiResult<T> {
  console.log('[MSW mock]', { code: 0, message: 'ok', data })
  return { code: 0, message: 'ok', data }
}
export function fail(code: number, message: string): ApiResult<null> {
  return { code, message, data: null }
}
export function page<T>(list: T[], query: PageQuery): PageResult<T> {
  const pageNum = Number(query.pageNum) || 1
  const pageSize = Number(query.pageSize) || 10
  const { keyword } = query
  let filtered = list
  if (keyword) {
    filtered = filtered.filter((it) =>
      Object.values(it as Record<string, unknown>)
        .some((v) => String(v ?? '').toLowerCase().includes(String(keyword).toLowerCase())),
    )
  }
  const total = filtered.length
  const start = (pageNum - 1) * pageSize
  const result = { list: filtered.slice(start, start + pageSize), total, pageNum, pageSize }
  console.log('[MSW mock page]', result)
  return result
}
