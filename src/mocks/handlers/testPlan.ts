// src/mocks/handlers/testPlan.ts
import { http, HttpResponse } from 'msw'
import { ok, page } from '../utils'
import { createPlans } from '../seed/testPlan'
import type { PageQuery } from '@/types'
import type { TestPlan } from '@/types/models'

let plans = createPlans()

export const testPlanHandlers = [
  http.get('/api/test-plan/list', ({ request }) => {
    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams) as unknown as PageQuery
    return HttpResponse.json(ok(page(plans, query)))
  }),
  http.post('/api/test-plan', async ({ request }) => {
    const body = await request.json() as TestPlan
    const p = { ...body, id: 'tp-' + Date.now() }
    plans.unshift(p); return HttpResponse.json(ok(p))
  }),
  http.put('/api/test-plan/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<TestPlan>
    plans = plans.map((p) => (p.id === params.id ? { ...p, ...body } : p))
    return HttpResponse.json(ok(null))
  }),
  http.delete('/api/test-plan/:id', ({ params }) => { plans = plans.filter((p) => p.id !== params.id); return HttpResponse.json(ok(null)) }),
  http.post('/api/test-plan/:id/copy', ({ params }) => {
    const src = plans.find((p) => p.id === params.id)
    if (!src) return HttpResponse.json(ok(null))
    const cp = { ...src, id: 'tp-' + Date.now(), name: src.name + '（副本）' }
    plans.unshift(cp); return HttpResponse.json(ok(cp))
  }),
]
