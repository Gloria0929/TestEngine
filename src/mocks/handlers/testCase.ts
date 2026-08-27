// src/mocks/handlers/testCase.ts
import { http, HttpResponse } from 'msw'
import { ok, page, fail } from '../utils'
import { createModules, createCases } from '../seed/testCase'
import type { PageQuery } from '@/types'
import type { TestCase } from '@/types/models'

let modules = createModules()
let cases = createCases()
let recycleBin: TestCase[] = []

export const testCaseHandlers = [
  http.get('/api/test-case/modules', () => HttpResponse.json(ok(modules))),
  http.post('/api/test-case/modules', async ({ request }) => {
    const body = await request.json() as { name: string; parentId?: string }
    const node = { id: 'm-' + Date.now(), name: body.name, children: [] }
    if (body.parentId) {
      const walk = (list: typeof modules) => list.forEach((m) => { if (m.id === body.parentId) m.children.push(node); else walk(m.children) })
      walk(modules)
    } else modules.push(node)
    return HttpResponse.json(ok(node))
  }),
  http.get('/api/test-case/list', ({ request }) => {
    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams) as unknown as PageQuery
    const moduleId = query.moduleId as string | undefined
    const level = query.level as string | undefined
    let list = cases
    if (moduleId) list = list.filter((c) => c.moduleId === moduleId)
    if (level) list = list.filter((c) => c.level === level)
    return HttpResponse.json(ok(page(list, query)))
  }),
  http.get('/api/test-case/recycle', () => HttpResponse.json(ok(recycleBin))),
  http.post('/api/test-case/recycle/:id/restore', ({ params }) => {
    const it = recycleBin.find((c) => c.id === params.id)
    if (it) { cases.unshift(it); recycleBin = recycleBin.filter((c) => c.id !== params.id) }
    return HttpResponse.json(ok(null))
  }),
  http.delete('/api/test-case/recycle/:id', ({ params }) => {
    recycleBin = recycleBin.filter((c) => c.id !== params.id)
    return HttpResponse.json(ok(null))
  }),
  http.get('/api/test-case/:id', ({ params }) => HttpResponse.json(ok(cases.find((c) => c.id === params.id) ?? null))),
  http.post('/api/test-case', async ({ request }) => {
    const body = await request.json() as TestCase
    const c = { ...body, id: 'c-' + Date.now(), updateTime: new Date().toISOString() }
    cases.unshift(c)
    return HttpResponse.json(ok(c))
  }),
  http.put('/api/test-case/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<TestCase>
    cases = cases.map((c) => (c.id === params.id ? { ...c, ...body, updateTime: new Date().toISOString() } : c))
    return HttpResponse.json(ok(cases.find((c) => c.id === params.id)))
  }),
  http.delete('/api/test-case/:id', ({ params }) => {
    const it = cases.find((c) => c.id === params.id)
    if (it) recycleBin.unshift(it)
    cases = cases.filter((c) => c.id !== params.id)
    return HttpResponse.json(ok(null))
  }),
]
