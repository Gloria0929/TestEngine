// src/api/testCase.ts
import { request } from '@/utils/request'
import type { PageQuery, PageResult } from '@/types'
import type { TestCase, ModuleNode, Review, ReviewDetail } from '@/types/models'

export function fetchModuleTree(projectId: string): Promise<ModuleNode[]> {
  return request({ url: '/api/test-case/modules', method: 'get', params: { projectId } })
}
export function fetchCaseList(query: PageQuery): Promise<PageResult<TestCase>> {
  return request({ url: '/api/test-case/list', method: 'get', params: query })
}
export function fetchCase(id: string): Promise<TestCase> {
  return request({ url: `/api/test-case/${id}`, method: 'get' })
}
export function createCase(data: Partial<TestCase>): Promise<TestCase> {
  return request({ url: '/api/test-case', method: 'post', data })
}
export function updateCase(id: string, data: Partial<TestCase>): Promise<TestCase> {
  return request({ url: `/api/test-case/${id}`, method: 'put', data })
}
export function deleteCase(id: string): Promise<null> {
  return request({ url: `/api/test-case/${id}`, method: 'delete' })
}
export function fetchRecycle(): Promise<TestCase[]> {
  return request({ url: '/api/test-case/recycle', method: 'get' })
}
export function restoreCase(id: string): Promise<null> {
  return request({ url: `/api/test-case/recycle/${id}/restore`, method: 'post' })
}
export function purgeCase(id: string): Promise<null> {
  return request({ url: `/api/test-case/recycle/${id}`, method: 'delete' })
}
export function fetchReviews(): Promise<Review[]> {
  return request({ url: '/api/test-case/reviews', method: 'get' })
}
export function createReview(data: Partial<Review>): Promise<Review> {
  return request({ url: '/api/test-case/reviews', method: 'post', data })
}
export function updateReview(id: string, data: Partial<Review>): Promise<Review | null> {
  return request({ url: `/api/test-case/reviews/${id}`, method: 'put', data })
}
export function fetchReviewDetail(id: string): Promise<ReviewDetail | null> {
  return request({ url: `/api/test-case/reviews/${id}`, method: 'get' })
}
export function submitReviewResult(id: string, results: { caseId: string; passed: boolean; comment?: string }[]): Promise<Review | null> {
  return request({ url: `/api/test-case/reviews/${id}/result`, method: 'post', data: { results } })
}
