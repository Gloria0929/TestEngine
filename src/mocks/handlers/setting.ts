import { http, HttpResponse } from 'msw'
import { ok } from '../utils'
import type { SysUser, SysParam, Plugin, Organization } from '@/types/models'
import { createSysUsers, createSysParams, createPlugins, createSysOrgs } from '../seed/setting'

let sysUsers = createSysUsers()
let sysParams = createSysParams()
let plugins = createPlugins()
let sysOrgs = createSysOrgs()

export const settingHandlers = [
  http.get('/api/setting/users', () => HttpResponse.json(ok(sysUsers))),
  http.post('/api/setting/users', async ({ request }) => {
    const body = await request.json() as Partial<SysUser>
    const user: SysUser = {
      id: 'u-' + Date.now(),
      username: body.username ?? '',
      name: body.name ?? '',
      email: body.email ?? '',
      role: body.role ?? '系统成员',
      enabled: body.enabled ?? true,
    }
    sysUsers.push(user)
    return HttpResponse.json(ok(user))
  }),
  http.put('/api/setting/users/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<SysUser>
    sysUsers = sysUsers.map((u) => (u.id === params.id ? { ...u, ...body } : u))
    return HttpResponse.json(ok(sysUsers.find((u) => u.id === params.id) ?? null))
  }),
  http.post('/api/setting/users/:id/reset', () => HttpResponse.json(ok(null))),
  http.get('/api/setting/params', () => HttpResponse.json(ok(sysParams))),
  http.post('/api/setting/params', async ({ request }) => {
    const body = await request.json() as Partial<SysParam>
    const param: SysParam = {
      id: 'p-' + Date.now(),
      key: body.key ?? '',
      value: body.value ?? '',
      description: body.description ?? '',
    }
    sysParams.push(param)
    return HttpResponse.json(ok(param))
  }),
  http.put('/api/setting/params/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<SysParam>
    sysParams = sysParams.map((p) => (p.id === params.id ? { ...p, ...body } : p))
    return HttpResponse.json(ok(sysParams.find((p) => p.id === params.id) ?? null))
  }),
  http.get('/api/setting/plugins', () => HttpResponse.json(ok(plugins))),
  http.put('/api/setting/plugins/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Plugin>
    plugins = plugins.map((p) => (p.id === params.id ? { ...p, ...body } : p))
    return HttpResponse.json(ok(plugins.find((p) => p.id === params.id) ?? null))
  }),
  http.get('/api/setting/orgs', () => HttpResponse.json(ok(sysOrgs))),
  http.post('/api/setting/orgs', async ({ request }) => {
    const body = await request.json() as Partial<Organization>
    const org: Organization = {
      id: 'org-' + Date.now(),
      name: body.name ?? '',
      description: body.description ?? '',
    }
    sysOrgs.push(org)
    return HttpResponse.json(ok(org))
  }),
]
