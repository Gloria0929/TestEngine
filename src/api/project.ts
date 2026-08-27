// src/api/project.ts
import { request } from '@/utils/request'
import type { Project } from '@/types/models'

export function fetchProjects(params: { orgId: string }): Promise<Project[]> {
  return request({ url: '/api/project/list', method: 'get', params })
}
