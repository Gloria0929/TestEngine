import { request } from '@/utils/request'
import type { Project, ProjectMember, UserGroup, PermissionNode } from '@/types/models'

export function fetchProjects(params: { orgId: string }): Promise<Project[]> {
  return request({ url: '/api/project/list', method: 'get', params })
}
export function fetchProject(id: string): Promise<Project> {
  return request({ url: `/api/project/${id}`, method: 'get' })
}
export function updateProject(id: string, data: Partial<Project>): Promise<null> {
  return request({ url: `/api/project/${id}`, method: 'put', data })
}
export function fetchMembers(projectId: string): Promise<ProjectMember[]> {
  return request({ url: `/api/project/${projectId}/members`, method: 'get' })
}
export function addMember(projectId: string, data: ProjectMember): Promise<null> {
  return request({ url: `/api/project/${projectId}/members`, method: 'post', data })
}
export function removeMember(projectId: string, memberId: string): Promise<null> {
  return request({ url: `/api/project/${projectId}/members/${memberId}`, method: 'delete' })
}
export function fetchGroups(): Promise<UserGroup[]> {
  return request({ url: '/api/project/groups', method: 'get' })
}
export function fetchPermissionTree(): Promise<PermissionNode[]> {
  return request({ url: '/api/project/permission-tree', method: 'get' })
}
export function updateGroupPermissions(groupId: string, permissions: string[]): Promise<null> {
  return request({ url: `/api/project/groups/${groupId}/permissions`, method: 'put', data: { permissions } })
}
