import { request } from '@/utils/request'
import type { PageQuery, PageResult } from '@/types'
import type {
  Project,
  PermissionNode,
  MessageConfig,
  OperationLog,
  FileItem,
} from '@/types/models'

export function fetchProjects(params: { orgId: string }): Promise<Project[]> {
  return request({ url: '/api/project/list', method: 'get', params })
}
export function createProject(data: Partial<Project>): Promise<Project> {
  return request({ url: '/api/project', method: 'post', data })
}
export function fetchPermissionTree(): Promise<PermissionNode[]> {
  return request({ url: '/api/project/permission-tree', method: 'get' })
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
export function fetchFiles(): Promise<FileItem[]> {
  return request({ url: '/api/project/files', method: 'get' })
}
export function createFile(data: Partial<FileItem>): Promise<FileItem> {
  return request({ url: '/api/project/files', method: 'post', data })
}
export function deleteFile(id: string): Promise<null> {
  return request({ url: `/api/project/files/${id}`, method: 'delete' })
}
