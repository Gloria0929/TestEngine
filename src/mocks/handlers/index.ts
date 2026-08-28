// src/mocks/handlers/index.ts
import { authHandlers } from './auth'
import { workstationHandlers } from './workstation'
import { projectHandlers } from './project'
import { testCaseHandlers } from './testCase'
import { apiTestHandlers } from './apiTest'
import { testPlanHandlers } from './testPlan'
import { bugHandlers } from './bug'
export const handlers = [...authHandlers, ...workstationHandlers, ...projectHandlers, ...testCaseHandlers, ...apiTestHandlers, ...testPlanHandlers, ...bugHandlers]
