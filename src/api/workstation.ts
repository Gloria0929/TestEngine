// src/api/workstation.ts
import { request } from '@/utils/request'
import type { Notification, TrendPoint, FollowItem } from '@/types/models'

export interface OverviewStats { caseCount: number; reviewCount: number; apiCount: number; scenarioCount: number }

export function fetchOverview(params: { projectId: string; range: string }): Promise<OverviewStats> {
  return request({ url: '/api/workstation/overview', method: 'get', params })
}
export function fetchTrend(params: { projectId: string; range: string }): Promise<TrendPoint[]> {
  return request({ url: '/api/workstation/trend', method: 'get', params })
}
export function fetchFollows(params?: { type?: string }): Promise<FollowItem[]> {
  return request({ url: '/api/workstation/follows', method: 'get', params })
}
export function fetchNotifications(): Promise<Notification[]> {
  return request({ url: '/api/workstation/notifications', method: 'get' })
}
export function markRead(id: string): Promise<null> {
  return request({ url: `/api/workstation/notifications/${id}/read`, method: 'post' })
}
export function markAllRead(): Promise<null> {
  return request({ url: '/api/workstation/notifications/read-all', method: 'post' })
}
