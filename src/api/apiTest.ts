// src/api/apiTest.ts
import { request } from '@/utils/request'
import type { DebugRequest, ExecuteResponse, ApiDefinition } from '@/types/models'

export function fetchDebugRequests(): Promise<DebugRequest[]> {
  return request({ url: '/api/api-test/debug', method: 'get' })
}
export function saveDebugRequest(data: DebugRequest): Promise<DebugRequest> {
  return request({ url: '/api/api-test/debug', method: 'post', data })
}
export function executeRequest(data: DebugRequest): Promise<ExecuteResponse> {
  return request({ url: '/api/api-test/execute', method: 'post', data })
}
export function importCurl(text: string): Promise<DebugRequest> {
  return request({ url: '/api/api-test/import-curl', method: 'post', data: { text } })
}
export function fetchApiDefinitions(): Promise<ApiDefinition[]> {
  return request({ url: '/api/api-test/definitions', method: 'get' })
}
export function createApiDefinition(data: Partial<ApiDefinition>): Promise<ApiDefinition> {
  return request({ url: '/api/api-test/definitions', method: 'post', data })
}
export function updateApiDefinition(id: string, data: Partial<ApiDefinition>): Promise<ApiDefinition> {
  return request({ url: `/api/api-test/definitions/${id}`, method: 'put', data })
}
export function deleteApiDefinition(id: string): Promise<null> {
  return request({ url: `/api/api-test/definitions/${id}`, method: 'delete' })
}
export function importDefinition(text: string): Promise<{ count: number }> {
  return request({ url: '/api/api-test/import-definition', method: 'post', data: { text } })
}
