// src/mocks/seed/workstation.ts
import type { Notification, TrendPoint, TodoItem, FollowItem } from '@/types/models'

export const overviewStats = { caseCount: 1284, reviewCount: 36, apiCount: 208, scenarioCount: 42 }

export function createTrend(): TrendPoint[] {
  const dates = ['08-21', '08-22', '08-23', '08-24', '08-25', '08-26', '08-27']
  return dates.map((date, i) => ({
    date,
    cases: 1180 + i * 18,
    apis: 170 + i * 6,
  }))
}

export function createTodos(): TodoItem[] {
  return [
    { id: 'td-1', type: '计划', title: '测试计划「v2.6 回归」待执行', targetUrl: '/test-plan/list', dueTime: '2026-08-27 18:00' },
    { id: 'td-2', type: '评审', title: '用例评审「登录模块」待评审', targetUrl: '/test-case/review', dueTime: '2026-08-28 12:00' },
    { id: 'td-3', type: '缺陷', title: '缺陷 #BUG-1024 指派给你', targetUrl: '/bug/list', dueTime: '2026-08-27 09:00' },
  ]
}

export function createFollows(): FollowItem[] {
  return [
    { id: 'f-1', type: '用例', name: '登录-正确密码登录成功', owner: 'test', updateTime: '2026-08-26 14:00' },
    { id: 'f-2', type: '场景', name: '登录态通用场景', owner: 'Administrator', updateTime: '2026-08-25 10:00' },
    { id: 'f-3', type: '接口', name: 'GET /api/user/info', owner: 'dev', updateTime: '2026-08-24 16:30' },
  ]
}

export function createNotifications(): Notification[] {
  return [
    { id: 'n-1', type: 'bug', title: '缺陷指派', content: '缺陷 #BUG-1024 已指派给你', read: false, createTime: '2026-08-27 09:00', targetUrl: '/bug/list' },
    { id: 'n-2', type: 'plan', title: '计划完成', content: '测试计划「v2.5 回归」执行完成', read: false, createTime: '2026-08-26 20:00', targetUrl: '/test-plan/list' },
    { id: 'n-3', type: 'review', title: '评审通知', content: '你有一场用例评审待参与', read: true, createTime: '2026-08-25 11:00', targetUrl: '/test-case/review' },
  ]
}
