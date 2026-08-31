// src/mocks/seed/testPlan.ts
import type { TestPlan } from '@/types/models'

export function createPlans(): TestPlan[] {
  return [
    { id: 'tp-1', projectId: 'p-1', name: '一期测试计划', status: 'DRAFT', owner: 'Administrator', startTime: '2026-08-25', endTime: '2026-08-28', progress: 0, passRate: 0, group: '第一期' },
    { id: 'tp-2', projectId: 'p-1', name: 'v2.5 版本回归测试', status: 'DONE', owner: 'Administrator', startTime: '2026-08-18', endTime: '2026-08-22', progress: 100, passRate: 92, group: '第一期' },
    { id: 'tp-3', projectId: 'p-1', name: '登录模块冒烟测试', status: 'DONE', owner: 'test', startTime: '2026-08-10', endTime: '2026-08-11', progress: 100, passRate: 100, group: '未规划计划' },
    { id: 'tp-4', projectId: 'p-1', name: '支付流程专项测试', status: 'RUNNING', owner: 'dev-lee', startTime: '2026-08-26', endTime: '2026-08-30', progress: 35, passRate: 55, group: '第一期' },
    { id: 'tp-5', projectId: 'p-1', name: '性能压测计划', status: 'DRAFT', owner: 'Administrator', startTime: '2026-09-01', endTime: '2026-09-05', progress: 0, passRate: 0, group: '未规划计划' },
    { id: 'tp-6', projectId: 'p-1', name: '接口自动化回归', status: 'RUNNING', owner: 'qa-zhang', startTime: '2026-08-24', endTime: '2026-08-29', progress: 80, passRate: 88, group: '第一期' },
  ]
}
