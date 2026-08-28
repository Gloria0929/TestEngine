// src/mocks/seed/apiTest.ts
import type { DebugRequest, ApiDefinition, Scenario, MockRule } from '@/types/models'

export function createDebugRequests(): DebugRequest[] {
  return [
    { id: 'd-1', name: '获取用户信息', method: 'GET', url: 'http://demo.testengine.io/api/user/info', protocol: 'HTTP', headers: [{ key: 'Authorization', value: 'Bearer ${token}', enabled: true }], query: [], bodyType: 'none', body: '', authType: 'none', auth: {} },
    { id: 'd-2', name: '用户登录', method: 'POST', url: 'http://demo.testengine.io/api/auth/login', protocol: 'HTTP', headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }], query: [], bodyType: 'raw', body: '{"username":"admin","password":"123456"}', authType: 'none', auth: {} },
    { id: 'd-3', name: '创建订单', method: 'POST', url: 'http://demo.testengine.io/api/order/create', protocol: 'HTTP', headers: [], query: [], bodyType: 'form-data', body: '', authType: 'bearer', auth: { token: '${token}' } },
  ]
}

export function createApiDefinitions(): ApiDefinition[] {
  return [
    { id: 'a-1', projectId: 'p-1', moduleId: 'm-1', name: '获取用户信息', method: 'GET', path: '/api/user/info', protocol: 'HTTP', description: '返回当前登录用户信息' },
    { id: 'a-2', projectId: 'p-1', moduleId: 'm-1', name: '用户登录', method: 'POST', path: '/api/auth/login', protocol: 'HTTP', description: '账号密码登录' },
    { id: 'a-3', projectId: 'p-1', moduleId: 'm-2', name: '创建订单', method: 'POST', path: '/api/order/create', protocol: 'HTTP', description: '创建订单' },
    { id: 'a-4', projectId: 'p-1', moduleId: 'm-2', name: '订单查询', method: 'GET', path: '/api/order/list', protocol: 'HTTP', description: '分页查询订单' },
  ]
}

export function createScenarios(): Scenario[] {
  return [
    { id: 'sc-1', name: '登录态通用场景', moduleId: 'm-1', status: 'PASS', steps: [
      { id: 'st-1', name: '获取 Token', type: 'REQUEST', enabled: true, config: { ref: 'a-2' } },
      { id: 'st-2', name: '查询用户', type: 'REQUEST', enabled: true, config: { ref: 'a-1' } },
    ] },
    { id: 'sc-2', name: '订单全流程（含循环）', moduleId: 'm-2', status: 'FAIL', steps: [
      { id: 'st-1', name: '登录', type: 'REQUEST', enabled: true, config: { ref: 'a-2' } },
      { id: 'st-2', name: '循环下单', type: 'LOOP', enabled: true, config: { loopType: 'count', count: 3 }, children: [
        { id: 'st-2-1', name: '创建订单', type: 'REQUEST', enabled: true, config: { ref: 'a-3' } },
      ] },
      { id: 'st-3', name: '等待 1s', type: 'WAIT', enabled: true, config: { seconds: 1 } },
    ] },
  ]
}

export function createMockRules(): MockRule[] {
  return [
    { id: 'mk-1', name: '用户信息 Mock', definitionId: 'a-1', method: 'GET', path: '/api/user/info', match: [], responseStatus: 200, responseBody: '{"code":0,"data":{"id":1,"name":"mock-user"}}', delay: 0 },
  ]
}
