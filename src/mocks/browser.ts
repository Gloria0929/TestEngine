// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export async function bootstrapMock(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCK !== 'true') {
    console.warn('[MSW] mock 未启用，VITE_USE_MOCK=', import.meta.env.VITE_USE_MOCK)
    return
  }
  console.log('[MSW] 正在启动 mock worker...')
  const worker = setupWorker(...handlers)
  try {
    await worker.start({
      onUnhandledRequest(req) {
        const pathname = new URL(req.url).pathname
        if (pathname.startsWith('/api/')) {
          console.warn('[MSW] 未匹配到 handler:', req.method, pathname)
        }
      },
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    })
    console.log('[MSW] mock worker 启动成功，handler 数量：', handlers.length)
  } catch (e) {
    console.error('[MSW] mock worker 启动失败', e)
  }
}
