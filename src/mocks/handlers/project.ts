import { http, HttpResponse } from 'msw'
import { ok } from '../utils'
import type { Project, ProjectMember } from '@/types/models'
import { createProjects, createMembers, createGroups, createPermissionTree } from '../seed/project'

let projects = createProjects()
let members = createMembers()
let groups = createGroups()

export const projectHandlers = [
  http.get('/api/project/list', () => HttpResponse.json(ok(projects))),
  http.get('/api/project/groups', () => HttpResponse.json(ok(groups))),
  http.get('/api/project/permission-tree', () => HttpResponse.json(ok(createPermissionTree()))),
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
