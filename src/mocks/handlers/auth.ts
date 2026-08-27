// src/mocks/handlers/auth.ts
import { http, HttpResponse } from 'msw'
import { ok, fail } from '../utils'
import { users, toPublicUser } from '../seed/user'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = await request.json() as { username: string; password: string }
    const u = users.find((it) => it.username === username && it.password === password)
    if (!u) return HttpResponse.json(fail(1001, '用户名或密码错误'))
    return HttpResponse.json(ok({ token: `mock-token-${u.id}`, user: toPublicUser(u), permissions: u.permissions }))
  }),
  http.post('/api/auth/logout', () => HttpResponse.json(ok(null))),
]
