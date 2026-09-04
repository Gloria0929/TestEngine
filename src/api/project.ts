import { request } from '@/utils/request'
import type { PageQuery, PageResult } from '@/types'
import type {
  OperationLog,
} from '@/types/models'

export function fetchOperationLogs(query: PageQuery): Promise<PageResult<OperationLog>> {
  return request({ url: '/api/project/logs', method: 'get', params: query })
}

/** 移动操作日志到目录 */
export function moveLog(id: string, folderId: string | undefined): Promise<null> {
  return request({ url: `/api/project/logs/${id}/folder`, method: 'put', data: { folderId } })
}
