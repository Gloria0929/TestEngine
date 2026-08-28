import { request } from '@/utils/request'
import type { PageQuery, PageResult } from '@/types'
import type { Bug } from '@/types/models'

export function fetchBugs(query: PageQuery): Promise<PageResult<Bug>> {
  return request({ url: '/api/bug/list', method: 'get', params: query })
}
export function createBug(data: Partial<Bug>): Promise<Bug> {
  return request({ url: '/api/bug', method: 'post', data })
}
export function updateBug(id: string, data: Partial<Bug>): Promise<Bug | null> {
  return request({ url: `/api/bug/${id}`, method: 'put', data })
}
export function deleteBug(id: string): Promise<null> {
  return request({ url: `/api/bug/${id}`, method: 'delete' })
}
