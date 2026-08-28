import { http, HttpResponse } from 'msw'
import { ok } from '../utils'
import type { SysUser, SysParam, Plugin, Organization, ProjectMember, UserGroup, Integration } from '@/types/models'
import { createSysUsers, createSysParams, createPlugins, createSysOrgs, createOrgMembers, createOrgGroups, createIntegrations } from '../seed/setting'

let sysUsers = createSysUsers()
let sysParams = createSysParams()
let plugins = createPlugins()
let sysOrgs = createSysOrgs()
let orgMembers = createOrgMembers()
let orgGroups = createOrgGroups()
let integrations = createIntegrations()

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
  http.get('/api/setting/org-members', () => HttpResponse.json(ok(orgMembers))),
  http.post('/api/setting/org-members', async ({ request }) => {
    const body = await request.json() as Partial<ProjectMember>
    const member: ProjectMember = {
      id: 'om-' + Date.now(),
      name: body.name ?? '',
      email: body.email ?? '',
      role: body.role ?? '组织成员',
      groupId: body.groupId ?? '',
    }
    orgMembers.push(member)
    return HttpResponse.json(ok(member))
  }),
  http.delete('/api/setting/org-members/:id', ({ params }) => {
    orgMembers = orgMembers.filter((m) => m.id !== params.id)
    return HttpResponse.json(ok(null))
  }),
  http.get('/api/setting/org-groups', () => HttpResponse.json(ok(orgGroups))),
  http.put('/api/setting/org-groups/:id/permissions', async ({ params, request }) => {
    const { permissions } = await request.json() as { permissions: string[] }
    orgGroups = orgGroups.map((g) => (g.id === params.id ? { ...g, permissions } : g))
    return HttpResponse.json(ok(null))
  }),
  http.get('/api/setting/integrations', () => HttpResponse.json(ok(integrations))),
  http.put('/api/setting/integrations/:id', async ({ params, request }) => {
    const body = await request.json() as { enabled: boolean }
    integrations = integrations.map((it) => (it.id === params.id ? { ...it, enabled: body.enabled } : it))
    return HttpResponse.json(ok(integrations.find((it) => it.id === params.id) ?? null))
  }),
]
