// src/mocks/handlers/workstation.ts
import { http, HttpResponse } from 'msw'
import { ok } from '../utils'
import { overviewStats, createTrend, createTodos, createFollows, createNotifications } from '../seed/workstation'

let notifications = createNotifications()

export const workstationHandlers = [
  http.get('/api/workstation/overview', () => HttpResponse.json(ok(overviewStats))),
  http.get('/api/workstation/trend', () => HttpResponse.json(ok(createTrend()))),
  http.get('/api/workstation/todos', () => HttpResponse.json(ok(createTodos()))),
  http.get('/api/workstation/follows', () => HttpResponse.json(ok(createFollows()))),
  http.get('/api/workstation/notifications', () => HttpResponse.json(ok(notifications))),
  http.post('/api/workstation/notifications/:id/read', ({ params }) => {
    notifications = notifications.map((n) => (n.id === params.id ? { ...n, read: true } : n))
    return HttpResponse.json(ok(null))
  }),
  http.post('/api/workstation/notifications/read-all', () => {
    notifications = notifications.map((n) => ({ ...n, read: true }))
    return HttpResponse.json(ok(null))
  }),
]
