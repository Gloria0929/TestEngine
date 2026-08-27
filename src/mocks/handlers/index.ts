// src/mocks/handlers/index.ts
import { authHandlers } from './auth'
import { projectHandlers } from './project'
export const handlers = [...authHandlers, ...projectHandlers]
