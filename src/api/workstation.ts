// src/api/workstation.ts
import { request } from '@/utils/request'
import type { TrendPoint } from '@/types/models'

export interface OverviewStats { caseCount: number; reviewCount: number; apiCount: number; scenarioCount: number }

export function fetchOverview(params: { projectId: string; range: string }): Promise<OverviewStats> {
  return request({ url: '/api/workstation/overview', method: 'get', params })
}
export function fetchTrend(params: { projectId: string; range: string }): Promise<TrendPoint[]> {
  return request({ url: '/api/workstation/trend', method: 'get', params })
}
