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
    let filtered = plans
    const status = query.status as string | undefined
    const group = query.group as string | undefined
    if (status) filtered = filtered.filter((p) => p.status === status)
    if (group && group !== '全部') filtered = filtered.filter((p) => p.group === group)
    return HttpResponse.json(ok(page(filtered, query)))
  }),
  http.post('/api/test-plan', async ({ request }) => {
    const body = await request.json() as TestPlan
    const p = { ...body, id: 'tp-' + Date.now() }
    plans.unshift(p)
    return HttpResponse.json(ok(p))
  }),
  http.put('/api/test-plan/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<TestPlan>
    plans = plans.map((p) => (p.id === params.id ? { ...p, ...body } : p))
    return HttpResponse.json(ok(null))
  }),
  http.delete('/api/test-plan/:id', ({ params }) => {
    plans = plans.filter((p) => p.id !== params.id)
    return HttpResponse.json(ok(null))
  }),
  http.post('/api/test-plan/:id/copy', ({ params }) => {
    const src = plans.find((p) => p.id === params.id)
    if (!src) return HttpResponse.json(ok(null))
    const cp = { ...src, id: 'tp-' + Date.now(), name: src.name + '（副本）' }
    plans.unshift(cp)
    return HttpResponse.json(ok(cp))
  }),
  http.get('/api/test-plan/:id/cases', ({ request, params }) => {
    const url = new URL(request.url)
    const moduleId = url.searchParams.get('moduleId')
    const testPoint = url.searchParams.get('testPoint')
    const keyword = url.searchParams.get('keyword')?.toLowerCase()
    let cases = createCases()
    const collectIds = (nodes: ModuleNode[]): string[] => nodes.flatMap((n) => [n.id, ...collectIds(n.children)])
    const matchModule = (nodes: ModuleNode[]): string[] => {
      for (const n of nodes) {
        if (n.id === moduleId) return [n.id, ...collectIds(n.children)]
        const child = matchModule(n.children)
        if (child.length) return child
      }
      return []
    }
    if (moduleId) {
      const ids = matchModule(createModules())
      cases = cases.filter((c) => ids.includes(c.moduleId))
    }
    if (testPoint) {
      cases = cases.filter((c) => c.testPoint === testPoint)
    }
    if (keyword) {
      cases = cases.filter((c) => c.name.toLowerCase().includes(keyword) || c.id.toLowerCase().includes(keyword))
    }
    const result = planCases[params.id as string] ?? []
    return HttpResponse.json(ok(cases.map((c) => ({ ...c, result: result.find((r) => r.caseId === c.id)?.result ?? null }))))
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
      caseId: c.id,
      caseName: c.name,
      testPoint: c.testPoint,
      level: c.level,
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
