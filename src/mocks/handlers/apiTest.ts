// src/mocks/handlers/apiTest.ts
import { http, HttpResponse } from 'msw'
import { ok } from '../utils'
import { createDebugRequests, createApiDefinitions } from '../seed/apiTest'
import type { DebugRequest, ExecuteResponse, ApiDefinition, KeyValue, HttpMethod, BodyType } from '@/types/models'

let debugRequests = createDebugRequests()
let definitions = createApiDefinitions()

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
  http.post('/api/api-test/import-curl', async ({ request }) => {
    const { text } = await request.json() as { text: string }
    return HttpResponse.json(ok(parseCurl(text)))
  }),
]
