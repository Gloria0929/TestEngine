import { request } from '@/utils/request'
import type { PageQuery, PageResult } from '@/types'
import type {
  OperationLog,
} from '@/types/models'

export function fetchOperationLogs(query: PageQuery): Promise<PageResult<OperationLog>> {
  return request({ url: '/api/project/logs', method: 'get', params: query })
}
