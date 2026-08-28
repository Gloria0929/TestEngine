// src/mocks/handlers/bug.ts
import { http, HttpResponse } from 'msw'
import { ok, page } from '../utils'
import { createBugs } from '../seed/bug'
import type { PageQuery } from '@/types'
import type { Bug } from '@/types/models'

let bugs = createBugs()

export const bugHandlers = [
  http.get('/api/bug/list', ({ request }) => {
    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams) as unknown as PageQuery
    const status = query.status as string | undefined
    const severity = query.severity as string | undefined
    const assignee = query.assignee as string | undefined
    const moduleId = query.moduleId as string | undefined
    let list = bugs
    if (status) list = list.filter((b) => b.status === status)
    if (severity) list = list.filter((b) => b.severity === severity)
    if (assignee) list = list.filter((b) => b.assignee === assignee)
    if (moduleId) list = list.filter((b) => b.moduleId === moduleId)
    return HttpResponse.json(ok(page(list, query)))
  }),
  http.post('/api/bug', async ({ request }) => {
    const body = await request.json() as Bug
    const b = { ...body, id: 'b-' + Date.now() }
    bugs.unshift(b)
    return HttpResponse.json(ok(b))
  }),
  http.put('/api/bug/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Bug>
    bugs = bugs.map((b) => (b.id === params.id ? { ...b, ...body } : b))
    return HttpResponse.json(ok(bugs.find((b) => b.id === params.id) ?? null))
  }),
  http.delete('/api/bug/:id', ({ params }) => {
    bugs = bugs.filter((b) => b.id !== params.id)
    return HttpResponse.json(ok(null))
  }),
]
