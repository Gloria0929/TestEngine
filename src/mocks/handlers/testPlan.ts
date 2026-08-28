// src/mocks/handlers/testPlan.ts
import { http, HttpResponse } from 'msw'
import { ok, page } from '../utils'
import { createPlans } from '../seed/testPlan'
import { createCases, createModules } from '../seed/testCase'
import type { PageQuery } from '@/types'
import type { TestPlan, PlanCaseResult, PlanReport, ModuleNode } from '@/types/models'

let plans = createPlans()
let planCases: Record<string, PlanCaseResult[]> = {}

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
  http.get('/api/test-plan/:id/cases', ({ params }) => {
    const result = planCases[params.id as string] ?? []
    return HttpResponse.json(ok(createCases().slice(0, 4).map((c) => ({ ...c, result: result.find((r) => r.caseId === c.id)?.result ?? null }))))
  }),
  http.post('/api/test-plan/:id/results', async ({ params, request }) => {
    const body = await request.json() as PlanCaseResult[]
    planCases[params.id as string] = body
    return HttpResponse.json(ok(null))
  }),
  http.get('/api/test-plan/:id/report', ({ params }) => {
    const planId = params.id as string
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return HttpResponse.json(ok(null))
    const resultMap = planCases[planId] ?? []
    const caseRows = createCases().slice(0, 4)
    const results: PlanReport['results'] = caseRows.map((c) => ({
      caseName: c.name,
      type: 'manual',
      result: resultMap.find((r) => r.caseId === c.id)?.result ?? 'SKIP',
    }))
    const total = results.length
    const passed = results.filter((r) => r.result === 'PASS').length
    const failed = results.filter((r) => r.result === 'FAIL').length
    const blocked = results.filter((r) => r.result === 'BLOCK').length
    const skipped = results.filter((r) => r.result === 'SKIP').length
    const moduleNameMap: Record<string, string> = {}
    const walk = (nodes: ModuleNode[]) => {
      for (const n of nodes) {
        moduleNameMap[n.id] = n.name
        walk(n.children)
      }
    }
    walk(createModules())
    const failCounts: Record<string, number> = {}
    for (const c of caseRows) {
      const r = resultMap.find((x) => x.caseId === c.id)?.result
      if (r === 'FAIL' || r === 'BLOCK') {
        const key = moduleNameMap[c.moduleId] ?? c.moduleId
        failCounts[key] = (failCounts[key] ?? 0) + 1
      }
    }
    const failDistribution = Object.entries(failCounts).map(([module, count]) => ({ module, count }))
    const report: PlanReport = {
      id: 'rp-' + planId,
      planId,
      name: plan.name ?? '',
      progress: plan.progress ?? 0,
      passRate: total ? Math.round((passed / total) * 100) : 0,
      total,
      passed,
      failed,
      blocked,
      skipped,
      failDistribution,
      results,
      shareUrl: '',
      expireAt: '',
    }
    return HttpResponse.json(ok(report))
  }),
  http.post('/api/test-plan/:id/report/export', ({ params }) => {
    return HttpResponse.json(ok({ url: '/reports/' + params.id + '.html' }))
  }),
  http.post('/api/test-plan/:id/report/share', ({ params }) => {
    return HttpResponse.json(ok({ shareUrl: 'https://mock.testengine.io/share/' + params.id, expireAt: '2026-09-03 23:59:59' }))
  }),
]
