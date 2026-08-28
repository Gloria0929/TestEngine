import { request } from '@/utils/request'
import type { SysUser, SysParam, Plugin, Organization, ProjectMember, UserGroup, Integration } from '@/types/models'

export function fetchSysUsers(): Promise<SysUser[]> {
  return request({ url: '/api/setting/users', method: 'get' })
}
export function createSysUser(data: Partial<SysUser>): Promise<SysUser> {
  return request({ url: '/api/setting/users', method: 'post', data })
}
export function toggleSysUser(id: string, enabled: boolean): Promise<SysUser | null> {
  return request({ url: `/api/setting/users/${id}`, method: 'put', data: { enabled } })
}
export function resetCredential(id: string): Promise<null> {
  return request({ url: `/api/setting/users/${id}/reset`, method: 'post' })
}
export function fetchSysParams(): Promise<SysParam[]> {
  return request({ url: '/api/setting/params', method: 'get' })
}
export function createSysParam(data: Partial<SysParam>): Promise<SysParam> {
  return request({ url: '/api/setting/params', method: 'post', data })
}
export function updateSysParam(id: string, data: Partial<SysParam>): Promise<SysParam | null> {
  return request({ url: `/api/setting/params/${id}`, method: 'put', data })
}
export function fetchPlugins(): Promise<Plugin[]> {
  return request({ url: '/api/setting/plugins', method: 'get' })
}
export function togglePlugin(id: string, enabled: boolean): Promise<Plugin | null> {
  return request({ url: `/api/setting/plugins/${id}`, method: 'put', data: { enabled } })
}
export function fetchSysOrgs(): Promise<Organization[]> {
  return request({ url: '/api/setting/orgs', method: 'get' })
}
export function createSysOrg(data: Partial<Organization>): Promise<Organization> {
  return request({ url: '/api/setting/orgs', method: 'post', data })
}
export function fetchOrgMembers(): Promise<ProjectMember[]> {
  return request({ url: '/api/setting/org-members', method: 'get' })
}
export function createOrgMember(data: Partial<ProjectMember>): Promise<ProjectMember> {
  return request({ url: '/api/setting/org-members', method: 'post', data })
}
export function removeOrgMember(id: string): Promise<null> {
  return request({ url: `/api/setting/org-members/${id}`, method: 'delete' })
}
export function fetchOrgGroups(): Promise<UserGroup[]> {
  return request({ url: '/api/setting/org-groups', method: 'get' })
}
export function updateOrgGroupPermissions(groupId: string, permissions: string[]): Promise<null> {
  return request({ url: `/api/setting/org-groups/${groupId}/permissions`, method: 'put', data: { permissions } })
}
export function fetchIntegrations(): Promise<Integration[]> {
  return request({ url: '/api/setting/integrations', method: 'get' })
}
export function toggleIntegration(id: string, enabled: boolean): Promise<Integration | null> {
  return request({ url: `/api/setting/integrations/${id}`, method: 'put', data: { enabled } })
}
