// src/mocks/handlers/project.ts
import { http, HttpResponse } from 'msw'
import { ok } from '../utils'
export const projectHandlers = [
  http.get('/api/project/list', () => HttpResponse.json(ok([{ id: 'p-1', orgId: '100001', name: '示例项目', description: '演示项目', createTime: '2026-08-01 10:00:00', members: 8, caseCount: 1284 }]))),
]
