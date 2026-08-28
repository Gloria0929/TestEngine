// src/mocks/handlers/apiTest.ts
import { http, HttpResponse } from 'msw'
import { ok } from '../utils'
import { createDebugRequests, createApiDefinitions, createScenarios, createMockRules } from '../seed/apiTest'
import type { DebugRequest, ExecuteResponse, ApiDefinition, KeyValue, HttpMethod, BodyType, Scenario, ApiReport, MockRule } from '@/types/models'

let debugRequests = createDebugRequests()
let definitions = createApiDefinitions()
let scenarios = createScenarios()
let reports: ApiReport[] = [
  { id: 'rp-1', name: '登录态通用场景', scenarioId: 'sc-1', status: 'PASS', duration: 812, createTime: '2026-08-27 08:00', steps: [
    { id: 'rs-1', name: '获取 Token', status: 'PASS', time: 210, request: 'POST /api/auth/login', response: '200 OK', assertion: 'status==200 通过', extract: 'token 已提取', console: ['> POST /api/auth/login', '< 200 OK'] },
    { id: 'rs-2', name: '查询用户', status: 'PASS', time: 340, request: 'GET /api/user/info', response: '200 OK', assertion: 'status==200 通过', extract: '', console: ['> GET /api/user/info', '< 200 OK'] },
  ] },
]
let mockRules = createMockRules()

function parseCurl(text: string): DebugRequest {
  // 朴素按空白分词，处理常见 curl：
  //   -X/--request 取 method（缺省 GET；存在 -d/--data/--data-raw 时缺省 POST）
  //   首个「不以 - 开头、且非前一 flag 取值」的 token 视为 URL
  //   -H/--header 'Key: Value' 追加到 headers（enabled=true）
  //   -d/--data/--data-raw 的值 → body，bodyType='raw'
  const tokens = text.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? []
  const strip = (s: string) => (s.length >= 2 && ((s[0] === '"' && s[s.length - 1] === '"') || (s[0] === "'" && s[s.length - 1] === "'")) ? s.slice(1, -1) : s)
  let method = ''
  let url = ''
  const headers: KeyValue[] = []
  let body = ''
  let bodyType: BodyType = 'none'
  let hasData = false
  let pendingFlag = ''
  let first = true
  for (const raw of tokens) {
    const t = strip(raw)
    if (first) { first = false; if (t.toLowerCase() === 'curl') continue }
    if (pendingFlag) {
      if (pendingFlag === 'header') {
        const idx = t.indexOf(':')
        headers.push({ key: idx >= 0 ? t.slice(0, idx) : t, value: idx >= 0 ? t.slice(idx + 1).trim() : '', enabled: true })
      } else if (pendingFlag === 'data') {
        body = t; bodyType = 'raw'; hasData = true
      } else if (pendingFlag === 'request') {
        method = t.toUpperCase()
      }
      pendingFlag = ''
      continue
    }
    if (t === '-H' || t === '--header') { pendingFlag = 'header'; continue }
    if (t === '-d' || t === '--data' || t === '--data-raw') { pendingFlag = 'data'; continue }
    if (t === '-X' || t === '--request') { pendingFlag = 'request'; continue }
    if (t.startsWith('-')) continue
    if (!url) url = t
  }
  return {
    id: '', name: '导入请求', method: (method || (hasData ? 'POST' : 'GET')) as HttpMethod, url, protocol: 'HTTP',
    headers, query: [], bodyType, body, authType: 'none', auth: {},
  }
}

export const apiTestHandlers = [
  http.get('/api/api-test/debug', () => HttpResponse.json(ok(debugRequests))),
  http.post('/api/api-test/debug', async ({ request }) => {
    const body = await request.json() as DebugRequest
    const r = { ...body, id: 'd-' + Date.now() }
    debugRequests.unshift(r)
    return HttpResponse.json(ok(r))
  }),
  http.post('/api/api-test/execute', async ({ request }) => {
    const req = await request.json() as DebugRequest
    await new Promise((r) => setTimeout(r, 250))
    const resp: ExecuteResponse = {
      status: 200,
      time: Math.floor(120 + Math.random() * 200),
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ code: 0, message: 'ok', data: { mock: true, method: req.method, url: req.url } }, null, 2),
      console: [`> ${req.method} ${req.url}`, '< 200 OK (mock)'],
    }
    return HttpResponse.json(ok(resp))
  }),
  http.get('/api/api-test/definitions', () => HttpResponse.json(ok(definitions))),
  http.post('/api/api-test/definitions', async ({ request }) => {
    const body = await request.json() as ApiDefinition
    const d = { ...body, id: 'a-' + Date.now() }
    definitions.unshift(d)
    return HttpResponse.json(ok(d))
  }),
  http.put('/api/api-test/definitions/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<ApiDefinition>
    definitions = definitions.map((d) => (d.id === params.id ? { ...d, ...body } : d))
    return HttpResponse.json(ok(definitions.find((d) => d.id === params.id)))
  }),
  http.delete('/api/api-test/definitions/:id', ({ params }) => {
    definitions = definitions.filter((d) => d.id !== params.id)
    return HttpResponse.json(ok(null))
  }),
  http.post('/api/api-test/import-definition', async ({ request }) => {
    const { text } = await request.json() as { text: string }
    const count = text.split('\n').filter((l) => l.trim()).length
    return HttpResponse.json(ok({ count }))
  }),
  http.post('/api/api-test/import-curl', async ({ request }) => {
    const { text } = await request.json() as { text: string }
    return HttpResponse.json(ok(parseCurl(text)))
  }),
  http.get('/api/api-test/scenarios', () => HttpResponse.json(ok(scenarios))),
  http.post('/api/api-test/scenarios', async ({ request }) => {
    const body = await request.json() as Scenario
    const i = scenarios.findIndex((x) => x.id === body.id)
    if (i >= 0) {
      scenarios[i] = { ...body }
      return HttpResponse.json(ok(scenarios[i]))
    }
    const s = { ...body, id: 'sc-' + Date.now() }
    scenarios.unshift(s)
    return HttpResponse.json(ok(s))
  }),
  http.delete('/api/api-test/scenarios/:id', ({ params }) => {
    scenarios = scenarios.filter((x) => x.id !== params.id)
    return HttpResponse.json(ok(null))
  }),
  http.post('/api/api-test/scenarios/:id/execute', async ({ params }) => {
    await new Promise((r) => setTimeout(r, 400))
    const s = scenarios.find((x) => x.id === params.id)
    return HttpResponse.json(ok({ scenarioId: params.id, status: s?.status === 'FAIL' ? 'FAIL' : 'PASS', duration: 1234, steps: s?.steps ?? [] }))
  }),
  http.get('/api/api-test/reports', () => HttpResponse.json(ok(reports))),
  http.get('/api/api-test/reports/:id', ({ params }) => HttpResponse.json(ok(reports.find((r) => r.id === params.id) ?? null))),
  http.get('/api/api-test/mock', () => HttpResponse.json(ok(mockRules))),
  http.post('/api/api-test/mock', async ({ request }) => {
    const body = await request.json() as MockRule
    const r = { ...body, id: 'mk-' + Date.now() }
    mockRules.unshift(r)
    return HttpResponse.json(ok(r))
  }),
  http.put('/api/api-test/mock/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<MockRule>
    mockRules = mockRules.map((r) => (r.id === params.id ? { ...r, ...body } : r))
    return HttpResponse.json(ok(mockRules.find((r) => r.id === params.id)))
  }),
  http.delete('/api/api-test/mock/:id', ({ params }) => {
    mockRules = mockRules.filter((r) => r.id !== params.id)
    return HttpResponse.json(ok(null))
  }),
]
