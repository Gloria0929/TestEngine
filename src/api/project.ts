import { request } from '@/utils/request'
import type { PageQuery, PageResult } from '@/types'
import type {
  Project,
  ProjectMember,
  UserGroup,
  PermissionNode,
  Environment,
  MessageConfig,
  OperationLog,
  FileItem,
  ProjectTemplate,
  Script,
} from '@/types/models'

export function fetchProjects(params: { orgId: string }): Promise<Project[]> {
  return request({ url: '/api/project/list', method: 'get', params })
}
export function createProject(data: Partial<Project>): Promise<Project> {
  return request({ url: '/api/project', method: 'post', data })
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
export function fetchEnvironments(): Promise<Environment[]> {
  return request({ url: '/api/project/environments', method: 'get' })
}
export function createEnvironment(data: Partial<Environment>): Promise<Environment> {
  return request({ url: '/api/project/environments', method: 'post', data })
}
export function updateEnvironment(id: string, data: Partial<Environment>): Promise<Environment | null> {
  return request({ url: `/api/project/environments/${id}`, method: 'put', data })
}
export function deleteEnvironment(id: string): Promise<null> {
  return request({ url: `/api/project/environments/${id}`, method: 'delete' })
}
export function fetchMessageConfigs(): Promise<MessageConfig[]> {
  return request({ url: '/api/project/messages', method: 'get' })
}
export function updateMessageConfig(id: string, data: Partial<MessageConfig>): Promise<MessageConfig | null> {
  return request({ url: `/api/project/messages/${id}`, method: 'put', data })
}
export function fetchOperationLogs(query: PageQuery): Promise<PageResult<OperationLog>> {
  return request({ url: '/api/project/logs', method: 'get', params: query })
}
export function fetchTemplates(): Promise<ProjectTemplate[]> {
  return request({ url: '/api/project/templates', method: 'get' })
}
export function createTemplate(data: Partial<ProjectTemplate>): Promise<ProjectTemplate> {
  return request({ url: '/api/project/templates', method: 'post', data })
}
export function updateTemplate(id: string, data: Partial<ProjectTemplate>): Promise<ProjectTemplate | null> {
  return request({ url: `/api/project/templates/${id}`, method: 'put', data })
}
export function deleteTemplate(id: string): Promise<null> {
  return request({ url: `/api/project/templates/${id}`, method: 'delete' })
}
export function fetchFiles(): Promise<FileItem[]> {
  return request({ url: '/api/project/files', method: 'get' })
}
export function createFile(data: Partial<FileItem>): Promise<FileItem> {
  return request({ url: '/api/project/files', method: 'post', data })
}
export function deleteFile(id: string): Promise<null> {
  return request({ url: `/api/project/files/${id}`, method: 'delete' })
}
export function fetchScripts(): Promise<Script[]> {
  return request({ url: '/api/project/scripts', method: 'get' })
}
export function createScript(data: Partial<Script>): Promise<Script> {
  return request({ url: '/api/project/scripts', method: 'post', data })
}
export function updateScript(id: string, data: Partial<Script>): Promise<Script | null> {
  return request({ url: `/api/project/scripts/${id}`, method: 'put', data })
}
export function deleteScript(id: string): Promise<null> {
  return request({ url: `/api/project/scripts/${id}`, method: 'delete' })
}
