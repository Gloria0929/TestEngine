import { http, HttpResponse } from 'msw'
import { ok, page } from '../utils'
import type { Project, ProjectMember, Environment, MessageConfig, OperationLog, FileItem, ProjectTemplate, Script } from '@/types/models'
import type { PageQuery } from '@/types'
import {
  createProjects,
  createMembers,
  createGroups,
  createPermissionTree,
  createEnvironments,
  createLogs,
  createMessageConfigs,
  createTemplates,
  createFiles,
  createScripts,
} from '../seed/project'

let projects = createProjects()
let members = createMembers()
let groups = createGroups()
let environments = createEnvironments()
let logs = createLogs()
let messageConfigs = createMessageConfigs()
let templates = createTemplates()
let files = createFiles()
let scripts = createScripts()

export const projectHandlers = [
  http.get('/api/project/list', () => HttpResponse.json(ok(projects))),
  http.post('/api/project', async ({ request }) => {
    const body = await request.json() as Partial<Project>
    const project: Project = {
      id: 'p-' + Date.now(),
      orgId: body.orgId ?? '100001',
      name: body.name ?? '',
      description: body.description ?? '',
      createTime: body.createTime ?? '',
      members: body.members ?? 0,
      caseCount: body.caseCount ?? 0,
    }
    projects.push(project)
    return HttpResponse.json(ok(project))
  }),
  http.get('/api/project/groups', () => HttpResponse.json(ok(groups))),
  http.get('/api/project/permission-tree', () => HttpResponse.json(ok(createPermissionTree()))),

  // 环境
  http.get('/api/project/environments', () => HttpResponse.json(ok(environments))),
  http.post('/api/project/environments', async ({ request }) => {
    const body = await request.json() as Partial<Environment>
    const env: Environment = {
      id: 'env-' + Date.now(),
      projectId: body.projectId ?? 'p-1',
      name: body.name ?? '',
      domain: body.domain ?? '',
      variables: body.variables ?? [],
      hosts: body.hosts ?? [],
      headers: body.headers ?? [],
    }
    environments.push(env)
    return HttpResponse.json(ok(env))
  }),
  http.put('/api/project/environments/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Environment>
    environments = environments.map((e) => (e.id === params.id ? { ...e, ...body } : e))
    return HttpResponse.json(ok(environments.find((e) => e.id === params.id) ?? null))
  }),
  http.delete('/api/project/environments/:id', ({ params }) => {
    environments = environments.filter((e) => e.id !== params.id)
    return HttpResponse.json(ok(null))
  }),

  // 消息
  http.get('/api/project/messages', () => HttpResponse.json(ok(messageConfigs))),
  http.put('/api/project/messages/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<MessageConfig>
    messageConfigs = messageConfigs.map((m) => (m.id === params.id ? { ...m, ...body } : m))
    return HttpResponse.json(ok(messageConfigs.find((m) => m.id === params.id) ?? null))
  }),

  // 日志
  http.get('/api/project/logs', ({ request }) => {
    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams) as unknown as PageQuery
    const scope = query.scope as string | undefined
    const object = query.object as string | undefined
    const time = query.time as string | undefined
    let list = logs
    if (scope) list = list.filter((l) => l.scope === scope)
    if (object) list = list.filter((l) => l.object.includes(object))
    if (time) list = list.filter((l) => l.time.includes(time))
    return HttpResponse.json(ok(page(list, query)))
  }),

  // 模板
  http.get('/api/project/templates', () => HttpResponse.json(ok(templates))),
  http.post('/api/project/templates', async ({ request }) => {
    const body = await request.json() as Partial<ProjectTemplate>
    const tpl: ProjectTemplate = {
      id: 'tpl-' + Date.now(),
      name: body.name ?? '',
      kind: body.kind ?? '用例',
      fields: body.fields ?? [],
    }
    templates.push(tpl)
    return HttpResponse.json(ok(tpl))
  }),
  http.put('/api/project/templates/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<ProjectTemplate>
    templates = templates.map((t) => (t.id === params.id ? { ...t, ...body } : t))
    return HttpResponse.json(ok(templates.find((t) => t.id === params.id) ?? null))
  }),
  http.delete('/api/project/templates/:id', ({ params }) => {
    templates = templates.filter((t) => t.id !== params.id)
    return HttpResponse.json(ok(null))
  }),

  // 文件
  http.get('/api/project/files', () => HttpResponse.json(ok(files))),
  http.post('/api/project/files', async ({ request }) => {
    const body = await request.json() as Partial<FileItem>
    const file: FileItem = {
      id: 'file-' + Date.now(),
      name: body.name ?? '',
      type: body.type ?? '',
      size: body.size ?? 0,
      repo: body.repo ?? '',
      time: body.time ?? '',
    }
    files.unshift(file)
    return HttpResponse.json(ok(file))
  }),
  http.delete('/api/project/files/:id', ({ params }) => {
    files = files.filter((f) => f.id !== params.id)
    return HttpResponse.json(ok(null))
  }),

  // 脚本
  http.get('/api/project/scripts', () => HttpResponse.json(ok(scripts))),
  http.post('/api/project/scripts', async ({ request }) => {
    const body = await request.json() as Partial<Script>
    const script: Script = {
      id: 'script-' + Date.now(),
      name: body.name ?? '',
      content: body.content ?? '',
      updateTime: body.updateTime ?? '',
    }
    scripts.unshift(script)
    return HttpResponse.json(ok(script))
  }),
  http.put('/api/project/scripts/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Script>
    scripts = scripts.map((s) => (s.id === params.id ? { ...s, ...body } : s))
    return HttpResponse.json(ok(scripts.find((s) => s.id === params.id) ?? null))
  }),
  http.delete('/api/project/scripts/:id', ({ params }) => {
    scripts = scripts.filter((s) => s.id !== params.id)
    return HttpResponse.json(ok(null))
  }),

  http.get('/api/project/:id', ({ params }) => HttpResponse.json(ok(projects.find((p) => p.id === params.id) ?? null))),
  http.put('/api/project/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Project>
    projects = projects.map((p) => (p.id === params.id ? { ...p, ...body } : p))
    return HttpResponse.json(ok(null))
  }),
  http.get('/api/project/:id/members', () => HttpResponse.json(ok(members))),
  http.post('/api/project/:id/members', async ({ request }) => {
    const body = await request.json() as ProjectMember
    members.push({ ...body, id: 'u-' + Date.now() })
    return HttpResponse.json(ok(null))
  }),
  http.delete('/api/project/:id/members/:memberId', ({ params }) => {
    members = members.filter((m) => m.id !== params.memberId)
    return HttpResponse.json(ok(null))
  }),
  http.put('/api/project/groups/:id/permissions', async ({ params, request }) => {
    const { permissions } = await request.json() as { permissions: string[] }
    groups = groups.map((g) => (g.id === params.id ? { ...g, permissions } : g))
    return HttpResponse.json(ok(null))
  }),
]
