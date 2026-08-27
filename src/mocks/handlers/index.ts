// src/mocks/handlers/index.ts
import { authHandlers } from './auth'
import { workstationHandlers } from './workstation'
import { projectHandlers } from './project'
export const handlers = [...authHandlers, ...workstationHandlers, ...projectHandlers]
