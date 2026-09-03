// src/mocks/seed/bug.ts
import type { Bug } from '@/types/models'
export function createBugs(): Bug[] {
  return [
    { id: 'b-1', projectId: 'p-1', planId: 'tp-1', title: '登录页在 Safari 下样式错乱', severity: 'MAJOR', status: 'ASSIGNED', assignee: 'dev', reporter: 'test', description: 'Safari 14 下 flex 布局异常', createTime: '2026-08-26 10:00', moduleId: 'm-1-1' },
    { id: 'b-2', projectId: 'p-1', planId: 'tp-1', title: '订单支付超时未回调', severity: 'CRITICAL', status: 'FIXING', assignee: 'dev', reporter: 'test', description: '支付成功但回调丢失', createTime: '2026-08-25 15:00', moduleId: 'm-3' },
    { id: 'b-3', projectId: 'p-1', planId: 'tp-2', title: '用例导入模板缺少字段', severity: 'MINOR', status: 'NEW', assignee: '', reporter: 'Administrator', description: '缺少「标签」列', createTime: '2026-08-24 09:00', moduleId: 'm-1' },
  ]
}
