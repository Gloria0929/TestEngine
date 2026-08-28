// src/api/apiTest.ts
import { request } from '@/utils/request'
import type { DebugRequest, ExecuteResponse, ApiDefinition, Scenario, ApiReport, MockRule } from '@/types/models'

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
export function fetchScenarios(): Promise<Scenario[]> {
  return request({ url: '/api/api-test/scenarios', method: 'get' })
}
export function saveScenario(data: Scenario): Promise<Scenario> {
  return request({ url: '/api/api-test/scenarios', method: 'post', data })
}
export function executeScenario(id: string): Promise<Record<string, unknown>> {
  return request({ url: `/api/api-test/scenarios/${id}/execute`, method: 'post' })
}
export function deleteScenario(id: string): Promise<null> {
  return request({ url: `/api/api-test/scenarios/${id}`, method: 'delete' })
}
export function fetchScenarioRecycle(): Promise<Scenario[]> {
  return request({ url: '/api/api-test/scenarios/recycle', method: 'get' })
}
export function restoreScenario(id: string): Promise<null> {
  return request({ url: `/api/api-test/scenarios/recycle/${id}/restore`, method: 'post' })
}
export function purgeScenario(id: string): Promise<null> {
  return request({ url: `/api/api-test/scenarios/recycle/${id}`, method: 'delete' })
}
export function fetchApiReports(): Promise<ApiReport[]> {
  return request({ url: '/api/api-test/reports', method: 'get' })
}
export function fetchApiReport(id: string): Promise<ApiReport> {
  return request({ url: `/api/api-test/reports/${id}`, method: 'get' })
}
export function fetchMockRules(): Promise<MockRule[]> {
  return request({ url: '/api/api-test/mock', method: 'get' })
}
export function saveMockRule(data: MockRule): Promise<MockRule> {
  return request({ url: '/api/api-test/mock', method: 'post', data })
}
export function updateMockRule(id: string, data: Partial<MockRule>): Promise<MockRule> {
  return request({ url: `/api/api-test/mock/${id}`, method: 'put', data })
}
export function deleteMockRule(id: string): Promise<null> {
  return request({ url: `/api/api-test/mock/${id}`, method: 'delete' })
}
