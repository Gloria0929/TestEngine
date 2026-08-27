// src/api/workstation.ts
import { request } from '@/utils/request'
import type { Notification } from '@/types/models'

export function fetchNotifications(): Promise<Notification[]> {
  return request({ url: '/api/workstation/notifications', method: 'get' })
}
export function markRead(id: string): Promise<null> {
  return request({ url: `/api/workstation/notifications/${id}/read`, method: 'post' })
}
export function markAllRead(): Promise<null> {
  return request({ url: '/api/workstation/notifications/read-all', method: 'post' })
}
