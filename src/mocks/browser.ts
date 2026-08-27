// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export async function bootstrapMock(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return
  const worker = setupWorker(...handlers)
  await worker.start({ onUnhandledRequest: 'bypass' })
}
