// src/mocks/seed/testPlan.ts
import type { TestPlan } from '@/types/models'

export function createPlans(): TestPlan[] {
  return [
    { id: 'tp-1', projectId: 'p-1', name: 'v2.6 回归', status: 'RUNNING', owner: 'test', startTime: '2026-08-25', endTime: '2026-08-28', progress: 62 },
    { id: 'tp-2', projectId: 'p-1', name: 'v2.5 回归', status: 'DONE', owner: 'Administrator', startTime: '2026-08-18', endTime: '2026-08-22', progress: 100 },
  ]
}
