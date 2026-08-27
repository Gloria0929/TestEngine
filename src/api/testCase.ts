// src/api/testCase.ts
import { request } from '@/utils/request'
import type { PageQuery, PageResult } from '@/types'
import type { TestCase, ModuleNode } from '@/types/models'

export function fetchModuleTree(projectId: string): Promise<ModuleNode[]> {
  return request({ url: '/api/test-case/modules', method: 'get', params: { projectId } })
}
export function createModule(data: { name: string; parentId?: string }): Promise<ModuleNode> {
  return request({ url: '/api/test-case/modules', method: 'post', data })
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
