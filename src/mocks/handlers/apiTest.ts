// src/mocks/handlers/apiTest.ts
import { http, HttpResponse } from 'msw'
import { ok } from '../utils'
import { createDebugRequests, createApiDefinitions, createScenarios, createApiReports } from '../seed/apiTest'
import type { DebugRequest, ExecuteResponse, ApiDefinition, KeyValue, HttpMethod, BodyType, Scenario } from '@/types/models'

let debugRequests = createDebugRequests()
let definitions = createApiDefinitions()
let scenarios = createScenarios()
let scenarioRecycle: Scenario[] = []
let reports = createApiReports()

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
    if (first) {
      first = false
      if (t.toLowerCase() === 'curl') continue
    }
    if (pendingFlag) {
      if (pendingFlag === 'header') {
        const idx = t.indexOf(':')
        headers.push({ key: idx >= 0 ? t.slice(0, idx) : t, value: idx >= 0 ? t.slice(idx + 1).trim() : '', enabled: true })
      } else if (pendingFlag === 'data') {
        body = t
        bodyType = 'raw'
        hasData = true
      } else if (pendingFlag === 'request') {
        method = t.toUpperCase()
      }
      pendingFlag = ''
      continue
    }
    if (t === '-H' || t === '--header') {
      pendingFlag = 'header'
      continue
    }
    if (t === '-d' || t === '--data' || t === '--data-raw') {
      pendingFlag = 'data'
      continue
    }
    if (t === '-X' || t === '--request') {
      pendingFlag = 'request'
      continue
    }
    if (t.startsWith('-')) continue
    if (!url) url = t
  }
  return {
    id: '', name: '导入请求', method: (method || (hasData ? 'POST' : 'GET')) as HttpMethod, url, protocol: 'HTTP',
    headers, query: [], bodyType, body, bodyParams: [], authType: 'none', auth: {},
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
      body: JSON.stringify({
        code: 0,
        message: 'ok',
        data: {
          mock: true,
          method: req.method,
          url: req.url,
          bodyType: req.bodyType,
          body: req.bodyType === 'raw' ? req.body : req.bodyParams,
          headers: req.headers,
          auth: req.auth,
        },
      }, null, 2),
      console: [`> ${req.method} ${req.url}`, '< 200 OK (mock 回显)'],
    }
    return HttpResponse.json(ok(resp))
  }),
  http.get('/api/api-test/definitions', ({ request }) => {
    const url = new URL(request.url)
    const pageNum = url.searchParams.get('pageNum')
    // 无分页参数：返回全量数组（场景/Mock 页面复用）
    if (!pageNum) return HttpResponse.json(ok(definitions))
    // 分页 + 过滤：返回 { list, total }（接口定义列表页）
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const keyword = (url.searchParams.get('keyword') || '').toLowerCase()
    const method = url.searchParams.get('method') || ''
    const status = url.searchParams.get('status') || ''
    let list = definitions.filter((d) => {
      if (method && d.method !== method) return false
      if (status && d.status !== status) return false
      if (keyword && !`${d.name} ${d.path} ${d.id}`.toLowerCase().includes(keyword)) return false
      return true
    })
    const total = list.length
    const start = (Number(pageNum) - 1) * pageSize
    list = list.slice(start, start + pageSize)
    return HttpResponse.json(ok({ list, total }))
  }),
  http.post('/api/api-test/definitions', async ({ request }) => {
    const body = await request.json() as ApiDefinition
    const d = { ...body, id: 'API-' + Date.now() }
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
  http.get('/api/api-test/scenarios', ({ request }) => {
    const url = new URL(request.url)
    const pageNum = url.searchParams.get('pageNum')
    if (!pageNum) return HttpResponse.json(ok(scenarios))
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const keyword = (url.searchParams.get('keyword') || '').toLowerCase()
    const status = url.searchParams.get('status') || ''
    let list = scenarios.filter((d) => {
      if (status && d.status !== status) return false
      if (keyword && !`${d.name} ${d.id}`.toLowerCase().includes(keyword)) return false
      return true
    })
    const total = list.length
    const start = (Number(pageNum) - 1) * pageSize
    list = list.slice(start, start + pageSize)
    return HttpResponse.json(ok({ list, total }))
  }),
  http.post('/api/api-test/scenarios', async ({ request }) => {
    const body = await request.json() as Scenario
    const s = { ...body, id: 'SCEN-' + Date.now() }
    scenarios.unshift(s)
    return HttpResponse.json(ok(s))
  }),
  http.put('/api/api-test/scenarios/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Scenario>
    scenarios = scenarios.map((s) => (s.id === params.id ? { ...s, ...body } : s))
    return HttpResponse.json(ok(scenarios.find((s) => s.id === params.id)))
  }),
  http.delete('/api/api-test/scenarios/:id', ({ params }) => {
    const target = scenarios.find((x) => x.id === params.id)
    if (target) {
      scenarioRecycle.unshift(target)
      scenarios = scenarios.filter((x) => x.id !== params.id)
    }
    return HttpResponse.json(ok(null))
  }),
  http.get('/api/api-test/scenarios/recycle', () => HttpResponse.json(ok(scenarioRecycle))),
  http.post('/api/api-test/scenarios/recycle/:id/restore', ({ params }) => {
    const target = scenarioRecycle.find((x) => x.id === params.id)
    if (target) {
      scenarioRecycle = scenarioRecycle.filter((x) => x.id !== params.id)
      scenarios.unshift(target)
    }
    return HttpResponse.json(ok(null))
  }),
  http.delete('/api/api-test/scenarios/recycle/:id', ({ params }) => {
    scenarioRecycle = scenarioRecycle.filter((x) => x.id !== params.id)
    return HttpResponse.json(ok(null))
  }),
  http.post('/api/api-test/scenarios/:id/execute', async ({ params }) => {
    await new Promise((r) => setTimeout(r, 400))
    const s = scenarios.find((x) => x.id === params.id)
    const pass = s?.status !== '失败' && s?.status !== '执行中'
    return HttpResponse.json(ok({ result: pass ? 'SUCCESS' : 'FAIL', passRate: pass ? Math.floor(80 + Math.random() * 20) : Math.floor(20 + Math.random() * 50) }))
  }),
  http.get('/api/api-test/reports', ({ request }) => {
    const url = new URL(request.url)
    const pageNum = Number(url.searchParams.get('pageNum')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const keyword = (url.searchParams.get('keyword') || '').toLowerCase()
    const type = url.searchParams.get('type') || ''
    let list = reports.filter((r) => {
      if (type && r.type !== type) return false
      if (keyword && !`${r.name} ${r.id}`.toLowerCase().includes(keyword)) return false
      return true
    })
    const total = list.length
    const start = (pageNum - 1) * pageSize
    list = list.slice(start, start + pageSize)
    return HttpResponse.json(ok({ list, total }))
  }),
  http.get('/api/api-test/reports/:id', ({ params }) => {
    const item = reports.find((r) => r.id === params.id)
    if (!item) return HttpResponse.json(ok(null))
    const definitions = createApiDefinitions()
    const steps = []
    for (let k = 0; k < item.total; k++) {
      const def = definitions[(k * 7) % definitions.length]
      steps.push({
        name: def ? def.name : '接口步骤 ' + (k + 1),
        method: def ? def.method : 'GET',
        path: def ? def.path : '/api/v1/step/' + (k + 1),
        result: k < item.success ? '成功' : '失败',
        time: 30 + ((k * 37) % 220),
      })
    }
    return HttpResponse.json(ok({ ...item, steps }))
  }),
  http.delete('/api/api-test/reports/:id', ({ params }) => {
    reports = reports.filter((r) => r.id !== params.id)
    return HttpResponse.json(ok(null))
  }),
]
