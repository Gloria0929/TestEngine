// src/api/testPlan.ts
import { request } from '@/utils/request'
import type { PageQuery, PageResult } from '@/types'
import type { TestPlan } from '@/types/models'

export function fetchPlans(query: PageQuery): Promise<PageResult<TestPlan>> {
  return request({ url: '/api/test-plan/list', method: 'get', params: query })
}
export function createPlan(data: Partial<TestPlan>): Promise<TestPlan> {
  return request({ url: '/api/test-plan', method: 'post', data })
}
export function updatePlan(id: string, data: Partial<TestPlan>): Promise<null> {
  return request({ url: `/api/test-plan/${id}`, method: 'put', data })
}
export function deletePlan(id: string): Promise<null> {
  return request({ url: `/api/test-plan/${id}`, method: 'delete' })
}
export function copyPlan(id: string): Promise<TestPlan> {
  return request({ url: `/api/test-plan/${id}/copy`, method: 'post' })
}
