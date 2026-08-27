// src/mocks/seed/apiTest.ts
import type { DebugRequest, ApiDefinition } from '@/types/models'

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
