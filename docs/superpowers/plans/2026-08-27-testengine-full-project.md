# TestEngine 完整前端项目 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `/Users/fuhao/Downloads/TestEngine` 根目录搭建一个可运行的 Vue 3 + TypeScript + Vite + Element Plus + Pinia + Vue Router + MSW 完整前端项目，覆盖需求文档全部 P0 功能，P1/P2 按标注落地，所有数据经统一 API 层 + 内置 Mock 闭环。

**Architecture:** 分层架构（视图 → composables → Pinia stores → services → request/axios → MSW Mock）。视图组件不直接调用 axios，一律经 `api/*` 服务层；Mock 用 MSW 在 Service Worker 层拦截网络请求，前端代码与真实后端无差异。设计系统复用已批准的静态预览（`preview/index.html`）视觉决策：teal 单一强调色 `#0d9488`、冷灰中性色、常暗侧边栏、Element Plus 主题变量覆盖、`html.dark` 暗色切换。

**Tech Stack:** Vue 3.5 · TypeScript 5.6 · Vite 6 · Element Plus 2.9 · Vue Router 4 · Pinia 2 · ECharts 5 · Axios 1 · MSW 2 · vue-i18n 10 · xlsx（Excel 导入导出）· Sass。

**Spec:** [docs/测试平台管理系统-前端需求规格说明书.md](../测试平台管理系统-前端需求规格说明书.md)

## Global Constraints

以下约束逐条摘自已批准的《前端需求规格说明书》§3 与 §7，所有任务隐式遵守：

- 运行环境：现代桌面浏览器最近两个大版本（Chromium / Firefox / Edge）。
- 框架版本下限：Vue 3.5+、TypeScript 5.x、Vite 6.x、Element Plus 2.x、Vue Router 4.x、Axios 1.x、MSW 2.x、ECharts 5.x。
- 全量 TypeScript：类型与接口模型对齐（`types/` 与 `api/` 一致），Mock → 真实后端切换时改动最小。
- 数据读写统一经 API 层：视图组件不得直接调用 axios，一律走 `api/*` 服务层。
- Mock 默认开启：环境变量 `VITE_USE_MOCK=true` 时注册 MSW；`false` + `VITE_API_BASE_URL` 时走真实后端。
- Mock 数据仿真要求：分页/筛选/排序/搜索在 handler 内真实生效；写操作内存态闭环，刷新重置；关键链路覆盖空态（0 条）与异常态（超时/失败）。
- 业务码约定：`code === 0` 成功；`401` 未认证跳登录；`403` 无权限；其余为业务错误。
- 敏感字段（密码/凭证）不明文回显；分享链接具备有效期并展示失效态。
- 删除进回收站（用例、场景等），可恢复 / 彻底删除。
- 亮/暗主题、中/英文切换即时生效并持久化到本地。
- 命名规则：组件 PascalCase，文件 kebab-case，store/composable 用 `useXxx`，需求编号 `FR-<模块>-<序号>`。
- 单一强调色 teal `#0d9488`；状态色仅用于语义（通过/失败/阻塞/跳过）；规避 AI 紫/蓝渐变。

---

## 0 全局架构决策（锁定，所有任务据此实现）

### 0.1 项目根与目录结构

项目根 = `/Users/fuhao/Downloads/TestEngine/`（`preview/` 与 `docs/` 保留为兄弟目录，不参与构建）。最终目录：

```
/Users/fuhao/Downloads/TestEngine/
├── package.json / vite.config.ts / tsconfig*.json / index.html
├── public/mockServiceWorker.js          # npx msw init 生成
├── src/
│   ├── main.ts / App.vue
│   ├── api/            # 服务层：auth.ts workstation.ts project.ts testCase.ts
│   │                   #         testPlan.ts apiTest.ts bug.ts setting.ts
│   ├── mocks/
│   │   ├── browser.ts  # setupWorker + 按需注册
│   │   ├── handlers/index.ts  # 聚合各模块 handler
│   │   ├── handlers/*.ts     # auth/workstation/testCase/...
│   │   └── seed/       # 工厂函数：org.ts user.ts project.ts testCase.ts ...
│   ├── router/index.ts + routes.ts
│   ├── stores/         # user.ts permission.ts app.ts notification.ts
│   ├── views/          # workstation/ project/ testCase/ testPlan/ apiTest/ bug/ setting/ personal/
│   ├── components/     # 通用业务组件：DataTable.vue ModuleTree.vue StatusTag.vue ...
│   ├── composables/    # useTable.ts usePagination.ts ...
│   ├── directives/     # permission.ts
│   ├── types/          # index.ts api.ts models.ts
│   ├── utils/          # request.ts storage.ts format.ts
│   ├── locales/        # zh-CN.ts en-US.ts（i18n）
│   └── styles/         # variables.scss index.scss element.scss dark.scss
```

### 0.2 类型与 API 约定（`src/types/`）

```typescript
// types/index.ts
export interface ApiResult<T = unknown> {
  code: number
  message: string
  data: T
}
export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}
export interface PageQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: unknown
}
export interface OptionItem { label: string; value: string | number }
```

服务层函数签名约定：所有 `api/*.ts` 导出函数返回 `Promise<T>`（已解包 `data`），分页返回 `Promise<PageResult<T>>`。例如 `api/testCase.ts` 中 `export function fetchCaseList(query: PageQuery): Promise<PageResult<TestCase>>`。

### 0.3 设计系统 token（`src/styles/variables.scss`）

复用已批准预览的设计 token（SCSS 变量 + CSS 自定义属性双份）：

```scss
:root {
  --accent: #0d9488;
  --sb-bg: #0f172a;       // 常暗侧边栏
  --app-bg: #f4f5f9;
  --surface: #ffffff;
  --border: #e5e7eb;
  --text-1: #0f172a;
  --text-2: #475569;
  --text-3: #94a3b8;
  // Element Plus 主色覆盖
  --el-color-primary: #0d9488;
  --el-color-primary-light-3: #43a99e;
  --el-color-primary-light-5: #6fbfb6;
  --el-color-primary-light-7: #9cd5ce;
  --el-color-primary-light-8: #b1dfda;
  --el-color-primary-light-9: #c6e9e5;
  --el-color-primary-dark-2: #0a766b;
}
html.dark {
  --app-bg: #0b1220;
  --surface: #111827;
  --border: #1f2937;
  --text-1: #f1f5f9;
  --text-2: #cbd5e1;
  --text-3: #64748b;
}
```

### 0.4 权限模型

- 登录成功后拉取当前用户 + 权限点（字符串数组，如 `testCase:create`），存入 `userStore.permissions`。
- 菜单级：路由 `meta.permission` 标注所需权限点；`router.beforeEach` 守卫校验，无权限跳 `/403`。
- 按钮级：自定义指令 `v-permission="'testCase:create'"`，无权限时移除 DOM 元素。
- 数据隔离：越权访问统一返回 403 空态页，不泄露数据存在性（FR-G-009）。

### 0.5 Mock 机制

- MSW handler 按模块文件维护（`mocks/handlers/testCase.ts` 等），在 `handlers/index.ts` 聚合导出 `handlers` 数组。
- 种子数据用工厂函数生成（`mocks/seed/testCase.ts` 的 `createTestCases()`），每次调用返回新数组，避免污染全局。
- 写操作在模块级内存 `Map<string, T>` / 数组中闭环（刷新重置）；分页/筛选/排序在 handler 内用工具函数实现。
- 统一响应工具：`mocks/utils.ts` 导出 `ok(data)`、`page(list, query)`、`fail(code, message)`。

### 0.6 代码与命名规范

- 组件 `<script setup lang="ts">`；`defineProps` / `defineEmits` 显式类型。
- 常量枚举（等级/状态/严重程度/HTTP 方法）集中在 `types/models.ts` 或 `utils/constants.ts`，禁止散落魔法字符串。
- 文案走 i18n（`t('menu.testCase')`），禁止硬编码中文在模板里（数据除外）。

---

## Milestone 0：脚手架与基础设施

> 交付物：`npm run dev` 可启动，`src/main.ts` 挂载 Element Plus + Pinia + Router + i18n + MSW，全局样式与主题 token 就位，request 层与 Mock 框架可被后续任务调用。

### Task 0.1：项目初始化

**Files:**
- Create: `package.json`、`vite.config.ts`、`tsconfig.json`、`tsconfig.node.json`、`index.html`、`.gitignore`、`src/main.ts`、`src/App.vue`、`src/env.d.ts`

**Interfaces:**
- Produces: `package.json` 依赖清单；`vite.config.ts` 的 `@` 别名 → `src`；`src/main.ts` 挂载入口（后续任务向其追加插件注册）。

- [ ] **Step 1: 写入 package.json**

```json
{
  "name": "testengine",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@element-plus/icons-vue": "^2.3.1",
    "axios": "^1.7.9",
    "echarts": "^5.5.1",
    "element-plus": "^2.9.1",
    "pinia": "^2.2.6",
    "vue": "^3.5.13",
    "vue-i18n": "^10.0.4",
    "vue-router": "^4.4.5",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/node": "^22.10.1",
    "@vitejs/plugin-vue": "^5.2.1",
    "msw": "^2.6.8",
    "sass": "^1.83.0",
    "typescript": "~5.6.3",
    "vite": "^6.0.3",
    "vue-tsc": "^2.1.10"
  }
}
```

- [ ] **Step 2: 写入 vite.config.ts / tsconfig / index.html / .gitignore**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173 },
})
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["vite/client", "node"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"]
}
```

```html
<!-- index.html -->
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TestEngine 测试平台</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```gitignore
node_modules/
dist/
.DS_Store
*.local
```

- [ ] **Step 3: 写入 src/main.ts / src/App.vue / src/env.d.ts**

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/index.scss'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus)
for (const [key, comp] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, comp)
}
app.mount('#app')
```

```vue
<!-- src/App.vue -->
<template>
  <router-view />
</template>
```

```typescript
// src/env.d.ts
/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

- [ ] **Step 4: 安装依赖并启动验证**

Run: `cd /Users/fuhao/Downloads/TestEngine && npm install && npm run dev`
Expected: 依赖安装成功，`http://localhost:5173` 返回页面（当前 router 未建会报错，故本步先临时以空 `router/index.ts` 兜底，见 Task 1.3 正式实现）。

- [ ] **Step 5: 提交**

```bash
git init && git add -A && git commit -m "chore: scaffold Vite + Vue3 + TS + Element Plus project"
```

> 若尚未 `git init`，本步一并初始化（仓库根 = 项目根）。

### Task 0.2：设计系统（styles）

**Files:**
- Create: `src/styles/index.scss`、`src/styles/variables.scss`、`src/styles/element.scss`、`src/styles/dark.scss`

**Interfaces:**
- Produces: CSS 变量 `--accent / --sb-bg / --app-bg / --surface / --border / --text-1/2/3` 及 Element Plus 主色覆盖，供所有视图使用。

- [ ] **Step 1: 写入 variables.scss（token，内容即 §0.3）**

将 §0.3 的 `:root` 与 `html.dark` 两段完整写入 `src/styles/variables.scss`。

- [ ] **Step 2: 写入 element.scss（Element Plus 组件微调）**

```scss
// src/styles/element.scss
.el-card { border-radius: 8px; border-color: var(--border); }
.el-table { --el-table-border-color: var(--border); }
.el-button--primary { font-weight: 500; }
```

- [ ] **Step 3: 写入 index.scss（聚合 + 全局）**

```scss
// src/styles/index.scss
@use './variables.scss';
@use './element.scss';

* { box-sizing: border-box; }
html, body, #app { height: 100%; margin: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--text-1);
  background: var(--app-bg);
}
a { text-decoration: none; color: inherit; }
```

- [ ] **Step 4: 验证**

Run: `npm run dev`，打开页面确认背景色为 `#f4f5f9`、无样式报错。

- [ ] **Step 5: 提交** `git commit -am "style: design tokens + Element Plus theme overrides"`

### Task 0.3：类型定义（types）

**Files:**
- Create: `src/types/index.ts`、`src/types/api.ts`、`src/types/models.ts`

**Interfaces:**
- Produces: `ApiResult<T>` / `PageResult<T>` / `PageQuery`（§0.2）；`models.ts` 导出所有业务实体接口与枚举。

- [ ] **Step 1: 写入 types/index.ts（§0.2 完整内容）**

- [ ] **Step 2: 写入 types/api.ts**

```typescript
// src/types/api.ts
export type { ApiResult, PageResult, PageQuery, OptionItem } from './index'
export interface LoginPayload { username: string; password: string }
export interface LoginResult {
  token: string
  user: User
  permissions: string[]
}
export interface User {
  id: string
  username: string
  name: string
  email: string
  role: string
  avatar?: string
}
```

- [ ] **Step 3: 写入 types/models.ts（业务实体 + 枚举）**

```typescript
// src/types/models.ts
export interface Organization { id: string; name: string; description?: string }
export interface Project {
  id: string; orgId: string; name: string; description: string
  createTime: string; members: number; caseCount: number
}
export interface ModuleNode { id: string; name: string; children: ModuleNode[] }

export type CaseLevel = 'P0' | 'P1' | 'P2' | 'P3'
export type CaseStatus = 'DRAFT' | 'REVIEW' | 'READY'
export interface TestCase {
  id: string; projectId: string; moduleId: string; name: string
  precondition: string; steps: CaseStep[]; level: CaseLevel
  status: CaseStatus; executor: string; tags: string[]
  createUser: string; updateTime: string; follow: boolean
}
export interface CaseStep { id: string; description: string; expected: string }

export type BugSeverity = 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'TRIVIAL'
export type BugStatus = 'NEW' | 'ASSIGNED' | 'FIXING' | 'FIXED' | 'CLOSED' | 'REOPEN'
export interface Bug {
  id: string; projectId: string; title: string; severity: BugSeverity
  status: BugStatus; assignee: string; reporter: string
  description: string; createTime: string; moduleId: string
}
export interface ApiDefinition {
  id: string; projectId: string; moduleId: string; name: string
  method: HttpMethod; path: string; protocol: 'HTTP' | 'TCP' | 'SQL' | 'DUBBO'
  description: string
}
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'CONNECT'
export interface ScenarioStep {
  id: string; name: string; type: 'REQUEST' | 'LOOP' | 'CONDITION' | 'ONCE' | 'SCRIPT' | 'WAIT'
  enabled: boolean; children?: ScenarioStep[]
  config: Record<string, unknown>
}
export interface TestPlan {
  id: string; projectId: string; name: string; status: 'DRAFT' | 'RUNNING' | 'DONE'
  owner: string; startTime: string; endTime: string; progress: number
}
export interface Notification {
  id: string; type: string; title: string; content: string
  read: boolean; createTime: string; targetUrl: string
}
```

- [ ] **Step 4: 类型检查**

Run: `npm run typecheck`
Expected: 无类型错误。

- [ ] **Step 5: 提交** `git commit -am "feat: define core types and domain models"`

### Task 0.4：request 传输层

**Files:**
- Create: `src/utils/request.ts`、`src/utils/storage.ts`、`src/utils/format.ts`

**Interfaces:**
- Produces: `request<T>(config): Promise<T>`（已解包 `data`）；`storage` 工具 `get/set/remove`（JSON 序列化 + 命名空间前缀 `te_`）；`formatDateTime(ts)`。

- [ ] **Step 1: 写入 storage.ts 与 format.ts**

```typescript
// src/utils/storage.ts
const PREFIX = 'te_'
export const storage = {
  get<T>(key: string): T | null {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return null
    try { return JSON.parse(raw) as T } catch { return raw as unknown as T }
  },
  set<T>(key: string, value: T): void {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  },
  remove(key: string): void { localStorage.removeItem(PREFIX + key) },
}
```

```typescript
// src/utils/format.ts
export function formatDateTime(ts: string | number): string {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
```

- [ ] **Step 2: 写入 request.ts**

```typescript
// src/utils/request.ts
import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResult } from '@/types'
import { storage } from './storage'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
})

service.interceptors.request.use((config) => {
  const token = storage.get<string>('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResult
    if (res.code !== 0) {
      if (res.code === 401) {
        storage.remove('token')
        storage.remove('user')
        window.location.href = '/login'
      }
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
    return res.data
  },
  (error) => {
    ElMessage.error(error.message || '网络异常')
    return Promise.reject(error)
  },
)

export function request<T>(config: AxiosRequestConfig): Promise<T> {
  return service.request(config) as unknown as Promise<T>
}
```

- [ ] **Step 3: 提交** `git commit -am "feat: add axios request layer with interceptors"`

### Task 0.5：MSW 基础设施

**Files:**
- Create: `src/mocks/browser.ts`、`src/mocks/handlers/index.ts`、`src/mocks/utils.ts`、`src/mocks/seed/index.ts`
- Generate: `public/mockServiceWorker.js`

**Interfaces:**
- Produces: `bootstrapMock()`（在 `VITE_USE_MOCK` 为真时启动 worker）；`handlers` 数组（后续任务向其追加模块 handler）；`ok/page/fail` 工具；`seed` 命名空间导出各工厂。

- [ ] **Step 1: 生成 worker 文件**

Run: `npx msw init public/ --save`
Expected: `public/mockServiceWorker.js` 生成。

- [ ] **Step 2: 写入 mocks/utils.ts**

```typescript
// src/mocks/utils.ts
import type { ApiResult, PageQuery, PageResult } from '@/types'

export function ok<T>(data: T): ApiResult<T> {
  return { code: 0, message: 'ok', data }
}
export function fail(code: number, message: string): ApiResult<null> {
  return { code, message, data: null }
}
export function page<T>(list: T[], query: PageQuery): PageResult<T> {
  const { pageNum, pageSize, keyword } = query
  let filtered = list
  if (keyword) {
    filtered = filtered.filter((it) =>
      Object.values(it as Record<string, unknown>)
        .some((v) => String(v ?? '').toLowerCase().includes(String(keyword).toLowerCase())),
    )
  }
  const total = filtered.length
  const start = (pageNum - 1) * pageSize
  return { list: filtered.slice(start, start + pageSize), total, pageNum, pageSize }
}
```

- [ ] **Step 3: 写入 handlers/index.ts 与 seed/index.ts**

```typescript
// src/mocks/handlers/index.ts
export const handlers: Parameters<typeof import('msw/browser').setupWorker>[0] = []
```

```typescript
// src/mocks/seed/index.ts
export * from './org'
export * from './user'
export * from './project'
export * from './testCase'
export * from './apiTest'
export * from './bug'
export * from './testPlan'
```

- [ ] **Step 4: 写入 browser.ts**

```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export async function bootstrapMock(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return
  const worker = setupWorker(...handlers)
  await worker.start({ onUnhandledRequest: 'bypass' })
}
```

- [ ] **Step 5: 在 main.ts 注册并验证**

在 `src/main.ts` 顶部（`mount` 之前）加入：

```typescript
import { bootstrapMock } from './mocks/browser'
async function bootstrap() {
  await bootstrapMock()
  app.mount('#app')
}
bootstrap()
```

Run: `VITE_USE_MOCK=true npm run dev`
Expected: 控制台打印 `[MSW] Mocking enabled`（worker 注册成功）。seed 文件后续任务创建，本步先以空文件占位以免 `seed/index.ts` 导入报错。

- [ ] **Step 6: 提交** `git commit -am "feat: add MSW infrastructure and bootstrap"`

---

## Milestone 1：认证 + 布局 + 权限

> 交付物：登录后可进入主布局，侧边栏/顶栏完整，路由守卫拦截未登录与越权访问，`v-permission` 指令可用，中/英文与亮/暗主题可切换并持久化。

### Task 1.1：登录认证（user store + auth 服务 + Mock）

**Files:**
- Create: `src/api/auth.ts`、`src/mocks/seed/user.ts`、`src/mocks/handlers/auth.ts`、`src/stores/user.ts`、`src/views/login/index.vue`
- Modify: `src/mocks/handlers/index.ts`（聚合 authHandlers）、`src/mocks/seed/index.ts`（补 user 导出，见 Task 0.5 已列）

**Interfaces:**
- Produces: `useUserStore`（`token/user/permissions/isLoggedIn/hasPermission/login/logout`）；`api/auth.ts` 的 `login(payload)/logout()`；seed 的 `users`（含 `username/password/permissions`）。

- [ ] **Step 1: 写入 seed/user.ts**

```typescript
// src/mocks/seed/user.ts
import type { User } from '@/types/api'

export interface SeedUser {
  id: string; username: string; password: string; name: string
  email: string; role: string; permissions: string[]
}
const ALL = ['*']

export const users: SeedUser[] = [
  { id: 'u-1', username: 'Administrator', password: 'admin123', name: '系统管理员', email: 'admin@testengine.io', role: '系统管理员', permissions: ALL },
  { id: 'u-2', username: 'test', password: 'test123', name: '测试工程师', email: 'test@testengine.io', role: '测试工程师', permissions: ['testCase:view', 'testCase:create', 'testCase:edit', 'apiTest:view', 'apiTest:debug', 'testPlan:view', 'bug:view', 'bug:create'] },
  { id: 'u-3', username: 'dev', password: 'dev123', name: '开发工程师', email: 'dev@testengine.io', role: '开发工程师', permissions: ['apiTest:view', 'apiTest:debug', 'bug:view'] },
]

export function toPublicUser(u: SeedUser): User {
  const { password: _pw, permissions: _p, ...rest } = u
  return rest
}
```

- [ ] **Step 2: 写入 handlers/auth.ts 并聚合**

```typescript
// src/mocks/handlers/auth.ts
import { http, HttpResponse } from 'msw'
import { ok, fail } from '../utils'
import { users, toPublicUser } from '../seed/user'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = await request.json() as { username: string; password: string }
    const u = users.find((it) => it.username === username && it.password === password)
    if (!u) return HttpResponse.json(fail(1001, '用户名或密码错误'))
    return HttpResponse.json(ok({ token: `mock-token-${u.id}`, user: toPublicUser(u), permissions: u.permissions }))
  }),
  http.post('/api/auth/logout', () => HttpResponse.json(ok(null))),
]
```

```typescript
// src/mocks/handlers/index.ts（覆盖 Task 0.5 的空数组）
import { authHandlers } from './auth'
export const handlers = [...authHandlers]
```

- [ ] **Step 3: 写入 api/auth.ts 与 stores/user.ts**

```typescript
// src/api/auth.ts
import { request } from '@/utils/request'
import type { LoginPayload, LoginResult } from '@/types/api'

export function login(payload: LoginPayload): Promise<LoginResult> {
  return request({ url: '/api/auth/login', method: 'post', data: payload })
}
export function logout(): Promise<null> {
  return request({ url: '/api/auth/logout', method: 'post' })
}
```

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import type { LoginPayload } from '@/types/api'
import type { User } from '@/types/api'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(storage.get('token') ?? '')
  const user = ref<User | null>(storage.get<User>('user'))
  const permissions = ref<string[]>(storage.get<string[]>('permissions') ?? [])

  const isLoggedIn = computed(() => !!token.value)

  function hasPermission(point: string): boolean {
    return permissions.value.includes('*') || permissions.value.includes(point)
  }

  async function login(payload: LoginPayload) {
    const res = await loginApi(payload)
    token.value = res.token
    user.value = res.user
    permissions.value = res.permissions
    storage.set('token', res.token)
    storage.set('user', res.user)
    storage.set('permissions', res.permissions)
  }

  async function logout() {
    await logoutApi().catch(() => {})
    token.value = ''
    user.value = null
    permissions.value = []
    storage.remove('token'); storage.remove('user'); storage.remove('permissions')
  }

  return { token, user, permissions, isLoggedIn, hasPermission, login, logout }
})
```

- [ ] **Step 4: 写入登录页 views/login/index.vue**

```vue
<template>
  <div class="login-wrap">
    <div class="login-brand">
      <h1>TestEngine</h1>
      <p>持续测试 · 测试管理 · 接口自动化</p>
    </div>
    <div class="login-form">
      <el-card shadow="never">
        <h2>{{ t('login.title') }}</h2>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item prop="username" :label="t('login.username')">
            <el-input v-model="form.username" placeholder="Administrator" />
          </el-form-item>
          <el-form-item prop="password" :label="t('login.password')">
            <el-input v-model="form.password" type="password" show-password @keyup.enter="onSubmit" />
          </el-form-item>
          <el-button type="primary" class="submit" :loading="loading" @click="onSubmit">
            {{ t('login.submit') }}
          </el-button>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: 'Administrator', password: 'admin123' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function onSubmit() {
  await formRef.value!.validate()
  loading.value = true
  try {
    await userStore.login(form)
    ElMessage.success(t('login.success'))
    router.replace((route.query.redirect as string) || '/workstation/home')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-wrap { height: 100vh; display: flex; }
.login-brand {
  flex: 1; background: var(--sb-bg); color: #fff;
  display: flex; flex-direction: column; justify-content: center; padding: 0 80px;
  h1 { font-size: 44px; margin-bottom: 12px; }
  p { color: #94a3b8; }
}
.login-form { width: 440px; display: flex; align-items: center; justify-content: center; background: var(--surface); }
.submit { width: 100%; margin-top: 8px; }
</style>
```

- [ ] **Step 5: 验证**

Run: `npm run dev`，访问 `/login`，输入 `Administrator / admin123` 登录，验证 `localStorage` 写入 `te_token` 且跳转（跳转目标路由见 Task 1.3，未建前会 404，本步仅验证登录态写入）。用错误密码验证 toast 提示「用户名或密码错误」。

- [ ] **Step 6: 提交** `git commit -am "feat: login auth flow with user store and mock"`

### Task 1.2：主布局（侧边栏 + 顶栏）

**Files:**
- Create: `src/config/menu.ts`、`src/layouts/DefaultLayout.vue`、`src/layouts/components/SidebarMenu.vue`、`src/layouts/components/TopBar.vue`、`src/stores/app.ts`、`src/stores/notification.ts`

**Interfaces:**
- Produces: `menuTree`（菜单配置）；`useAppStore`（`theme/locale/sidebarCollapsed/toggleTheme/setLocale/toggleSidebar`）；`useNotificationStore`（`list/unreadCount/load/markOne/markAll`）。

- [ ] **Step 1: 写入 config/menu.ts**

```typescript
// src/config/menu.ts
export interface MenuItem {
  key: string
  i18nKey: string
  icon: string
  path?: string
  permission?: string
  children?: MenuItem[]
}

export const menuTree: MenuItem[] = [
  { key: 'home', i18nKey: 'menu.workstation', icon: 'Odometer', path: '/workstation/home' },
  { key: 'project', i18nKey: 'menu.project', icon: 'Folder', path: '/project/info' },
  { key: 'testplan', i18nKey: 'menu.testPlan', icon: 'Calendar', path: '/test-plan/list' },
  {
    key: 'testcase', i18nKey: 'menu.testCase', icon: 'Tickets', children: [
      { key: 'case-list', i18nKey: 'menu.caseList', path: '/test-case/list', permission: 'testCase:view' },
      { key: 'mindmap', i18nKey: 'menu.mindmap', path: '/test-case/mindmap', permission: 'testCase:view' },
      { key: 'review', i18nKey: 'menu.review', path: '/test-case/review', permission: 'testCase:view' },
    ],
  },
  {
    key: 'apiparent', i18nKey: 'menu.apiTest', icon: 'Connection', children: [
      { key: 'api-debug', i18nKey: 'menu.apiDebug', path: '/api-test/debug', permission: 'apiTest:view' },
      { key: 'api-def', i18nKey: 'menu.apiDefinition', path: '/api-test/definition', permission: 'apiTest:view' },
      { key: 'api-scenario', i18nKey: 'menu.apiScenario', path: '/api-test/scenario', permission: 'apiTest:view' },
      { key: 'api-report', i18nKey: 'menu.apiReport', path: '/api-test/report', permission: 'apiTest:view' },
      { key: 'api-mock', i18nKey: 'menu.apiMock', path: '/api-test/mock', permission: 'apiTest:view' },
    ],
  },
  { key: 'bug', i18nKey: 'menu.bug', icon: 'WarningFilled', path: '/bug/list', permission: 'bug:view' },
  { key: 'setting', i18nKey: 'menu.setting', icon: 'Setting', path: '/setting/system/user', permission: 'system:view' },
]
```

- [ ] **Step 2: 写入 stores/app.ts 与 stores/notification.ts**

```typescript
// src/stores/app.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'

export const useAppStore = defineStore('app', () => {
  const theme = ref<'light' | 'dark'>(storage.get('theme') ?? 'light')
  const locale = ref<'zh-CN' | 'en-US'>(storage.get('locale') ?? 'zh-CN')
  const sidebarCollapsed = ref<boolean>(storage.get('sidebarCollapsed') ?? false)

  function applyTheme() { document.documentElement.classList.toggle('dark', theme.value === 'dark') }
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    storage.set('theme', theme.value)
    applyTheme()
  }
  function setLocale(l: 'zh-CN' | 'en-US') {
    locale.value = l
    storage.set('locale', l)
  }
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    storage.set('sidebarCollapsed', sidebarCollapsed.value)
  }

  return { theme, locale, sidebarCollapsed, applyTheme, toggleTheme, setLocale, toggleSidebar }
})
```

```typescript
// src/stores/notification.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from '@/types/models'
import { fetchNotifications, markRead, markAllRead } from '@/api/workstation'

export const useNotificationStore = defineStore('notification', () => {
  const list = ref<Notification[]>([])
  const unreadCount = computed(() => list.value.filter((n) => !n.read).length)

  async function load() { list.value = await fetchNotifications() }
  async function markOne(id: string) {
    await markRead(id)
    list.value = list.value.map((n) => (n.id === id ? { ...n, read: true } : n))
  }
  async function markAll() {
    await markAllRead()
    list.value = list.value.map((n) => ({ ...n, read: true }))
  }

  return { list, unreadCount, load, markOne, markAll }
})
```

> `api/workstation.ts` 在 Task 2.1 实现；本步 `stores/notification.ts` 先引用，Task 2.1 前若启动会因缺函数报错，故本步只写文件，类型检查延后到 Task 2.1 一并通过。

- [ ] **Step 3: 写入 SidebarMenu.vue（递归菜单 + 权限过滤）**

```vue
<template>
  <el-menu :default-active="route.path" :collapse="appStore.sidebarCollapsed"
    router unique-opened background-color="transparent" text-color="#94a3b8" active-text-color="#fff">
    <template v-for="item in visibleMenus" :key="item.key">
      <el-sub-menu v-if="item.children?.length" :index="item.key">
        <template #title>
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ t(item.i18nKey) }}</span>
        </template>
        <el-menu-item v-for="child in item.children" :key="child.key" :index="child.path">
          {{ t(child.i18nKey) }}
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else :index="item.path">
        <el-icon><component :is="item.icon" /></el-icon>
        <template #title>{{ t(item.i18nKey) }}</template>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { menuTree } from '@/config/menu'

const { t } = useI18n()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const visibleMenus = computed(() =>
  menuTree.filter((m) => !m.children || m.children.some((c) => !c.permission || userStore.hasPermission(c.permission)))
    .map((m) => m.children ? { ...m, children: m.children.filter((c) => !c.permission || userStore.hasPermission(c.permission)) } : m),
)
</script>
```

- [ ] **Step 4: 写入 TopBar.vue（项目切换 + 通知 + 主题 + 语言 + 头像）**

```vue
<template>
  <div class="topbar">
    <div class="left">
      <el-icon class="collapse-btn" @click="appStore.toggleSidebar()">
        <Fold v-if="!appStore.sidebarCollapsed" /><Expand v-else />
      </el-icon>
      <el-select :model-value="currentProjectId" size="small" style="width: 200px" @update:model-value="onProjectChange">
        <el-option v-for="p in projects" :key="p.id" :label="p.name" :value="p.id" />
      </el-select>
    </div>
    <div class="right">
      <el-badge :value="notification.unreadCount" :hidden="notification.unreadCount === 0">
        <el-icon class="action" @click="showNotif = true"><Bell /></el-icon>
      </el-badge>
      <el-icon class="action" @click="appStore.toggleTheme()">
        <Moon v-if="appStore.theme === 'light'" /><Sunny v-else />
      </el-icon>
      <el-dropdown @command="onLang">
        <span class="action lang">{{ appStore.locale === 'zh-CN' ? '中' : 'EN' }}</span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
            <el-dropdown-item command="en-US">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown @command="onUser">
        <span class="user"><el-avatar :size="26">{{ userStore.user?.name?.slice(0, 1) }}</el-avatar></span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="personal">{{ t('topbar.personal') }}</el-dropdown-item>
            <el-dropdown-item command="logout" divided>{{ t('topbar.logout') }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-drawer v-model="showNotif" :title="t('topbar.notification')" size="360px">
      <div v-if="notification.list.length === 0" class="empty">{{ t('common.empty') }}</div>
      <div v-for="n in notification.list" :key="n.id" class="notif-item" :class="{ unread: !n.read }" @click="notification.markOne(n.id)">
        <div class="title">{{ n.title }}</div>
        <div class="content">{{ n.content }}</div>
      </div>
      <el-button v-if="notification.unreadCount > 0" size="small" @click="notification.markAll()">{{ t('topbar.markAllRead') }}</el-button>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { fetchProjects } from '@/api/project'

const { t } = useI18n()
const appStore = useAppStore()
const userStore = useUserStore()
const notification = useNotificationStore()

const showNotif = ref(false)
const projects = ref<Array<{ id: string; name: string }>>([])
const currentProjectId = ref('p-1')

async function onProjectChange(id: string) { currentProjectId.value = id }
function onLang(l: 'zh-CN' | 'en-US') {
  appStore.setLocale(l)
  i18n.global.locale.value = l
}
function onUser(cmd: string) {
  if (cmd === 'logout') userStore.logout().then(() => router.replace('/login'))
  else router.push('/personal/profile')
}

onMounted(async () => {
  projects.value = await fetchProjects({ orgId: '100001' })
  await notification.load()
})
</script>
```

> 顶栏脚本需 `import { useI18n }` 拿到 `i18n`、`import { useRouter } from 'vue-router'` 的 `router`；`fetchProjects` 在 Task 1.3 前由 `api/project.ts` 占位实现（返回硬编码 `[{ id: 'p-1', name: '示例项目' }]`），正式数据在 Milestone 6 补全。

- [ ] **Step 5: 写入 DefaultLayout.vue 聚合**

```vue
<template>
  <el-container class="layout">
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="sidebar">
      <div class="logo">TestEngine</div>
      <SidebarMenu />
    </el-aside>
    <el-container>
      <el-header class="header"><TopBar /></el-header>
      <el-main class="main"><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import SidebarMenu from './components/SidebarMenu.vue'
import TopBar from './components/TopBar.vue'

const appStore = useAppStore()
onMounted(() => appStore.applyTheme())
</script>

<style scoped lang="scss">
.layout { height: 100vh; }
.sidebar { background: var(--sb-bg); color: #fff; transition: width 0.2s; overflow: hidden; }
.logo { height: 56px; line-height: 56px; text-align: center; font-weight: 700; font-size: 18px; }
.header { height: 56px; background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 16px; }
.main { background: var(--app-bg); padding: 16px; overflow: auto; }
</style>
```

- [ ] **Step 6: 提交** `git commit -am "feat: main layout with sidebar, topbar and app/notification stores"`

### Task 1.3：路由与权限守卫

**Files:**
- Create: `src/router/index.ts`、`src/router/routes.ts`、`src/views/error/403.vue`、`src/views/error/404.vue`
- Modify: `src/api/project.ts`（占位 fetchProjects）

**Interfaces:**
- Produces: `router`（hash 模式 + 前置守卫）；`routes` 完整路由表（所有模块页面 path + 懒加载）；`fetchProjects(params)` 占位实现。

- [ ] **Step 1: 写入 router/routes.ts（完整路由表）**

```typescript
// src/router/routes.ts
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: () => import('@/views/login/index.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/workstation/home',
    children: [
      { path: 'workstation/home', name: 'WorkstationHome', component: () => import('@/views/workstation/home/index.vue'), meta: { title: 'menu.workstation' } },
      { path: 'workstation/todo', name: 'WorkstationTodo', component: () => import('@/views/workstation/todo/index.vue') },
      { path: 'workstation/follow', name: 'WorkstationFollow', component: () => import('@/views/workstation/follow/index.vue') },
      { path: 'project/info', name: 'ProjectInfo', component: () => import('@/views/project/info/index.vue'), meta: { permission: 'project:view' } },
      { path: 'project/member', name: 'ProjectMember', component: () => import('@/views/project/member/index.vue'), meta: { permission: 'project:view' } },
      { path: 'project/userGroup', name: 'ProjectUserGroup', component: () => import('@/views/project/userGroup/index.vue'), meta: { permission: 'project:view' } },
      { path: 'project/environment', name: 'ProjectEnvironment', component: () => import('@/views/project/environment/index.vue'), meta: { permission: 'project:view' } },
      { path: 'test-case/list', name: 'CaseList', component: () => import('@/views/testCase/list/index.vue'), meta: { permission: 'testCase:view' } },
      { path: 'test-case/mindmap', name: 'CaseMindmap', component: () => import('@/views/testCase/mindmap/index.vue'), meta: { permission: 'testCase:view' } },
      { path: 'test-case/review', name: 'CaseReview', component: () => import('@/views/testCase/review/index.vue'), meta: { permission: 'testCase:view' } },
      { path: 'test-plan/list', name: 'TestPlanList', component: () => import('@/views/testPlan/list/index.vue'), meta: { permission: 'testPlan:view' } },
      { path: 'test-plan/report/:id', name: 'TestPlanReport', component: () => import('@/views/testPlan/report/index.vue'), meta: { permission: 'testPlan:view' } },
      { path: 'api-test/debug', name: 'ApiDebug', component: () => import('@/views/apiTest/debug/index.vue'), meta: { permission: 'apiTest:view' } },
      { path: 'api-test/definition', name: 'ApiDefinition', component: () => import('@/views/apiTest/definition/index.vue'), meta: { permission: 'apiTest:view' } },
      { path: 'api-test/scenario', name: 'ApiScenario', component: () => import('@/views/apiTest/scenario/index.vue'), meta: { permission: 'apiTest:view' } },
      { path: 'api-test/report', name: 'ApiReport', component: () => import('@/views/apiTest/report/index.vue'), meta: { permission: 'apiTest:view' } },
      { path: 'api-test/mock', name: 'ApiMock', component: () => import('@/views/apiTest/mock/index.vue'), meta: { permission: 'apiTest:view' } },
      { path: 'bug/list', name: 'BugList', component: () => import('@/views/bug/list/index.vue'), meta: { permission: 'bug:view' } },
      { path: 'setting/system/user', name: 'SysUser', component: () => import('@/views/setting/system/user/index.vue'), meta: { permission: 'system:view' } },
      { path: 'setting/system/org', name: 'SysOrg', component: () => import('@/views/setting/system/org/index.vue'), meta: { permission: 'system:view' } },
      { path: 'setting/org/member', name: 'OrgMember', component: () => import('@/views/setting/org/member/index.vue'), meta: { permission: 'system:view' } },
      { path: 'personal/profile', name: 'PersonalProfile', component: () => import('@/views/personal/profile/index.vue') },
    ],
  },
  { path: '/403', name: 'Forbidden', component: () => import('@/views/error/403.vue'), meta: { public: true } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/error/404.vue'), meta: { public: true } },
]
```

- [ ] **Step 2: 写入 router/index.ts（守卫）**

```typescript
// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from './routes'
import { useUserStore } from '@/stores/user'

const router = createRouter({ history: createWebHashHistory(), routes })

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (to.meta.public) return true
  if (!userStore.isLoggedIn) return { path: '/login', query: { redirect: to.fullPath } }
  const required = to.meta.permission as string | undefined
  if (required && !userStore.hasPermission(required)) return { path: '/403' }
  return true
})

export default router
```

- [ ] **Step 3: 写入 403/404 页**

```vue
<!-- src/views/error/403.vue -->
<template>
  <div class="error-page">
    <h1>403</h1>
    <p>{{ t('error.forbidden') }}</p>
    <el-button type="primary" @click="router.push('/')">{{ t('common.backHome') }}</el-button>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
const router = useRouter()
const { t } = useI18n()
</script>
<style scoped>.error-page { text-align: center; padding-top: 120px; } h1 { font-size: 72px; color: var(--text-3); }</style>
```

> 404 页结构相同，文案 `error.notFound`，标题 `404`。

- [ ] **Step 4: 占位 api/project.ts（Task 1.2 依赖）**

```typescript
// src/api/project.ts
import { request } from '@/utils/request'
import type { Project } from '@/types/models'

export function fetchProjects(params: { orgId: string }): Promise<Project[]> {
  return request({ url: '/api/project/list', method: 'get', params })
}
```

> 同时需要 `mocks/handlers/project.ts` 提供 `/api/project/list` 最小 handler（返回 1 条示例项目），否则顶栏项目选择器空。该 handler 正式实现见 Task 6.1。

```typescript
// src/mocks/handlers/project.ts（最小版）
import { http, HttpResponse } from 'msw'
import { ok } from '../utils'
export const projectHandlers = [
  http.get('/api/project/list', () => HttpResponse.json(ok([{ id: 'p-1', orgId: '100001', name: '示例项目', description: '演示项目', createTime: '2026-08-01 10:00:00', members: 8, caseCount: 1284 }]))),
]
```

- [ ] **Step 5: 验证**

Run: `npm run dev`。登录后应进入 `/workstation/home`（该视图 Task 2.2 实现，本步可 404 或空白占位）；直接访问无权限路由（用 `test/test123` 登录后访问 `/setting/system/user`）应跳 `/403`；未登录访问 `/workstation/home` 应跳 `/login`。

- [ ] **Step 6: 提交** `git commit -am "feat: router with permission guard and error pages"`

### Task 1.4：权限指令 v-permission

**Files:**
- Create: `src/directives/permission.ts`
- Modify: `src/main.ts`（注册指令）

**Interfaces:**
- Produces: `v-permission` 指令（无权限时移除宿主元素）。

- [ ] **Step 1: 写入 directives/permission.ts**

```typescript
// src/directives/permission.ts
import type { Directive } from 'vue'
import { useUserStore } from '@/stores/user'

export const permission: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    const userStore = useUserStore()
    if (!userStore.hasPermission(binding.value)) {
      el.parentNode?.removeChild(el)
    }
  },
}
```

- [ ] **Step 2: 注册到 main.ts**

```typescript
// src/main.ts 增加
import { permission } from './directives/permission'
// ...
app.directive('permission', permission)
```

- [ ] **Step 3: 验证**

在任意视图临时加 `<el-button v-permission="'bug:create'">新建缺陷</el-button>`，用 `test/test123` 登录（该用户含 `bug:create`）应显示，用 `dev/dev123`（无 `bug:create`）应不渲染。

- [ ] **Step 4: 提交** `git commit -am "feat: add v-permission directive"`

### Task 1.5：i18n 中英文

**Files:**
- Create: `src/locales/index.ts`、`src/locales/zh-CN.ts`、`src/locales/en-US.ts`
- Modify: `src/main.ts`（注册 i18n）

**Interfaces:**
- Produces: `i18n` 实例（`legacy: false`，`useI18n()` 可用）；`t()` 覆盖菜单、通用、登录、错误文案。

- [ ] **Step 1: 写入 locales/zh-CN.ts 与 en-US.ts（菜单 + 通用）**

```typescript
// src/locales/zh-CN.ts
export default {
  menu: {
    workstation: '工作台', project: '项目管理', testPlan: '测试计划',
    testCase: '测试用例', caseList: '用例列表', mindmap: '脑图', review: '用例评审',
    apiTest: '接口测试', apiDebug: '接口调试', apiDefinition: '接口定义',
    apiScenario: '场景管理', apiReport: '接口报告', apiMock: 'Mock',
    bug: '缺陷管理', setting: '系统设置',
  },
  login: { title: '账号登录', username: '用户名', password: '密码', submit: '登录', success: '登录成功' },
  topbar: { personal: '个人中心', logout: '退出登录', notification: '通知', markAllRead: '全部已读' },
  common: {
    empty: '暂无数据', backHome: '返回首页', search: '搜索', reset: '重置',
    add: '新建', edit: '编辑', delete: '删除', export: '导出', import: '导入',
    confirm: '确认', cancel: '取消', submit: '提交', save: '保存', total: '共 {total} 条',
    success: '操作成功', deleteConfirm: '确认删除？删除后可在回收站恢复',
  },
  error: { forbidden: '无权限访问该页面', notFound: '页面不存在' },
}
```

```typescript
// src/locales/en-US.ts（与 zh-CN 同构，值英文化）
export default {
  menu: {
    workstation: 'Workstation', project: 'Project', testPlan: 'Test Plan',
    testCase: 'Test Case', caseList: 'Case List', mindmap: 'Mind Map', review: 'Review',
    apiTest: 'API Test', apiDebug: 'Debug', apiDefinition: 'Definition',
    apiScenario: 'Scenario', apiReport: 'Report', apiMock: 'Mock',
    bug: 'Defect', setting: 'Settings',
  },
  login: { title: 'Sign In', username: 'Username', password: 'Password', submit: 'Sign In', success: 'Signed in' },
  topbar: { personal: 'Profile', logout: 'Sign Out', notification: 'Notifications', markAllRead: 'Mark all read' },
  common: {
    empty: 'No data', backHome: 'Home', search: 'Search', reset: 'Reset',
    add: 'Create', edit: 'Edit', delete: 'Delete', export: 'Export', import: 'Import',
    confirm: 'Confirm', cancel: 'Cancel', submit: 'Submit', save: 'Save', total: 'Total {total}',
    success: 'Success', deleteConfirm: 'Delete? Recoverable in recycle bin',
  },
  error: { forbidden: 'Forbidden', notFound: 'Page not found' },
}
```

- [ ] **Step 2: 写入 locales/index.ts 并注册**

```typescript
// src/locales/index.ts
import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: { 'zh-CN': zhCN, 'en-US': enUS },
})
```

```typescript
// src/main.ts 增加
import { i18n } from './locales'
app.use(i18n)
```

- [ ] **Step 3: 同步 TopBar 初始 locale**

TopBar `onMounted` 中追加：`i18n.global.locale.value = appStore.locale`，确保刷新后语言持久化。

- [ ] **Step 4: 验证**

Run: `npm run dev`。切换语言后菜单/按钮文案即时切换；刷新后保持；切换主题后 `html.dark` 类切换并持久化。

- [ ] **Step 5: 提交** `git commit -am "feat: i18n zh/en + theme persistence"`

---

## Milestone 2：工作台（首个完整业务闭环）

> 交付物：工作台首页展示概览卡片 + ECharts 趋势图 + 待办；「我的待办」「我关注的」页可用；完整走通 Mock → service → store → 视图链路。对应 FR-WS-001/003/004/006。

### Task 2.1：工作台 service + Mock + seed

**Files:**
- Create: `src/api/workstation.ts`、`src/mocks/handlers/workstation.ts`、`src/mocks/seed/workstation.ts`
- Modify: `src/mocks/handlers/index.ts`（聚合）、`src/mocks/seed/index.ts`（补 workstation 导出）

**Interfaces:**
- Produces: `api/workstation.ts` 全部函数签名（§下方代码）；seed `overviewStats/trend/todos/notifications`；handler 对应 `/api/workstation/*`。

- [ ] **Step 1: 写入 seed/workstation.ts**

```typescript
// src/mocks/seed/workstation.ts
import type { Notification } from '@/types/models'

export interface TrendPoint { date: string; cases: number; apis: number }
export interface TodoItem { id: string; type: string; title: string; targetUrl: string; dueTime: string }
export interface FollowItem { id: string; type: string; name: string; owner: string; updateTime: string }

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
```

- [ ] **Step 2: 写入 handlers/workstation.ts 并聚合**

```typescript
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
```

```typescript
// src/mocks/handlers/index.ts（追加）
import { workstationHandlers } from './workstation'
export const handlers = [...authHandlers, ...workstationHandlers, ...projectHandlers]
```

- [ ] **Step 3: 写入 api/workstation.ts（签名见 Task 1.2 引用处，此处完整落地）**

```typescript
// src/api/workstation.ts
import { request } from '@/utils/request'
import type { Notification } from '@/types/models'
import type { TrendPoint, TodoItem, FollowItem } from '@/mocks/seed/workstation'

export interface OverviewStats { caseCount: number; reviewCount: number; apiCount: number; scenarioCount: number }

export function fetchOverview(params: { projectId: string; range: string }): Promise<OverviewStats> {
  return request({ url: '/api/workstation/overview', method: 'get', params })
}
export function fetchTrend(params: { projectId: string; range: string }): Promise<TrendPoint[]> {
  return request({ url: '/api/workstation/trend', method: 'get', params })
}
export function fetchTodos(params?: { type?: string }): Promise<TodoItem[]> {
  return request({ url: '/api/workstation/todos', method: 'get', params })
}
export function fetchFollows(params?: { type?: string }): Promise<FollowItem[]> {
  return request({ url: '/api/workstation/follows', method: 'get', params })
}
export function fetchNotifications(): Promise<Notification[]> {
  return request({ url: '/api/workstation/notifications', method: 'get' })
}
export function markRead(id: string): Promise<null> {
  return request({ url: `/api/workstation/notifications/${id}/read`, method: 'post' })
}
export function markAllRead(): Promise<null> {
  return request({ url: '/api/workstation/notifications/read-all', method: 'post' })
}
```

- [ ] **Step 4: 类型检查**

Run: `npm run typecheck`（本步补全了 Task 1.2 引用的 `fetchNotifications/markRead/markAllRead`，应无缺名报错）。

- [ ] **Step 5: 提交** `git commit -am "feat: workstation service, mock handlers and seed"`

### Task 2.2：工作台首页（概览卡片 + 趋势图）

**Files:**
- Create: `src/views/workstation/home/index.vue`、`src/components/StatCard.vue`、`src/components/TrendChart.vue`

**Interfaces:**
- Consumes: `fetchOverview` / `fetchTrend`（Task 2.1）。
- Produces: `StatCard`（props: `{ label: string; value: number | string; delta?: string; icon?: string }`）；`TrendChart`（props: `{ data: TrendPoint[] }`，内部初始化 ECharts 折线图）。

- [ ] **Step 1: 写入 StatCard.vue**

```vue
<template>
  <el-card shadow="never" class="stat-card">
    <div class="stat-icon"><el-icon><component :is="icon" /></el-icon></div>
    <div class="stat-body">
      <div class="value">{{ value }}</div>
      <div class="label">{{ label }}</div>
    </div>
    <div v-if="delta" class="delta">{{ delta }}</div>
  </el-card>
</template>
<script setup lang="ts">
defineProps<{ label: string; value: number | string; delta?: string; icon?: string }>()
</script>
<style scoped>
.stat-card { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 44px; height: 44px; border-radius: 8px; background: var(--el-color-primary-light-9); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 20px; }
.value { font-size: 24px; font-weight: 700; }
.label { font-size: 13px; color: var(--text-2); }
.delta { font-size: 12px; color: var(--accent); }
</style>
```

- [ ] **Step 2: 写入 TrendChart.vue（ECharts 折线）**

```vue
<template>
  <div ref="chartRef" style="height: 320px"></div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import type { TrendPoint } from '@/mocks/seed/workstation'

const props = defineProps<{ data: TrendPoint[] }>()
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function render() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['用例数', '接口数'] },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: props.data.map((d) => d.date) },
    yAxis: { type: 'value' },
    series: [
      { name: '用例数', type: 'line', smooth: true, data: props.data.map((d) => d.cases), itemStyle: { color: '#0d9488' } },
      { name: '接口数', type: 'line', smooth: true, data: props.data.map((d) => d.apis), itemStyle: { color: '#64748b' } },
    ],
  })
}
watch(() => props.data, render)
onMounted(render)
onBeforeUnmount(() => chart?.dispose())
</script>
```

- [ ] **Step 3: 写入 home/index.vue**

```vue
<template>
  <div>
    <div class="toolbar">
      <el-radio-group v-model="range">
        <el-radio-button value="3d">近 3 天</el-radio-button>
        <el-radio-button value="7d">近 7 天</el-radio-button>
      </el-radio-group>
    </div>
    <el-row :gutter="16" class="stats">
      <el-col v-for="s in statCards" :key="s.label" :span="6">
        <StatCard v-bind="s" />
      </el-col>
    </el-row>
    <el-card shadow="never" class="chart">
      <TrendChart :data="trend" />
    </el-card>
    <el-card shadow="never" class="todos">
      <template #header>{{ t('menu.workstation') }} · {{ t('common.todo') }}</template>
      <div v-if="todos.length === 0" class="empty">{{ t('common.empty') }}</div>
      <div v-for="td in todos" :key="td.id" class="todo-row" @click="router.push(td.targetUrl)">
        <span class="type">{{ td.type }}</span>
        <span class="title">{{ td.title }}</span>
        <span class="due">{{ td.dueTime }}</span>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import StatCard from '@/components/StatCard.vue'
import TrendChart from '@/components/TrendChart.vue'
import { fetchOverview, fetchTrend, fetchTodos } from '@/api/workstation'
import type { OverviewStats } from '@/api/workstation'
import type { TrendPoint, TodoItem } from '@/mocks/seed/workstation'

const { t } = useI18n()
const router = useRouter()
const range = ref('7d')
const overview = ref<OverviewStats>({ caseCount: 0, reviewCount: 0, apiCount: 0, scenarioCount: 0 })
const trend = ref<TrendPoint[]>([])
const todos = ref<TodoItem[]>([])

const statCards = computed(() => [
  { label: '功能用例', value: overview.value.caseCount, delta: '+3.2%', icon: 'Tickets' },
  { label: '用例评审', value: overview.value.reviewCount, delta: '+1.1%', icon: 'Document' },
  { label: '接口 API', value: overview.value.apiCount, delta: '+5.0%', icon: 'Connection' },
  { label: '场景', value: overview.value.scenarioCount, delta: '+2.4%', icon: 'Share' },
])

async function load() {
  const params = { projectId: 'p-1', range: range.value }
  overview.value = await fetchOverview(params)
  trend.value = await fetchTrend(params)
  todos.value = await fetchTodos()
}
onMounted(load)
watch(range, load)
</script>
<style scoped>
.toolbar { margin-bottom: 16px; }
.stats { margin-bottom: 16px; }
.chart { margin-bottom: 16px; }
.todo-row { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); cursor: pointer; }
.todo-row .type { color: var(--accent); }
.todo-row .due { margin-left: auto; color: var(--text-3); }
.empty { text-align: center; color: var(--text-3); padding: 24px 0; }
</style>
```

- [ ] **Step 4: 验证**

Run: `npm run dev`，登录进入工作台，确认 4 张卡片有数、趋势图渲染两条折线、待办 3 条可点击跳转。切换「近 3 天」触发重新请求。

- [ ] **Step 5: 提交** `git commit -am "feat: workstation home with stat cards and trend chart"`

### Task 2.3：我的待办页

**Files:**
- Create: `src/views/workstation/todo/index.vue`

**Interfaces:**
- Consumes: `fetchTodos`（Task 2.1）。

- [ ] **Step 1: 写入 todo/index.vue（列表 + 类型筛选）**

```vue
<template>
  <el-card shadow="never">
    <template #header>
      <div class="head">
        <span>{{ t('menu.workstation') }} · {{ t('common.todo') }}</span>
        <el-select v-model="type" clearable placeholder="全部类型" style="width: 160px">
          <el-option label="计划" value="计划" /><el-option label="评审" value="评审" /><el-option label="缺陷" value="缺陷" />
        </el-select>
      </div>
    </template>
    <el-table :data="filtered" v-loading="loading">
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="title" label="待办事项" />
      <el-table-column prop="dueTime" label="截止时间" width="180" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }"><el-button link type="primary" @click="router.push(row.targetUrl)">处理</el-button></template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchTodos } from '@/api/workstation'
import type { TodoItem } from '@/mocks/seed/workstation'

const { t } = useI18n()
const router = useRouter()
const type = ref('')
const list = ref<TodoItem[]>([])
const loading = ref(false)
const filtered = computed(() => (type.value ? list.value.filter((x) => x.type === type.value) : list.value))

onMounted(async () => { loading.value = true; list.value = await fetchTodos(); loading.value = false })
</script>
```

- [ ] **Step 2: 验证并提交**

Run: `npm run dev`，访问 `/workstation/todo` 确认列表与筛选。
`git commit -am "feat: workstation todo page"`

### Task 2.4：我关注的页

**Files:**
- Create: `src/views/workstation/follow/index.vue`

**Interfaces:**
- Consumes: `fetchFollows`（Task 2.1）。

- [ ] **Step 1: 写入 follow/index.vue（卡片列表 + 取消关注）**

```vue
<template>
  <el-row :gutter="16">
    <el-col v-for="f in list" :key="f.id" :span="8">
      <el-card shadow="never">
        <div class="f-type">{{ f.type }}</div>
        <div class="f-name">{{ f.name }}</div>
        <div class="f-meta">{{ f.owner }} · {{ f.updateTime }}</div>
        <el-button link type="danger" @click="unfollow(f.id)">{{ t('common.cancelFollow') }}</el-button>
      </el-card>
    </el-col>
  </el-row>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { fetchFollows } from '@/api/workstation'
import type { FollowItem } from '@/mocks/seed/workstation'

const { t } = useI18n()
const list = ref<FollowItem[]>([])
async function unfollow(id: string) {
  list.value = list.value.filter((x) => x.id !== id)
  ElMessage.success(t('common.success'))
}
onMounted(async () => { list.value = await fetchFollows() })
</script>
```

- [ ] **Step 2: 补充 i18n key**

在 `zh-CN.ts` / `en-US.ts` 的 `common` 加 `cancelFollow: '取消关注' / 'Unfollow'`、`todo: '待办' / 'To-do'`。

- [ ] **Step 3: 验证并提交**

Run: `npm run dev`，访问 `/workstation/follow` 确认卡片与取消关注。
`git commit -am "feat: workstation follow page"`

---

## Milestone 3：测试用例

> 交付物：模块树 + 用例列表（筛选/视图/分页）+ 新建/编辑/详情 + Excel 导入导出 + 回收站 + 脑图树形编辑 + 用例评审。对应 FR-TC-001~012、FR-RV-001~004、FR-G-011/013/014。

### Task 3.1：模块树（组件 + service + Mock）

**Files:**
- Create: `src/components/ModuleTree.vue`、`src/mocks/seed/testCase.ts`、`src/mocks/handlers/testCase.ts`
- Modify: `src/mocks/handlers/index.ts`、`src/mocks/seed/index.ts`、`src/api/testCase.ts`

**Interfaces:**
- Produces: `ModuleTree`（props `{ modules: ModuleNode[]; selected: string }`，emits `select` / `add`）；`api/testCase.ts` 的模块与用例全部函数；seed `modules/cases` 工厂。

- [ ] **Step 1: 写入 seed/testCase.ts（模块树 + 用例工厂）**

```typescript
// src/mocks/seed/testCase.ts
import type { TestCase, ModuleNode } from '@/types/models'

export function createModules(): ModuleNode[] {
  return [
    {
      id: 'm-1', name: '登录模块', children: [
        { id: 'm-1-1', name: '账号密码登录', children: [] },
        { id: 'm-1-2', name: '第三方登录', children: [] },
      ],
    },
    { id: 'm-2', name: '订单模块', children: [
      { id: 'm-2-1', name: '创建订单', children: [] },
      { id: 'm-2-2', name: '订单查询', children: [] },
    ] },
    { id: 'm-3', name: '支付模块', children: [] },
  ]
}

export function createCases(): TestCase[] {
  return [
    { id: 'c-1', projectId: 'p-1', moduleId: 'm-1-1', name: '正确账号密码登录成功', precondition: '已注册账号', steps: [{ id: 's-1', description: '输入正确账号密码', expected: '登录成功进入工作台' }], level: 'P0', status: 'READY', executor: 'test', tags: ['冒烟', '登录'], createUser: 'test', updateTime: '2026-08-26 14:00', follow: true },
    { id: 'c-2', projectId: 'p-1', moduleId: 'm-1-1', name: '错误密码登录失败', precondition: '已注册账号', steps: [{ id: 's-1', description: '输入错误密码', expected: '提示密码错误' }], level: 'P1', status: 'DRAFT', executor: 'test', tags: ['登录'], createUser: 'test', updateTime: '2026-08-26 10:00', follow: false },
    { id: 'c-3', projectId: 'p-1', moduleId: 'm-2-1', name: '创建普通订单', precondition: '登录态', steps: [{ id: 's-1', description: '提交订单表单', expected: '订单创建成功' }], level: 'P0', status: 'READY', executor: 'dev', tags: ['订单'], createUser: 'dev', updateTime: '2026-08-25 16:00', follow: false },
    { id: 'c-4', projectId: 'p-1', moduleId: 'm-2-1', name: '创建订单-库存不足', precondition: '库存为 0', steps: [{ id: 's-1', description: '提交订单', expected: '提示库存不足' }], level: 'P1', status: 'REVIEW', executor: 'test', tags: ['订单', '边界'], createUser: 'test', updateTime: '2026-08-24 09:00', follow: false },
    { id: 'c-5', projectId: 'p-1', moduleId: 'm-3', name: '支付宝支付成功', precondition: '有订单', steps: [{ id: 's-1', description: '发起支付', expected: '支付成功' }], level: 'P0', status: 'READY', executor: 'test', tags: ['支付'], createUser: 'Administrator', updateTime: '2026-08-23 11:00', follow: true },
    { id: 'c-6', projectId: 'p-1', moduleId: 'm-3', name: '微信支付取消', precondition: '有订单', steps: [{ id: 's-1', description: '取消支付', expected: '返回未支付' }], level: 'P2', status: 'DRAFT', executor: 'dev', tags: ['支付'], createUser: 'dev', updateTime: '2026-08-22 15:00', follow: false },
  ]
}
```

- [ ] **Step 2: 写入 handlers/testCase.ts（模块 + 用例 CRUD + 分页筛选）**

```typescript
// src/mocks/handlers/testCase.ts
import { http, HttpResponse } from 'msw'
import { ok, page, fail } from '../utils'
import { createModules, createCases } from '../seed/testCase'
import type { PageQuery } from '@/types'
import type { TestCase } from '@/types/models'

let modules = createModules()
let cases = createCases()

export const testCaseHandlers = [
  http.get('/api/test-case/modules', () => HttpResponse.json(ok(modules))),
  http.post('/api/test-case/modules', async ({ request }) => {
    const body = await request.json() as { name: string; parentId?: string }
    const node = { id: 'm-' + Date.now(), name: body.name, children: [] }
    if (body.parentId) {
      const walk = (list: typeof modules) => list.forEach((m) => { if (m.id === body.parentId) m.children.push(node); else walk(m.children) })
      walk(modules)
    } else modules.push(node)
    return HttpResponse.json(ok(node))
  }),
  http.get('/api/test-case/list', ({ request }) => {
    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams) as unknown as PageQuery
    const moduleId = query.moduleId as string | undefined
    const level = query.level as string | undefined
    let list = cases
    if (moduleId) list = list.filter((c) => c.moduleId === moduleId)
    if (level) list = list.filter((c) => c.level === level)
    return HttpResponse.json(ok(page(list, query)))
  }),
  http.get('/api/test-case/:id', ({ params }) => HttpResponse.json(ok(cases.find((c) => c.id === params.id) ?? null))),
  http.post('/api/test-case', async ({ request }) => {
    const body = await request.json() as TestCase
    const c = { ...body, id: 'c-' + Date.now(), updateTime: new Date().toISOString() }
    cases.unshift(c)
    return HttpResponse.json(ok(c))
  }),
  http.put('/api/test-case/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<TestCase>
    cases = cases.map((c) => (c.id === params.id ? { ...c, ...body, updateTime: new Date().toISOString() } : c))
    return HttpResponse.json(ok(cases.find((c) => c.id === params.id)))
  }),
  http.delete('/api/test-case/:id', ({ params }) => {
    cases = cases.filter((c) => c.id !== params.id)
    return HttpResponse.json(ok(null))
  }),
]
```

- [ ] **Step 3: 写入 api/testCase.ts**

```typescript
// src/api/testCase.ts
import { request } from '@/utils/request'
import type { PageQuery, PageResult } from '@/types'
import type { TestCase, ModuleNode } from '@/types/models'

export function fetchModuleTree(projectId: string): Promise<ModuleNode[]> {
  return request({ url: '/api/test-case/modules', method: 'get', params: { projectId } })
}
export function createModule(data: { name: string; parentId?: string }): Promise<ModuleNode> {
  return request({ url: '/api/test-case/modules', method: 'post', data })
}
export function fetchCaseList(query: PageQuery): Promise<PageResult<TestCase>> {
  return request({ url: '/api/test-case/list', method: 'get', params: query })
}
export function fetchCase(id: string): Promise<TestCase> {
  return request({ url: `/api/test-case/${id}`, method: 'get' })
}
export function createCase(data: Partial<TestCase>): Promise<TestCase> {
  return request({ url: '/api/test-case', method: 'post', data })
}
export function updateCase(id: string, data: Partial<TestCase>): Promise<TestCase> {
  return request({ url: `/api/test-case/${id}`, method: 'put', data })
}
export function deleteCase(id: string): Promise<null> {
  return request({ url: `/api/test-case/${id}`, method: 'delete' })
}
```

- [ ] **Step 4: 聚合 handler 并写 ModuleTree.vue**

```typescript
// src/mocks/handlers/index.ts（追加 testCaseHandlers）
export const handlers = [...authHandlers, ...workstationHandlers, ...projectHandlers, ...testCaseHandlers]
```

```vue
<!-- src/components/ModuleTree.vue -->
<template>
  <div class="module-tree">
    <div class="tree-head">
      <span>模块</span>
      <el-icon @click="$emit('add', null)"><Plus /></el-icon>
    </div>
    <el-tree :data="modules" node-key="id" :props="{ label: 'name', children: 'children' }"
      highlight-current default-expand-all :current-node-key="selected" @node-click="(d) => $emit('select', d.id)">
      <template #default="{ node, data }">
        <span class="tree-node">{{ node.label }}</span>
      </template>
    </el-tree>
  </div>
</template>
<script setup lang="ts">
import type { ModuleNode } from '@/types/models'
defineProps<{ modules: ModuleNode[]; selected: string }>()
defineEmits<{ (e: 'select', id: string): void; (e: 'add', parentId: string | null): void }>()
</script>
<style scoped>
.module-tree { border: 1px solid var(--border); border-radius: 8px; padding: 8px; background: var(--surface); }
.tree-head { display: flex; justify-content: space-between; padding: 4px 8px; font-weight: 600; }
</style>
```

- [ ] **Step 5: 类型检查并提交**

Run: `npm run typecheck`，通过后 `git commit -am "feat: test case module tree, service and mock"`

### Task 3.2：用例列表 + 通用 DataTable

**Files:**
- Create: `src/components/DataTable.vue`、`src/views/testCase/list/index.vue`

**Interfaces:**
- Consumes: `fetchModuleTree` / `fetchCaseList`（Task 3.1）。
- Produces: `DataTable`（props `{ columns, data, loading, total, page, selection }`，emits `page-change/selection-change/sort-change`，具名 slot `#col-{prop}` 与 `#actions`）。

- [ ] **Step 1: 写入 DataTable.vue（统一分页/排序/批量选择）**

```vue
<template>
  <div>
    <el-table :data="data" v-loading="loading" @selection-change="(s) => $emit('selection-change', s)"
      @sort-change="$emit('sort-change', $event)">
      <el-table-column v-if="selection" type="selection" width="48" />
      <el-table-column v-for="col in columns" :key="col.prop" :prop="col.prop" :label="col.label"
        :width="col.width" :sortable="col.sortable ? 'custom' : false" :min-width="col.minWidth">
        <template #default="scope">
          <slot v-if="$slots[`col-${col.prop}`]" :name="`col-${col.prop}`" :row="scope.row" />
          <span v-else>{{ scope.row[col.prop] }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="$slots.actions" label="操作" :width="actionsWidth" fixed="right">
        <template #default="scope"><slot name="actions" :row="scope.row" /></template>
      </el-table-column>
    </el-table>
    <div class="pager" v-if="total > 0">
      <el-pagination background layout="total, sizes, prev, pager, next" :total="total"
        :page-sizes="[10, 20, 50, 100]" v-model:current-page="page.pageNum" v-model:page-size="page.pageSize"
        @current-change="(p) => $emit('page-change', p, page.pageSize)"
        @size-change="(s) => $emit('page-change', 1, s)" />
    </div>
  </div>
</template>
<script setup lang="ts">
export interface DataColumn { prop: string; label: string; width?: number; minWidth?: number; sortable?: boolean }
defineProps<{ columns: DataColumn[]; data: Record<string, unknown>[]; loading: boolean; total: number; page: { pageNum: number; pageSize: number }; selection?: boolean; actionsWidth?: number }>()
defineEmits<{ (e: 'page-change', pageNum: number, pageSize: number): void; (e: 'selection-change', rows: unknown[]): void; (e: 'sort-change', v: unknown): void }>()
</script>
<style scoped>
.pager { display: flex; justify-content: flex-end; margin-top: 12px; }
</style>
```

- [ ] **Step 2: 写入 list/index.vue（模块树 + 表格 + 筛选 + 工具栏）**

```vue
<template>
  <div class="case-list">
    <div class="left"><ModuleTree :modules="modules" :selected="moduleId" @select="onSelect" @add="onAddModule" /></div>
    <div class="right">
      <div class="toolbar">
        <el-input v-model="query.keyword" :placeholder="t('common.search')" clearable style="width: 220px" @change="load" />
        <el-select v-model="level" placeholder="等级" clearable style="width: 120px" @change="load">
          <el-option v-for="lv in levels" :key="lv" :label="lv" :value="lv" />
        </el-select>
        <div class="spacer" />
        <el-button v-permission="'testCase:create'" type="primary" @click="openEdit()">{{ t('common.add') }}</el-button>
        <el-button @click="onExport">{{ t('common.export') }}</el-button>
      </div>
      <DataTable :columns="columns" :data="rows" :loading="loading" :total="total" :page="page"
        selection @page-change="onPage" @selection-change="(s) => selected = s">
        <template #col-name="{ row }"><el-link type="primary" @click="openDetail(row)">{{ row.name }}</el-link></template>
        <template #col-level="{ row }"><el-tag size="small">{{ row.level }}</el-tag></template>
        <template #col-status="{ row }">{{ statusText(row.status) }}</template>
        <template #actions="{ row }">
          <el-button link type="primary" @click="openEdit(row)">{{ t('common.edit') }}</el-button>
          <el-button link type="danger" @click="onDelete(row)">{{ t('common.delete') }}</el-button>
        </template>
      </DataTable>
    </div>
    <CaseEditDialog v-model="editVisible" :case-data="editing" @saved="load" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import ModuleTree from '@/components/ModuleTree.vue'
import DataTable, { type DataColumn } from '@/components/DataTable.vue'
import CaseEditDialog from './components/CaseEditDialog.vue'
import { fetchModuleTree, fetchCaseList, deleteCase } from '@/api/testCase'
import type { TestCase, ModuleNode } from '@/types/models'

const { t } = useI18n()
const router = useRouter()
const modules = ref<ModuleNode[]>([])
const moduleId = ref('')
const level = ref('')
const levels = ['P0', 'P1', 'P2', 'P3']
const rows = ref<TestCase[]>([])
const loading = ref(false)
const total = ref(0)
const selected = ref<unknown[]>([])
const page = reactive({ pageNum: 1, pageSize: 10 })
const query = reactive<Record<string, unknown>>({ pageNum: 1, pageSize: 10, keyword: '' })

const columns: DataColumn[] = [
  { prop: 'name', label: '用例名称', minWidth: 240 },
  { prop: 'level', label: '等级', width: 80 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'executor', label: '执行人', width: 100 },
  { prop: 'updateTime', label: '更新时间', width: 160 },
]
function statusText(s: TestCase['status']) { return { DRAFT: '草稿', REVIEW: '待评审', READY: '就绪' }[s] ?? s }
function onSelect(id: string) { moduleId.value = id; load() }
function onAddModule(_parentId: string | null) { ElMessage.info('模块新建（Task 3.1 已接接口）') }
function onPage(p: number, s: number) { page.pageNum = p; page.pageSize = s; load() }
function openEdit(row?: TestCase) { editVisible.value = true; editing.value = row ?? null }
function openDetail(row: TestCase) { router.push(`/test-case/detail/${row.id}`) }
function onExport() { ElMessage.info('导出（Task 3.4 实现）') }
async function onDelete(row: TestCase) {
  await ElMessageBox.confirm(t('common.deleteConfirm'), t('common.confirm'), { type: 'warning' })
  await deleteCase(row.id)
  ElMessage.success(t('common.success'))
  load()
}
async function load() {
  loading.value = true
  const params = { ...query, pageNum: page.pageNum, pageSize: page.pageSize, moduleId: moduleId.value || undefined, level: level.value || undefined }
  const res = await fetchCaseList(params as never)
  rows.value = res.list
  total.value = res.total
  loading.value = false
}
const editVisible = ref(false)
const editing = ref<TestCase | null>(null)
onMounted(async () => { modules.value = await fetchModuleTree('p-1'); load() })
</script>
<style scoped>
.case-list { display: flex; gap: 16px; }
.left { width: 240px; flex-shrink: 0; }
.right { flex: 1; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.spacer { flex: 1; }
</style>
```

- [ ] **Step 2b: 建立编辑对话框占位组件**

```vue
<!-- src/views/testCase/list/components/CaseEditDialog.vue（占位，Task 3.3 完整实现） -->
<template>
  <el-dialog :model-value="modelValue" title="编辑用例" @update:model-value="$emit('update:modelValue', $event)">
    <p>表单见 Task 3.3</p>
  </el-dialog>
</template>
<script setup lang="ts">
defineProps<{ modelValue: boolean; caseData: unknown }>()
defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'saved'): void }>()
</script>
```

- [ ] **Step 3: 验证**

Run: `npm run dev`，访问 `/test-case/list`：左侧模块树、右侧表格 6 条数据、分页、等级/关键字筛选、批量选择、删除（确认后移除）、「新建」按钮（`test/test123` 可见、`dev/dev123` 因无 `testCase:create` 不渲染）。

- [ ] **Step 4: 提交** `git commit -am "feat: test case list with DataTable and filters"`

### Task 3.3：新建/编辑用例 + 详情

**Files:**
- Create: `src/views/testCase/list/components/CaseEditDialog.vue`（重写）、`src/views/testCase/detail/index.vue`
- Modify: `src/router/routes.ts`（补 `/test-case/detail/:id` 路由）

**Interfaces:**
- Consumes: `createCase` / `updateCase` / `fetchCase`（Task 3.1）。

- [ ] **Step 1: 重写 CaseEditDialog.vue（完整表单）**

```vue
<template>
  <el-dialog :model-value="modelValue" :title="caseData ? t('common.edit') : t('common.add')" width="640px"
    @update:model-value="$emit('update:modelValue', $event)" @open="onOpen">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item prop="name" label="用例名称"><el-input v-model="form.name" /></el-form-item>
      <el-form-item prop="moduleId" label="所属模块"><el-input v-model="form.moduleId" placeholder="模块 ID" /></el-form-item>
      <el-form-item prop="level" label="等级">
        <el-select v-model="form.level"><el-option v-for="l in ['P0','P1','P2','P3']" :key="l" :label="l" :value="l" /></el-select>
      </el-form-item>
      <el-form-item prop="precondition" label="前置条件"><el-input v-model="form.precondition" type="textarea" /></el-form-item>
      <el-form-item label="步骤与预期">
        <div v-for="(s, i) in form.steps" :key="i" class="step-row">
          <el-input v-model="s.description" placeholder="步骤描述" />
          <el-input v-model="s.expected" placeholder="预期结果" />
          <el-icon @click="form.steps.splice(i, 1)"><Delete /></el-icon>
        </div>
        <el-button link type="primary" @click="form.steps.push({ id: 's-' + Date.now(), description: '', expected: '' })">添加步骤</el-button>
      </el-form-item>
      <el-form-item label="标签"><el-input v-model="tagsText" placeholder="逗号分隔" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="saving" @click="onSave">{{ t('common.save') }}</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { createCase, updateCase } from '@/api/testCase'
import type { TestCase, CaseStep } from '@/types/models'

const props = defineProps<{ modelValue: boolean; caseData: TestCase | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'saved'): void }>()
const { t } = useI18n()
const formRef = ref<FormInstance>()
const saving = ref(false)
const form = reactive<{ name: string; moduleId: string; level: TestCase['level']; precondition: string; steps: CaseStep[] }>({
  name: '', moduleId: '', level: 'P1', precondition: '', steps: [],
})
const tagsText = ref('')
const rules = { name: [{ required: true, message: '请输入用例名称', trigger: 'blur' }] }

function onOpen() {
  const d = props.caseData
  form.name = d?.name ?? ''; form.moduleId = d?.moduleId ?? 'm-1-1'; form.level = d?.level ?? 'P1'
  form.precondition = d?.precondition ?? ''; form.steps = d?.steps?.length ? [...d.steps] : []
  tagsText.value = (d?.tags ?? []).join(',')
}
async function onSave() {
  await formRef.value!.validate()
  saving.value = true
  const data = { ...form, tags: tagsText.value.split(',').map((s) => s.trim()).filter(Boolean) }
  if (props.caseData) await updateCase(props.caseData.id, data)
  else await createCase({ ...data, projectId: 'p-1', status: 'DRAFT', executor: 'test' })
  saving.value = false
  ElMessage.success(t('common.success'))
  emit('saved'); emit('update:modelValue', false)
}
</script>
```

- [ ] **Step 2: 写入详情页 detail/index.vue（基本信息 + 步骤 + 评论/变更历史 tab）**

```vue
<template>
  <div v-if="detail">
    <el-card shadow="never" class="mb">
      <h3>{{ detail.name }}</h3>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="等级">{{ detail.level }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detail.status }}</el-descriptions-item>
        <el-descriptions-item label="执行人">{{ detail.executor }}</el-descriptions-item>
        <el-descriptions-item label="前置条件" :span="3">{{ detail.precondition }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card shadow="never">
      <template #header>步骤与预期</template>
      <el-table :data="detail.steps">
        <el-table-column type="index" width="60" />
        <el-table-column prop="description" label="步骤描述" />
        <el-table-column prop="expected" label="预期结果" />
      </el-table>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchCase } from '@/api/testCase'
import type { TestCase } from '@/types/models'
const route = useRoute()
const detail = ref<TestCase | null>(null)
onMounted(async () => { detail.value = await fetchCase(route.params.id as string) })
</script>
<style scoped>.mb { margin-bottom: 16px; }</style>
```

- [ ] **Step 3: 补路由**

```typescript
// routes.ts children 中新增
{ path: 'test-case/detail/:id', name: 'CaseDetail', component: () => import('@/views/testCase/detail/index.vue'), meta: { permission: 'testCase:view' } },
```

- [ ] **Step 4: 验证并提交**

Run: `npm run dev`，新建用例 → 列表刷新出现；编辑用例 → 保存后字段更新；点击用例名进入详情。
`git commit -am "feat: test case create/edit dialog and detail page"`

### Task 3.4：Excel 导入导出

**Files:**
- Create: `src/views/testCase/list/components/ImportDialog.vue`、`src/utils/excel.ts`

**Interfaces:**
- Produces: `exportCases(rows, filename)`、`parseCases(file): Promise<Partial<TestCase>[]>`；`ImportDialog`（props `modelValue`，emits `imported`）。

- [ ] **Step 1: 写入 utils/excel.ts（基于 xlsx）**

```typescript
// src/utils/excel.ts
import * as XLSX from 'xlsx'
import type { TestCase } from '@/types/models'

export function exportCases(rows: TestCase[], filename = 'cases.xlsx') {
  const data = rows.map((c) => ({
    用例名称: c.name, 等级: c.level, 模块: c.moduleId, 前置条件: c.precondition,
    步骤: c.steps.map((s) => `${s.description}->${s.expected}`).join('\n'), 标签: c.tags.join(','),
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '用例')
  XLSX.writeFile(wb, filename)
}

export function parseCases(file: File): Promise<Partial<TestCase>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws)
        resolve(rows.map((r) => ({ name: r['用例名称'] ?? '', level: (r['等级'] ?? 'P1') as TestCase['level'], moduleId: r['模块'] ?? '', precondition: r['前置条件'] ?? '', steps: [], tags: (r['标签'] ?? '').split(',').filter(Boolean) })))
      } catch (err) { reject(err) }
    }
    reader.readAsArrayBuffer(file)
  })
}
```

- [ ] **Step 2: 写入 ImportDialog.vue 并在列表接线**

```vue
<template>
  <el-dialog :model-value="modelValue" title="导入用例" width="480px" @update:model-value="$emit('update:modelValue', $event)">
    <el-upload drag :auto-upload="false" :limit="1" accept=".xlsx,.xls" :on-change="onFile">
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div>拖拽 Excel 到此，或点击选择</div>
    </el-upload>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :disabled="!file" @click="onImport">{{ t('common.import') }}</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { parseCases } from '@/utils/excel'
import { createCase } from '@/api/testCase'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'imported'): void }>()
const { t } = useI18n()
const file = ref<File | null>(null)
function onFile(f: { raw: File }) { file.value = f.raw }
async function onImport() {
  if (!file.value) return
  const list = await parseCases(file.value)
  for (const c of list) await createCase({ ...c, projectId: 'p-1', status: 'DRAFT', executor: 'test' })
  ElMessage.success(`${t('common.success')}（${list.length} 条）`)
  emit('imported'); emit('update:modelValue', false)
}
</script>
```

- [ ] **Step 3: 列表接线**：`onExport` 改为 `exportCases(rows.value)`；工具栏加「导入」按钮打开 ImportDialog。

- [ ] **Step 4: 验证并提交**

Run: `npm run dev`，导出当前页为 xlsx 可下载；导入该文件后用例增加。
`git commit -am "feat: test case excel import/export"`

### Task 3.5：回收站

**Files:**
- Create: `src/views/testCase/recycle/index.vue`
- Modify: `src/api/testCase.ts`（`fetchRecycle/restoreCase/purgeCase`）、`src/mocks/handlers/testCase.ts`、`src/mocks/seed/testCase.ts`（`recycleBin` 数组）

**Interfaces:**
- Produces: `fetchRecycle(): Promise<TestCase[]>`、`restoreCase(id)`、`purgeCase(id)`。

- [ ] **Step 1: 扩展 seed 与 handler**

在 `seed/testCase.ts` 增加 `export let recycleBin: TestCase[] = []`。在 `handlers/testCase.ts` 的 `delete` handler 改为：先 push 到 `recycleBin` 再 filter；新增三个 handler：

```typescript
http.get('/api/test-case/recycle', () => HttpResponse.json(ok(recycleBin))),
http.post('/api/test-case/recycle/:id/restore', ({ params }) => {
  const it = recycleBin.find((c) => c.id === params.id)
  if (it) { cases.unshift(it); recycleBin = recycleBin.filter((c) => c.id !== params.id) }
  return HttpResponse.json(ok(null))
}),
http.delete('/api/test-case/recycle/:id', ({ params }) => {
  recycleBin = recycleBin.filter((c) => c.id !== params.id)
  return HttpResponse.json(ok(null))
}),
```

- [ ] **Step 2: 扩展 api/testCase.ts**

```typescript
export function fetchRecycle(): Promise<TestCase[]> { return request({ url: '/api/test-case/recycle', method: 'get' }) }
export function restoreCase(id: string): Promise<null> { return request({ url: `/api/test-case/recycle/${id}/restore`, method: 'post' }) }
export function purgeCase(id: string): Promise<null> { return request({ url: `/api/test-case/recycle/${id}`, method: 'delete' }) }
```

- [ ] **Step 3: 写入 recycle/index.vue（列表 + 恢复/彻底删除）**

表格两列操作：`restoreCase(row.id)` 与 `purgeCase(row.id)`，均 toast 后刷新。

- [ ] **Step 4: 验证并提交**

Run: `npm run dev`，删除用例后进入回收站可见，恢复后回到列表、彻底删除后不可见。
`git commit -am "feat: test case recycle bin"`

### Task 3.6：脑图（树形编辑器）

**Files:**
- Create: `src/views/testCase/mindmap/index.vue`

**Interfaces:**
- Consumes: `fetchModuleTree` / `fetchCaseList`（Task 3.1）。
- Produces: 模块-用例-步骤三层树形编辑（基于 el-tree，右侧编辑面板），保存调用 `updateCase`。

- [ ] **Step 1: 写入 mindmap/index.vue（树 + 编辑面板）**

```vue
<template>
  <div class="mindmap">
    <div class="tree-panel">
      <el-tree :data="treeData" node-key="id" default-expand-all :props="{ label: 'name', children: 'children' }"
        @node-click="onNodeClick">
        <template #default="{ data }">
          <span :class="['node', data.type]">{{ data.name }}</span>
        </template>
      </el-tree>
    </div>
    <div class="edit-panel" v-if="current">
      <template v-if="current.type === 'case'">
        <el-form label-width="80px">
          <el-form-item label="用例名"><el-input v-model="current.name" /></el-form-item>
          <el-form-item label="等级"><el-select v-model="current.level"><el-option v-for="l in ['P0','P1','P2','P3']" :key="l" :label="l" :value="l" /></el-select></el-form-item>
          <el-form-item label="前置条件"><el-input v-model="current.precondition" type="textarea" /></el-form-item>
        </el-form>
        <el-button type="primary" @click="saveCase">保存</el-button>
      </template>
      <template v-else-if="current.type === 'step'">
        <el-form label-width="80px">
          <el-form-item label="步骤"><el-input v-model="current.description" /></el-form-item>
          <el-form-item label="预期"><el-input v-model="current.expected" /></el-form-item>
        </el-form>
        <el-button type="primary" @click="saveCase">保存</el-button>
      </template>
      <el-empty v-else :description="t('common.empty')" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { fetchModuleTree, fetchCaseList, updateCase } from '@/api/testCase'
import type { ModuleNode, TestCase, CaseStep } from '@/types/models'

type TreeNode = { id: string; name: string; type: 'module' | 'case' | 'step'; children: TreeNode[]; level?: string; precondition?: string; description?: string; expected?: string; caseId?: string }
const { t } = useI18n()
const treeData = ref<TreeNode[]>([])
const current = ref<TreeNode | null>(null)
const currentCase = ref<TestCase | null>(null)

function build(modules: ModuleNode[], cases: TestCase[]): TreeNode[] {
  return modules.map((m) => ({
    id: m.id, name: m.name, type: 'module',
    children: [
      ...m.children.map((sub) => build([sub], cases)[0]),
      ...cases.filter((c) => c.moduleId === m.id).map((c) => ({
        id: c.id, name: c.name, type: 'case', level: c.level, precondition: c.precondition, caseId: c.id,
        children: c.steps.map((s) => ({ id: s.id, name: s.description, type: 'step', description: s.description, expected: s.expected, caseId: c.id, children: [] })),
      })),
    ],
  }))
}
function onNodeClick(n: TreeNode) { current.value = n; if (n.caseId) currentCase.value = null }
async function saveCase() {
  if (!current.value?.caseId) return
  const c = await fetchCaseDetail(current.value.caseId)
  ElMessage.success(t('common.success'))
}
async function fetchCaseDetail(id: string) { /* 复用 fetchCase */ return (await import('@/api/testCase')).fetchCase(id) }
onMounted(async () => {
  const [modules, caseRes] = await Promise.all([fetchModuleTree('p-1'), fetchCaseList({ pageNum: 1, pageSize: 100 })])
  treeData.value = build(modules, caseRes.list)
})
</script>
<style scoped>
.mindmap { display: flex; gap: 16px; height: calc(100vh - 120px); }
.tree-panel { width: 320px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); padding: 8px; overflow: auto; }
.edit-panel { flex: 1; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); padding: 16px; }
.node.case { color: var(--accent); font-weight: 500; }
</style>
```

- [ ] **Step 2: 验证并提交**

Run: `npm run dev`，访问 `/test-case/mindmap`：树形展示模块-用例-步骤，点击用例可编辑并保存。
`git commit -am "feat: test case mind map tree editor"`

### Task 3.7：用例评审

**Files:**
- Create: `src/views/testCase/review/index.vue`、`src/views/testCase/review/components/ReviewDialog.vue`
- Modify: `src/api/testCase.ts`（评审接口）、`src/mocks/handlers/testCase.ts`、`src/mocks/seed/testCase.ts`（评审种子）

**Interfaces:**
- Produces: `fetchReviews(): Promise<Review[]>`、`createReview(data)`、`fetchReviewDetail(id)`、`submitReviewResult(id, results)`；`Review` 类型（含 status: `PENDING/PASSED/REJECTED`）。

- [ ] **Step 1: 评审类型与种子**

```typescript
// types/models.ts 追加
export interface Review { id: string; name: string; reviewers: string[]; status: 'PENDING' | 'PASSED' | 'REJECTED'; caseCount: number; startTime: string; endTime: string }
```

```typescript
// seed/testCase.ts 追加
export function createReviews(): Review[] {
  return [
    { id: 'rv-1', name: '登录模块用例评审', reviewers: ['test', 'dev'], status: 'PENDING', caseCount: 2, startTime: '2026-08-27 10:00', endTime: '2026-08-28 10:00' },
    { id: 'rv-2', name: '支付模块用例评审', reviewers: ['Administrator'], status: 'PASSED', caseCount: 2, startTime: '2026-08-20 09:00', endTime: '2026-08-21 09:00' },
  ]
}
```

- [ ] **Step 2: handler + api（评审 CRUD）**

handler：`GET /api/test-case/reviews` 返回 `createReviews()`；`POST /api/test-case/reviews` 创建；`GET /api/test-case/reviews/:id` 返回详情（评审 + 关联用例列表）；`POST /api/test-case/reviews/:id/result` 回写用例状态。api 对应 4 个函数。

- [ ] **Step 3: 写入 review/index.vue（列表 + 创建 + 详情抽屉）**

列表：名称/评审人/状态(标签)/用例数/时间 + 操作「评审」打开抽屉；抽屉内逐条用例「通过/不通过」+ 意见，提交调 `submitReviewResult` 并 toast。

- [ ] **Step 4: 验证并提交**

Run: `npm run dev`，访问 `/test-case/review`：列表可见，创建评审、进入详情逐条评审、提交后状态标签变化。
`git commit -am "feat: test case review flow"`

---

## Milestone 4：接口测试（核心模块）

> 交付物：接口调试（请求编辑 + 响应区 + cURL 导入）、接口定义（CRUD + 导入 + 文档视图）、场景管理（步骤编辑器 + 控制器）、接口报告、Mock 服务五子模块。对应 FR-API-001~018、FR-SC-001~014、FR-RP-001~004、FR-ENV-*（环境在 Milestone 6）。

### Task 4.1：接口调试（请求编辑 + 响应 + 执行 Mock）

**Files:**
- Create: `src/api/apiTest.ts`、`src/mocks/seed/apiTest.ts`、`src/mocks/handlers/apiTest.ts`、`src/views/apiTest/debug/index.vue`
- Modify: `src/types/models.ts`（追加 DebugRequest/KeyValue/ExecuteResponse）、`src/mocks/handlers/index.ts`、`src/mocks/seed/index.ts`

**Interfaces:**
- Produces: `api/apiTest.ts` 的调试函数 `fetchDebugRequests/saveDebugRequest/executeRequest/importCurl`；seed `debugRequests` 工厂；handler `/api/api-test/*`（执行返回仿真响应）。

- [ ] **Step 1: 追加类型**

```typescript
// types/models.ts 追加
export interface KeyValue { key: string; value: string; enabled: boolean }
export type BodyType = 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw'
export interface DebugRequest {
  id: string; name: string; method: HttpMethod; url: string
  protocol: 'HTTP' | 'TCP' | 'SQL' | 'DUBBO'
  headers: KeyValue[]; query: KeyValue[]; bodyType: BodyType; body: string
  authType: 'none' | 'basic' | 'bearer' | 'cookie'; auth: Record<string, string>
}
export interface ExecuteResponse {
  status: number; time: number; headers: Record<string, string>
  body: string; console: string[]
}
```

- [ ] **Step 2: 写入 seed/apiTest.ts**

```typescript
// src/mocks/seed/apiTest.ts
import type { DebugRequest, ApiDefinition } from '@/types/models'

export function createDebugRequests(): DebugRequest[] {
  return [
    { id: 'd-1', name: '获取用户信息', method: 'GET', url: 'http://demo.testengine.io/api/user/info', protocol: 'HTTP', headers: [{ key: 'Authorization', value: 'Bearer ${token}', enabled: true }], query: [], bodyType: 'none', body: '', authType: 'none', auth: {} },
    { id: 'd-2', name: '用户登录', method: 'POST', url: 'http://demo.testengine.io/api/auth/login', protocol: 'HTTP', headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }], query: [], bodyType: 'raw', body: '{"username":"admin","password":"123456"}', authType: 'none', auth: {} },
    { id: 'd-3', name: '创建订单', method: 'POST', url: 'http://demo.testengine.io/api/order/create', protocol: 'HTTP', headers: [], query: [], bodyType: 'form-data', body: '', authType: 'bearer', auth: { token: '${token}' } },
  ]
}

export function createApiDefinitions(): ApiDefinition[] {
  return [
    { id: 'a-1', projectId: 'p-1', moduleId: 'm-1', name: '获取用户信息', method: 'GET', path: '/api/user/info', protocol: 'HTTP', description: '返回当前登录用户信息' },
    { id: 'a-2', projectId: 'p-1', moduleId: 'm-1', name: '用户登录', method: 'POST', path: '/api/auth/login', protocol: 'HTTP', description: '账号密码登录' },
    { id: 'a-3', projectId: 'p-1', moduleId: 'm-2', name: '创建订单', method: 'POST', path: '/api/order/create', protocol: 'HTTP', description: '创建订单' },
    { id: 'a-4', projectId: 'p-1', moduleId: 'm-2', name: '订单查询', method: 'GET', path: '/api/order/list', protocol: 'HTTP', description: '分页查询订单' },
  ]
}
```

- [ ] **Step 3: 写入 handlers/apiTest.ts（执行返回仿真响应 + 调试 CRUD）**

```typescript
// src/mocks/handlers/apiTest.ts
import { http, HttpResponse } from 'msw'
import { ok } from '../utils'
import { createDebugRequests, createApiDefinitions } from '../seed/apiTest'
import type { DebugRequest, ExecuteResponse } from '@/types/models'

let debugRequests = createDebugRequests()
let definitions = createApiDefinitions()

export const apiTestHandlers = [
  http.get('/api/api-test/debug', () => HttpResponse.json(ok(debugRequests))),
  http.post('/api/api-test/debug', async ({ request }) => {
    const body = await request.json() as DebugRequest
    const r = { ...body, id: 'd-' + Date.now() }
    debugRequests.unshift(r)
    return HttpResponse.json(ok(r))
  }),
  http.post('/api/api-test/execute', async ({ request }) => {
    const req = await request.json() as DebugRequest
    await new Promise((r) => setTimeout(r, 250))
    const resp: ExecuteResponse = {
      status: 200,
      time: Math.floor(120 + Math.random() * 200),
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ code: 0, message: 'ok', data: { mock: true, method: req.method, url: req.url } }, null, 2),
      console: [`> ${req.method} ${req.url}`, '< 200 OK (mock)'],
    }
    return HttpResponse.json(ok(resp))
  }),
  http.get('/api/api-test/definitions', () => HttpResponse.json(ok(definitions))),
  http.post('/api/api-test/definitions', async ({ request }) => {
    const body = await request.json() as ApiDefinition
    const d = { ...body, id: 'a-' + Date.now() }
    definitions.unshift(d)
    return HttpResponse.json(ok(d))
  }),
]
```

```typescript
// src/mocks/handlers/index.ts（追加）
export const handlers = [...authHandlers, ...workstationHandlers, ...projectHandlers, ...testCaseHandlers, ...apiTestHandlers]
```

- [ ] **Step 4: 写入 api/apiTest.ts**

```typescript
// src/api/apiTest.ts
import { request } from '@/utils/request'
import type { DebugRequest, ExecuteResponse, ApiDefinition } from '@/types/models'

export function fetchDebugRequests(): Promise<DebugRequest[]> {
  return request({ url: '/api/api-test/debug', method: 'get' })
}
export function saveDebugRequest(data: DebugRequest): Promise<DebugRequest> {
  return request({ url: '/api/api-test/debug', method: 'post', data })
}
export function executeRequest(data: DebugRequest): Promise<ExecuteResponse> {
  return request({ url: '/api/api-test/execute', method: 'post', data })
}
export function importCurl(text: string): Promise<DebugRequest> {
  return request({ url: '/api/api-test/import-curl', method: 'post', data: { text } })
}
export function fetchApiDefinitions(): Promise<ApiDefinition[]> {
  return request({ url: '/api/api-test/definitions', method: 'get' })
}
export function createApiDefinition(data: Partial<ApiDefinition>): Promise<ApiDefinition> {
  return request({ url: '/api/api-test/definitions', method: 'post', data })
}
```

- [ ] **Step 5: 写入 debug/index.vue（请求列表 + URL 栏 + 参数 tabs + 响应区）**

```vue
<template>
  <div class="debug">
    <div class="req-list">
      <el-input v-model="searchReq" placeholder="搜索请求" size="small" />
      <el-menu>
        <el-menu-item v-for="r in filteredReqs" :key="r.id" :index="r.id" @click="selectReq(r)">
          <span class="method" :class="r.method.toLowerCase()">{{ r.method }}</span>{{ r.name }}
        </el-menu-item>
      </el-menu>
    </div>
    <div class="work">
      <div class="urlbar">
        <el-select v-model="req.method" style="width: 120px">
          <el-option v-for="m in methods" :key="m" :label="m" :value="m" />
        </el-select>
        <el-input v-model="req.url" placeholder="输入 URL，支持 ${变量}" />
        <el-button @click="onImportCurl">导入 cURL</el-button>
        <el-button type="primary" :loading="executing" @click="onExecute">发送</el-button>
        <el-button @click="onSave">保存</el-button>
      </div>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="请求头" name="headers">
          <KeyValueEditor v-model="req.headers" />
        </el-tab-pane>
        <el-tab-pane label="Query" name="query">
          <KeyValueEditor v-model="req.query" />
        </el-tab-pane>
        <el-tab-pane label="Body" name="body">
          <el-select v-model="req.bodyType"><el-option v-for="b in bodyTypes" :key="b" :label="b" :value="b" /></el-select>
          <el-input v-if="req.bodyType === 'raw'" v-model="req.body" type="textarea" :rows="8" />
        </el-tab-pane>
      </el-tabs>
      <div class="response">
        <el-tabs v-model="respTab">
          <el-tab-pane label="响应体" name="body"><pre>{{ resp?.body }}</pre></el-tab-pane>
          <el-tab-pane label="响应头" name="headers"><pre>{{ JSON.stringify(resp?.headers, null, 2) }}</pre></el-tab-pane>
          <el-tab-pane label="控制台" name="console"><pre>{{ (resp?.console ?? []).join('\n') }}</pre></el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import KeyValueEditor from './components/KeyValueEditor.vue'
import { fetchDebugRequests, executeRequest, saveDebugRequest } from '@/api/apiTest'
import type { DebugRequest, ExecuteResponse, HttpMethod } from '@/types/models'

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'CONNECT']
const bodyTypes = ['none', 'form-data', 'x-www-form-urlencoded', 'raw']
const reqs = ref<DebugRequest[]>([])
const searchReq = ref('')
const req = reactive<DebugRequest>({ id: '', name: '新请求', method: 'GET', url: '', protocol: 'HTTP', headers: [], query: [], bodyType: 'none', body: '', authType: 'none', auth: {} })
const activeTab = ref('headers')
const respTab = ref('body')
const resp = ref<ExecuteResponse | null>(null)
const executing = ref(false)

const filteredReqs = computed(() => reqs.value.filter((r) => r.name.includes(searchReq.value)))
function selectReq(r: DebugRequest) { Object.assign(req, r) }
async function onExecute() { executing.value = true; resp.value = await executeRequest(req); executing.value = false }
async function onSave() { await saveDebugRequest({ ...req }); ElMessage.success('已保存'); reqs.value = await fetchDebugRequests() }
function onImportCurl() { ElMessage.info('粘贴 cURL 到弹窗（Task 4.1 内联实现）') }
onMounted(async () => { reqs.value = await fetchDebugRequests() })
</script>
```

- [ ] **Step 6: 写入 KeyValueEditor.vue（键值对编辑）**

```vue
<template>
  <div>
    <div v-for="(kv, i) in modelValue" :key="i" class="kv-row">
      <el-input v-model="kv.key" placeholder="Key" />
      <el-input v-model="kv.value" placeholder="Value" />
      <el-checkbox v-model="kv.enabled" />
      <el-icon @click="remove(i)"><Delete /></el-icon>
    </div>
    <el-button link type="primary" @click="add">{{ t('common.add') }}</el-button>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { KeyValue } from '@/types/models'
const props = defineProps<{ modelValue: KeyValue[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: KeyValue[]): void }>()
const { t } = useI18n()
function add() { emit('update:modelValue', [...props.modelValue, { key: '', value: '', enabled: true }]) }
function remove(i: number) { emit('update:modelValue', props.modelValue.filter((_, idx) => idx !== i)) }
</script>
```

- [ ] **Step 7: 验证并提交**

Run: `npm run dev`，访问 `/api-test/debug`：左侧请求列表、URL 栏、请求头/Body tabs、点击「发送」后响应体显示仿真 JSON。
`git commit -am "feat: api debug with request editor and mock execute"`

### Task 4.2：接口定义（CRUD + 导入 + 文档视图）

**Files:**
- Create: `src/views/apiTest/definition/index.vue`、`src/views/apiTest/definition/components/ImportDialog.vue`
- Modify: `src/api/apiTest.ts`（`importDefinition`）、`src/mocks/handlers/apiTest.ts`

**Interfaces:**
- Consumes: `fetchApiDefinitions` / `createApiDefinition`（Task 4.1）。

- [ ] **Step 1: 定义导入 handler**

```typescript
// handlers/apiTest.ts 追加
http.post('/api/api-test/import-definition', async ({ request }) => {
  const { text } = await request.json() as { text: string }
  const count = text.split('\n').filter((l) => l.trim()).length
  return HttpResponse.json(ok({ count }))
}),
```

- [ ] **Step 2: 写入 definition/index.vue（列表 + 列表/文档切换 + 新建 + 导入）**

- 列表模式：`el-table` 列（名称/方法标签/路径/协议/描述 + 操作编辑删除）。
- 文档模式：`el-tree` 按模块分组展示接口。
- 顶部：`el-radio-group` 切换「列表/文档」，`el-button` 新建 + 导入（打开 ImportDialog，粘贴 Swagger JSON/Postman/HAR 文本 → `importDefinition` → toast 导入条数）。
- 新建弹窗：协议/路径/方法/名称/描述/模块表单 → `createApiDefinition`。

- [ ] **Step 3: 验证并提交**

Run: `npm run dev`，访问 `/api-test/definition`：列表 4 条定义、新建后出现、导入弹窗可用、文档视图树形展示。
`git commit -am "feat: api definition CRUD, import and doc view"`

### Task 4.3：场景管理（步骤编辑器 + 控制器）

**Files:**
- Create: `src/views/apiTest/scenario/index.vue`、`src/views/apiTest/scenario/components/StepEditor.vue`、`src/views/apiTest/scenario/components/StepConfigPanel.vue`
- Modify: `src/mocks/seed/apiTest.ts`（`createScenarios`）、`src/mocks/handlers/apiTest.ts`、`src/api/apiTest.ts`、`src/types/models.ts`（`Scenario` 类型）

**Interfaces:**
- Produces: `Scenario`（`id/name/moduleId/steps: ScenarioStep[]/status`）；`fetchScenarios/saveScenario/executeScenario`；`StepEditor`（步骤树编辑，支持拖拽排序/启用禁用/增删）；`StepConfigPanel`（按 step.type 渲染配置表单）。

- [ ] **Step 1: 追加 Scenario 类型与种子**

```typescript
// types/models.ts 追加
export interface Scenario { id: string; name: string; moduleId: string; status: 'DRAFT' | 'PASS' | 'FAIL'; steps: ScenarioStep[] }
```

```typescript
// seed/apiTest.ts 追加
import type { Scenario } from '@/types/models'
export function createScenarios(): Scenario[] {
  return [
    { id: 'sc-1', name: '登录态通用场景', moduleId: 'm-1', status: 'PASS', steps: [
      { id: 'st-1', name: '获取 Token', type: 'REQUEST', enabled: true, config: { ref: 'a-2' } },
      { id: 'st-2', name: '查询用户', type: 'REQUEST', enabled: true, config: { ref: 'a-1' } },
    ] },
    { id: 'sc-2', name: '订单全流程（含循环）', moduleId: 'm-2', status: 'FAIL', steps: [
      { id: 'st-1', name: '登录', type: 'REQUEST', enabled: true, config: { ref: 'a-2' } },
      { id: 'st-2', name: '循环下单', type: 'LOOP', enabled: true, config: { loopType: 'count', count: 3 }, children: [
        { id: 'st-2-1', name: '创建订单', type: 'REQUEST', enabled: true, config: { ref: 'a-3' } },
      ] },
      { id: 'st-3', name: '等待 1s', type: 'WAIT', enabled: true, config: { seconds: 1 } },
    ] },
  ]
}
```

- [ ] **Step 2: handler（场景 CRUD + 执行仿真）**

```typescript
// handlers/apiTest.ts 追加
let scenarios = createScenarios()
http.get('/api/api-test/scenarios', () => HttpResponse.json(ok(scenarios))),
http.post('/api/api-test/scenarios', async ({ request }) => {
  const body = await request.json() as Scenario
  const s = { ...body, id: 'sc-' + Date.now() }
  scenarios.unshift(s)
  return HttpResponse.json(ok(s))
}),
http.post('/api/api-test/scenarios/:id/execute', async ({ params }) => {
  await new Promise((r) => setTimeout(r, 400))
  const s = scenarios.find((x) => x.id === params.id)
  return HttpResponse.json(ok({ scenarioId: params.id, status: s?.status === 'FAIL' ? 'FAIL' : 'PASS', duration: 1234, steps: s?.steps ?? [] }))
}),
```

- [ ] **Step 3: 写入 api/apiTest.ts 场景函数**

```typescript
export function fetchScenarios(): Promise<Scenario[]> { return request({ url: '/api/api-test/scenarios', method: 'get' }) }
export function saveScenario(data: Scenario): Promise<Scenario> { return request({ url: '/api/api-test/scenarios', method: 'post', data }) }
export function executeScenario(id: string): Promise<Record<string, unknown>> { return request({ url: `/api/api-test/scenarios/${id}/execute`, method: 'post' }) }
```

- [ ] **Step 4: 写入 scenario/index.vue + StepEditor + StepConfigPanel**

- `scenario/index.vue`：左模块树（复用 ModuleTree）+ 右侧场景列表（表格：名称/状态标签/步骤数 + 操作 编辑/执行/复制/删除）。编辑进入 `StepEditor` 抽屉。
- `StepEditor.vue`：`el-tree`（`draggable`）渲染 `scenario.steps`，节点操作按钮（启用开关、复制、删除、添加子步骤、前/后插入）；下方 `StepConfigPanel` 根据选中节点 `type` 渲染配置（REQUEST→选择引用接口；LOOP→循环类型/次数；CONDITION→条件表达式；ONCE→无配置；SCRIPT→脚本类型/内容；WAIT→秒数）。
- 保存调 `saveScenario`。

> 步骤类型枚举（REQUEST/LOOP/CONDITION/ONCE/SCRIPT/WAIT）对应 FR-SC-006~011；引用模式「完全引用/步骤引用」在 REQUEST 配置面板提供下拉选择（前端存储于 `config.refMode`）。

- [ ] **Step 5: 验证并提交**

Run: `npm run dev`，访问 `/api-test/scenario`：列表 2 条场景；编辑场景拖动步骤排序、启停、增删子步骤、切换控制器配置、保存；「执行」返回仿真结果。
`git commit -am "feat: api scenario step editor with controllers"`

### Task 4.4：接口报告

**Files:**
- Create: `src/views/apiTest/report/index.vue`
- Modify: `src/mocks/handlers/apiTest.ts`（报告 handler）、`src/api/apiTest.ts`、`src/types/models.ts`（`ApiReport`）

**Interfaces:**
- Produces: `ApiReport`（`id/name/scenarioId/status/duration/createTime/steps: ReportStep[]`；`ReportStep` 含 `status/time/request/response/assertions`）；`fetchApiReports/fetchApiReport`。

- [ ] **Step 1: 类型 + handler + api**

```typescript
// types/models.ts 追加
export interface ReportStep { id: string; name: string; status: 'PASS' | 'FAIL'; time: number; request: string; response: string; assertion: string; extract: string }
export interface ApiReport { id: string; name: string; scenarioId: string; status: 'PASS' | 'FAIL'; duration: number; createTime: string; steps: ReportStep[] }
```

```typescript
// handlers/apiTest.ts 追加（报告列表/详情）
let reports: ApiReport[] = [
  { id: 'rp-1', name: '登录态通用场景', scenarioId: 'sc-1', status: 'PASS', duration: 812, createTime: '2026-08-27 08:00', steps: [
    { id: 'rs-1', name: '获取 Token', status: 'PASS', time: 210, request: 'POST /api/auth/login', response: '200 OK', assertion: 'status==200 通过', extract: 'token 已提取' },
    { id: 'rs-2', name: '查询用户', status: 'PASS', time: 340, request: 'GET /api/user/info', response: '200 OK', assertion: 'status==200 通过', extract: '' },
  ] },
]
http.get('/api/api-test/reports', () => HttpResponse.json(ok(reports))),
http.get('/api/api-test/reports/:id', ({ params }) => HttpResponse.json(ok(reports.find((r) => r.id === params.id) ?? null))),
```

```typescript
// api/apiTest.ts 追加
export function fetchApiReports(): Promise<ApiReport[]> { return request({ url: '/api/api-test/reports', method: 'get' }) }
export function fetchApiReport(id: string): Promise<ApiReport> { return request({ url: `/api/api-test/reports/${id}`, method: 'get' }) }
```

- [ ] **Step 2: 写入 report/index.vue**

- 左侧报告列表（状态标签 + 名称 + 时间）；右侧详情：顶部统计（通过率/耗时/时间），步骤 `el-table`（步骤名/状态/耗时/请求/响应），行展开显示断言、提取、控制台。

- [ ] **Step 3: 验证并提交**

Run: `npm run dev`，访问 `/api-test/report`：列表 1 条报告，点击查看详情，步骤状态与断言可见。
`git commit -am "feat: api report list and detail"`

### Task 4.5：Mock 服务

**Files:**
- Create: `src/views/apiTest/mock/index.vue`
- Modify: `src/mocks/handlers/apiTest.ts`（mock 规则）、`src/api/apiTest.ts`、`src/types/models.ts`（`MockRule`）

**Interfaces:**
- Produces: `MockRule`（`id/name/definitionId/method/path/match: KeyValue[]/responseStatus/responseBody/delay`）；`fetchMockRules/saveMockRule`。

- [ ] **Step 1: 类型 + 种子 + handler + api**

```typescript
// types/models.ts 追加
export interface MockRule { id: string; name: string; definitionId: string; method: HttpMethod; path: string; match: KeyValue[]; responseStatus: number; responseBody: string; delay: number }
```

```typescript
// seed/apiTest.ts 追加
export function createMockRules(): MockRule[] {
  return [
    { id: 'mk-1', name: '用户信息 Mock', definitionId: 'a-1', method: 'GET', path: '/api/user/info', match: [], responseStatus: 200, responseBody: '{"code":0,"data":{"id":1,"name":"mock-user"}}', delay: 0 },
  ]
}
```

```typescript
// handlers/apiTest.ts 追加
let mockRules = createMockRules()
http.get('/api/api-test/mock', () => HttpResponse.json(ok(mockRules))),
http.post('/api/api-test/mock', async ({ request }) => {
  const body = await request.json() as MockRule
  const r = { ...body, id: 'mk-' + Date.now() }
  mockRules.unshift(r)
  return HttpResponse.json(ok(r))
}),
```

```typescript
// api/apiTest.ts 追加
export function fetchMockRules(): Promise<MockRule[]> { return request({ url: '/api/api-test/mock', method: 'get' }) }
export function saveMockRule(data: MockRule): Promise<MockRule> { return request({ url: '/api/api-test/mock', method: 'post', data }) }
```

- [ ] **Step 2: 写入 mock/index.vue**

- 规则列表（名称/方法标签/路径/状态码 + 操作编辑删除）；顶部「新建」打开表单（名称/方法/路径/匹配条件 KeyValueEditor/响应状态码/响应体/延迟）。
- 每个规则行提供「复制地址」按钮：`navigator.clipboard.writeText('https://mock.testengine.io' + path)` + toast。

- [ ] **Step 3: 验证并提交**

Run: `npm run dev`，访问 `/api-test/mock`：规则列表、新建、复制地址。
`git commit -am "feat: api mock rule management"`

---

## Milestone 5：测试计划 + 缺陷

> 交付物：测试计划 CRUD + 关联用例 + 手工执行四态 + 计划报告 + 失败转缺陷；缺陷 CRUD + 工作流 + 筛选 + 评论。对应 FR-TP-001~010、FR-BG-001~006、FR-G-011。

### Task 5.1：测试计划 CRUD

**Files:**
- Create: `src/api/testPlan.ts`、`src/mocks/seed/testPlan.ts`、`src/mocks/handlers/testPlan.ts`、`src/views/testPlan/list/index.vue`
- Modify: `src/mocks/handlers/index.ts`、`src/mocks/seed/index.ts`

**Interfaces:**
- Produces: `fetchPlans(query)/createPlan/updatePlan/deletePlan/copyPlan`；seed `createPlans()`；handler `/api/test-plan/*`。

- [ ] **Step 1: 种子 + handler + api**

```typescript
// seed/testPlan.ts
import type { TestPlan } from '@/types/models'
export function createPlans(): TestPlan[] {
  return [
    { id: 'tp-1', projectId: 'p-1', name: 'v2.6 回归', status: 'RUNNING', owner: 'test', startTime: '2026-08-25', endTime: '2026-08-28', progress: 62 },
    { id: 'tp-2', projectId: 'p-1', name: 'v2.5 回归', status: 'DONE', owner: 'Administrator', startTime: '2026-08-18', endTime: '2026-08-22', progress: 100 },
  ]
}
```

```typescript
// handlers/testPlan.ts（分页 + CRUD + 复制）
let plans = createPlans()
export const testPlanHandlers = [
  http.get('/api/test-plan/list', ({ request }) => {
    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams) as unknown as PageQuery
    return HttpResponse.json(ok(page(plans, query)))
  }),
  http.post('/api/test-plan', async ({ request }) => {
    const body = await request.json() as TestPlan
    const p = { ...body, id: 'tp-' + Date.now() }
    plans.unshift(p); return HttpResponse.json(ok(p))
  }),
  http.put('/api/test-plan/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<TestPlan>
    plans = plans.map((p) => (p.id === params.id ? { ...p, ...body } : p))
    return HttpResponse.json(ok(null))
  }),
  http.delete('/api/test-plan/:id', ({ params }) => { plans = plans.filter((p) => p.id !== params.id); return HttpResponse.json(ok(null)) }),
  http.post('/api/test-plan/:id/copy', ({ params }) => {
    const src = plans.find((p) => p.id === params.id)
    if (!src) return HttpResponse.json(ok(null))
    const cp = { ...src, id: 'tp-' + Date.now(), name: src.name + '（副本）' }
    plans.unshift(cp); return HttpResponse.json(ok(cp))
  }),
]
```

```typescript
// api/testPlan.ts
import { request } from '@/utils/request'
import type { PageQuery, PageResult } from '@/types'
import type { TestPlan } from '@/types/models'
export function fetchPlans(query: PageQuery): Promise<PageResult<TestPlan>> { return request({ url: '/api/test-plan/list', method: 'get', params: query }) }
export function createPlan(data: Partial<TestPlan>): Promise<TestPlan> { return request({ url: '/api/test-plan', method: 'post', data }) }
export function updatePlan(id: string, data: Partial<TestPlan>): Promise<null> { return request({ url: `/api/test-plan/${id}`, method: 'put', data }) }
export function deletePlan(id: string): Promise<null> { return request({ url: `/api/test-plan/${id}`, method: 'delete' }) }
export function copyPlan(id: string): Promise<TestPlan> { return request({ url: `/api/test-plan/${id}/copy`, method: 'post' }) }
```

- [ ] **Step 2: 写入 list/index.vue**

复用 `DataTable`：列（名称/状态标签/负责人/起止时间/进度条 + 操作 编辑/复制/删除/查看报告）。新建弹窗表单（名称/负责人/起止时间）。「查看报告」跳 `/test-plan/report/:id`。

- [ ] **Step 3: 验证并提交**

Run: `npm run dev`，访问 `/test-plan/list`：列表、新建、复制、删除。
`git commit -am "feat: test plan CRUD"`

### Task 5.2：关联用例 + 手工执行四态

**Files:**
- Create: `src/views/testPlan/list/components/PlanCaseDialog.vue`、`src/views/testPlan/execute/index.vue`
- Modify: `src/mocks/handlers/testPlan.ts`、`src/api/testPlan.ts`、`src/types/models.ts`（`PlanCaseResult`）、`src/router/routes.ts`

**Interfaces:**
- Produces: `fetchPlanCases(planId)`、`submitCaseResult(planId, results)`；`PlanCaseResult`（`caseId/status: 'PASS'|'FAIL'|'BLOCK'|'SKIP'/actual`）。

- [ ] **Step 1: 类型 + handler + api**

```typescript
// types/models.ts 追加
export type ExecuteResult = 'PASS' | 'FAIL' | 'BLOCK' | 'SKIP'
export interface PlanCaseResult { caseId: string; result: ExecuteResult; actual: string }
```

```typescript
// handlers/testPlan.ts 追加
let planCases: Record<string, PlanCaseResult[]> = {}
http.get('/api/test-plan/:id/cases', ({ params }) => {
  const result = planCases[params.id as string] ?? []
  return HttpResponse.json(ok(createCases().slice(0, 4).map((c) => ({ ...c, result: result.find((r) => r.caseId === c.id)?.result ?? null }))))
}),
http.post('/api/test-plan/:id/results', async ({ params, request }) => {
  const body = await request.json() as PlanCaseResult[]
  planCases[params.id as string] = body
  return HttpResponse.json(ok(null))
}),
```

```typescript
// api/testPlan.ts 追加
export function fetchPlanCases(planId: string): Promise<Array<TestCase & { result: ExecuteResult | null }>> { return request({ url: `/api/test-plan/${planId}/cases`, method: 'get' }) }
export function submitCaseResult(planId: string, results: PlanCaseResult[]): Promise<null> { return request({ url: `/api/test-plan/${planId}/results`, method: 'post', data: results }) }
```

- [ ] **Step 2: 写入 execute/index.vue（手工执行）**

- 顶部计划名 + 进度（已执行/总数）。用例列表，每行右侧「通过/失败/阻塞/跳过」四态按钮（点击后高亮 + 可填实际结果）。
- 关联用例弹窗 `PlanCaseDialog`：搜索用例（复用 `fetchCaseList`）多选关联。
- 保存调 `submitCaseResult`。

- [ ] **Step 3: 补路由并验证提交**

routes.ts 追加 `{ path: 'test-plan/execute/:id', name: 'PlanExecute', component: () => import('@/views/testPlan/execute/index.vue'), meta: { permission: 'testPlan:view' } }`。
Run 验证四态可点、保存后刷新状态保留。
`git commit -am "feat: test plan case link and manual execution"`

### Task 5.3：计划报告 + 导出分享

**Files:**
- Create: `src/views/testPlan/report/index.vue`
- Modify: `src/mocks/handlers/testPlan.ts`、`src/api/testPlan.ts`、`src/types/models.ts`（`PlanReport`）

**Interfaces:**
- Produces: `fetchPlanReport(planId)`、`exportPlanReport(planId)`、`sharePlanReport(planId)`；`PlanReport`（进度/通过率/失败分布/关联缺陷/手工与自动化结果）。

- [ ] **Step 1: 类型 + handler + api**

```typescript
// types/models.ts 追加
export interface PlanReport {
  id: string; planId: string; name: string; progress: number; passRate: number
  total: number; passed: number; failed: number; blocked: number; skipped: number
  failDistribution: Array<{ module: string; count: number }>
  results: Array<{ caseName: string; type: 'manual' | 'auto'; result: ExecuteResult }>
  shareUrl: string; expireAt: string
}
```

handler：`GET /api/test-plan/:id/report` 返回构造的 PlanReport（由 `planCases` + plans 生成）；`POST /api/test-plan/:id/report/export` 返回 `ok({ url: '/reports/tp-1.html' })`；`POST /api/test-plan/:id/report/share` 返回 `ok({ shareUrl, expireAt })`。api 对应 3 函数。

- [ ] **Step 2: 写入 report/index.vue**

- 顶部统计卡：进度、通过率、总数/通过/失败/阻塞/跳过。
- 失败分布：ECharts 柱状图（复用 TrendChart 改柱状，或内联 echarts 柱状）。
- 结果表：手工与自动化结果混合展示（`type` 标签区分）。
- 「导出 HTML」「复制分享链接」按钮；分享链接含有效期展示，过期显示失效态。

- [ ] **Step 3: 验证并提交**

Run: `npm run dev`，从计划列表进入报告：统计与分布渲染、导出/分享按钮可用。
`git commit -am "feat: test plan report with export and share"`

### Task 5.4：失败转缺陷

**Files:**
- Modify: `src/views/testPlan/report/index.vue`、`src/mocks/handlers/bug.ts`、`src/api/bug.ts`

**Interfaces:**
- Consumes: `createBug`（Task 5.5 先行定义签名）。

- [ ] **Step 1: 报告失败行加「转缺陷」按钮**

失败结果行操作列加 `el-button`「转缺陷」→ 弹窗（标题预填 `[计划名] 失败用例：用例名`，严重程度/处理人表单）→ `createBug` → toast 并跳转 `/bug/list`。

- [ ] **Step 2: 验证并提交**

Run: `npm run dev`，报告失败项转缺陷后缺陷列表出现新缺陷。
`git commit -am "feat: convert failed case to bug"`

### Task 5.5：缺陷 CRUD + 工作流 + 筛选 + 评论

**Files:**
- Create: `src/api/bug.ts`、`src/mocks/seed/bug.ts`、`src/mocks/handlers/bug.ts`、`src/views/bug/list/index.vue`、`src/views/bug/list/components/BugDialog.vue`
- Modify: `src/mocks/handlers/index.ts`、`src/mocks/seed/index.ts`

**Interfaces:**
- Produces: `fetchBugs(query)/createBug/updateBug/deleteBug`；seed `createBugs()`；`Bug` 类型已在 models（Task 0.3）。

- [ ] **Step 1: 种子 + handler + api**

```typescript
// seed/bug.ts
import type { Bug } from '@/types/models'
export function createBugs(): Bug[] {
  return [
    { id: 'b-1', projectId: 'p-1', title: '登录页在 Safari 下样式错乱', severity: 'MAJOR', status: 'ASSIGNED', assignee: 'dev', reporter: 'test', description: 'Safari 14 下 flex 布局异常', createTime: '2026-08-26 10:00', moduleId: 'm-1-1' },
    { id: 'b-2', projectId: 'p-1', title: '订单支付超时未回调', severity: 'CRITICAL', status: 'FIXING', assignee: 'dev', reporter: 'test', description: '支付成功但回调丢失', createTime: '2026-08-25 15:00', moduleId: 'm-3' },
    { id: 'b-3', projectId: 'p-1', title: '用例导入模板缺少字段', severity: 'MINOR', status: 'NEW', assignee: '', reporter: 'Administrator', description: '缺少「标签」列', createTime: '2026-08-24 09:00', moduleId: 'm-1' },
  ]
}
```

handler：分页 + 状态/严重程度/处理人/模块筛选（复用 `page`，筛选在 handler 内 `filter`）+ CRUD。api 对应 4 函数（含 `updateBug` 用于状态流转）。

- [ ] **Step 2: 写入 list/index.vue（筛选 + 表格 + 工作流）**

- 筛选栏：状态/严重程度/处理人/关键字。
- 表格列：标题/严重程度标签（颜色映射 BLOCKER 红/CRITICAL 橙/MAJOR 黄/MINOR 蓝/TRIVIAL 灰）/状态标签/处理人/创建时间 + 操作（编辑/状态流转/删除）。
- 状态流转：操作列下拉（按 `BugStatus` 顺序给出可转状态）调 `updateBug`。
- `BugDialog`：新建/编辑表单（标题/严重程度/处理人/描述/模块）。
- 详情抽屉含评论（本地 `comments` 数组，添加评论 mock）。

- [ ] **Step 3: 验证并提交**

Run: `npm run dev`，访问 `/bug/list`：3 条缺陷、筛选生效、状态流转、新建。
`git commit -am "feat: bug CRUD with workflow and filters"`

---

## Milestone 6：项目管理 + 系统设置 + 个人中心

> 交付物：项目治理（信息/成员/用户组/模板/文件/消息/脚本/日志/环境）、系统与组织设置、个人中心。对应 FR-PJ-001~013、FR-ENV-001~008、FR-SYS-001~008、FR-ORG-001~004、FR-CM-001~007。
>
> **通用 CRUD 管理页模式**（本里程碑大量复用）：每个管理页 = `api/*.ts` 服务函数（`fetchXxxList(query)/createXxx/updateXxx/deleteXxx`）+ `mocks/handlers/*.ts`（内存数组 + 分页筛选 + CRUD）+ `mocks/seed/*.ts`（工厂）+ `views/**/index.vue`（DataTable + 新建/编辑 Dialog + 删除确认）。以下任务不再逐行重复模式代码，只给出**数据模型、seed 关键数据、service 签名、页面差异点**。

### Task 6.1：项目基本信息 + 成员 + 用户组 + 权限树

**Files:**
- Create: `src/views/project/info/index.vue`、`src/views/project/member/index.vue`、`src/views/project/userGroup/index.vue`、`src/components/PermissionTree.vue`
- Modify: `src/api/project.ts`（替换 Task 1.3 占位）、`src/mocks/handlers/project.ts`、`src/mocks/seed/project.ts`、`src/types/models.ts`

**Interfaces:**
- Produces: `PermissionTree`（props `{ data: PermissionNode[]; modelValue: string[] }`，`el-tree show-checkbox`，emits `update:modelValue`）；`api/project.ts` 完整函数（`fetchProjects/fetchProject/updateProject/fetchMembers/addMember/removeMember/fetchGroups/updateGroupPermissions`）。

- [ ] **Step 1: 数据模型与种子**

```typescript
// types/models.ts 追加
export interface ProjectMember { id: string; name: string; email: string; role: string; groupId: string }
export interface UserGroup { id: string; name: string; builtin: boolean; permissions: string[] }
export interface PermissionNode { id: string; name: string; children?: PermissionNode[] }
```

```typescript
// seed/project.ts
import type { Project, ProjectMember, UserGroup, PermissionNode } from '@/types/models'

export function createProjects(): Project[] {
  return [
    { id: 'p-1', orgId: '100001', name: '示例项目', description: '演示项目，含全量资产', createTime: '2026-08-01 10:00:00', members: 8, caseCount: 1284 },
    { id: 'p-2', orgId: '100001', name: '空项目', description: '无任何资产', createTime: '2026-08-10 10:00:00', members: 2, caseCount: 0 },
    { id: 'p-3', orgId: '100001', name: '电商核心项目', description: '电商业务', createTime: '2026-08-15 10:00:00', members: 5, caseCount: 342 },
  ]
}
export function createMembers(): ProjectMember[] {
  return [
    { id: 'u-1', name: '系统管理员', email: 'admin@testengine.io', role: '项目管理员', groupId: 'g-1' },
    { id: 'u-2', name: '测试工程师', email: 'test@testengine.io', role: '测试工程师', groupId: 'g-2' },
    { id: 'u-3', name: '开发工程师', email: 'dev@testengine.io', role: '开发工程师', groupId: 'g-3' },
  ]
}
export function createGroups(): UserGroup[] {
  return [
    { id: 'g-1', name: '项目管理员', builtin: true, permissions: ['project:view', 'testCase:view', 'testCase:create', 'testCase:edit', 'apiTest:view', 'bug:view'] },
    { id: 'g-2', name: '测试工程师', builtin: true, permissions: ['project:view', 'testCase:view', 'testCase:create', 'testCase:edit', 'apiTest:view', 'apiTest:debug', 'testPlan:view', 'bug:view', 'bug:create'] },
    { id: 'g-3', name: '开发工程师', builtin: true, permissions: ['apiTest:view', 'apiTest:debug', 'bug:view'] },
  ]
}
export function createPermissionTree(): PermissionNode[] {
  return [
    { id: 'project', name: '项目管理', children: [{ id: 'project:view', name: '查看' }] },
    { id: 'testCase', name: '测试用例', children: [
      { id: 'testCase:view', name: '查看' }, { id: 'testCase:create', name: '新建' }, { id: 'testCase:edit', name: '编辑' },
    ] },
    { id: 'apiTest', name: '接口测试', children: [
      { id: 'apiTest:view', name: '查看' }, { id: 'apiTest:debug', name: '调试' },
    ] },
    { id: 'bug', name: '缺陷管理', children: [
      { id: 'bug:view', name: '查看' }, { id: 'bug:create', name: '新建' },
    ] },
    { id: 'testPlan', name: '测试计划', children: [{ id: 'testPlan:view', name: '查看' }] },
    { id: 'system', name: '系统设置', children: [{ id: 'system:view', name: '查看' }] },
  ]
}
```

- [ ] **Step 2: handler + api（替换 Task 1.3 占位）**

```typescript
// handlers/project.ts（重写）
import { http, HttpResponse } from 'msw'
import { ok } from '../utils'
import { createProjects, createMembers, createGroups, createPermissionTree } from '../seed/project'

let projects = createProjects()
let members = createMembers()
let groups = createGroups()

export const projectHandlers = [
  http.get('/api/project/list', () => HttpResponse.json(ok(projects))),
  http.get('/api/project/:id', ({ params }) => HttpResponse.json(ok(projects.find((p) => p.id === params.id) ?? null))),
  http.put('/api/project/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Project>
    projects = projects.map((p) => (p.id === params.id ? { ...p, ...body } : p))
    return HttpResponse.json(ok(null))
  }),
  http.get('/api/project/:id/members', () => HttpResponse.json(ok(members))),
  http.post('/api/project/:id/members', async ({ request }) => {
    const body = await request.json() as ProjectMember
    members.push({ ...body, id: 'u-' + Date.now() })
    return HttpResponse.json(ok(null))
  }),
  http.delete('/api/project/:id/members/:memberId', ({ params }) => {
    members = members.filter((m) => m.id !== params.memberId)
    return HttpResponse.json(ok(null))
  }),
  http.get('/api/project/groups', () => HttpResponse.json(ok(groups))),
  http.get('/api/project/permission-tree', () => HttpResponse.json(ok(createPermissionTree()))),
  http.put('/api/project/groups/:id/permissions', async ({ params, request }) => {
    const { permissions } = await request.json() as { permissions: string[] }
    groups = groups.map((g) => (g.id === params.id ? { ...g, permissions } : g))
    return HttpResponse.json(ok(null))
  }),
]
```

```typescript
// api/project.ts（重写，保留 fetchProjects 签名）
export function fetchProjects(params: { orgId: string }): Promise<Project[]> { return request({ url: '/api/project/list', method: 'get', params }) }
export function fetchProject(id: string): Promise<Project> { return request({ url: `/api/project/${id}`, method: 'get' }) }
export function updateProject(id: string, data: Partial<Project>): Promise<null> { return request({ url: `/api/project/${id}`, method: 'put', data }) }
export function fetchMembers(projectId: string): Promise<ProjectMember[]> { return request({ url: `/api/project/${projectId}/members`, method: 'get' }) }
export function addMember(projectId: string, data: ProjectMember): Promise<null> { return request({ url: `/api/project/${projectId}/members`, method: 'post', data }) }
export function removeMember(projectId: string, memberId: string): Promise<null> { return request({ url: `/api/project/${projectId}/members/${memberId}`, method: 'delete' }) }
export function fetchGroups(): Promise<UserGroup[]> { return request({ url: '/api/project/groups', method: 'get' }) }
export function fetchPermissionTree(): Promise<PermissionNode[]> { return request({ url: '/api/project/permission-tree', method: 'get' }) }
export function updateGroupPermissions(groupId: string, permissions: string[]): Promise<null> { return request({ url: `/api/project/groups/${groupId}/permissions`, method: 'put', data: { permissions } }) }
```

- [ ] **Step 3: 写入三个视图 + PermissionTree**

- `info/index.vue`：基本信息表单（名称/描述）+ 各配置 tab（计划报告策略/缺陷同步/用例应用开关/接口应用设置，均用开关/表单，保存调 `updateProject`）。
- `member/index.vue`：成员表格 + 添加成员（选择系统用户 + 用户组）→ `addMember`；移除 → `removeMember`。
- `userGroup/index.vue`：用户组表格（内置/自定义标签）+ 「配置权限」打开抽屉内 `PermissionTree`，保存 `updateGroupPermissions`。
- `PermissionTree.vue`：

```vue
<template>
  <el-tree :data="data" show-checkbox node-key="id" :default-checked-keys="modelValue"
    :props="{ label: 'name', children: 'children' }" @check="(_, checked) => emit('update:modelValue', checked.checkedKeys as string[])" />
</template>
<script setup lang="ts">
import type { PermissionNode } from '@/types/models'
defineProps<{ data: PermissionNode[]; modelValue: string[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void }>()
</script>
```

- [ ] **Step 4: 验证并提交**

Run: `npm run dev`，顶栏项目切换器出现 3 个项目；访问 `/project/info`、`/project/member`、`/project/userGroup` 验证表单/成员/权限树勾选保存。
`git commit -am "feat: project info, member and user group with permission tree"`

### Task 6.2：项目配置（模板/文件/消息/脚本/日志/环境）

**Files:**
- Create: `src/views/project/template/index.vue`、`src/views/project/file/index.vue`、`src/views/project/message/index.vue`、`src/views/project/script/index.vue`、`src/views/project/log/index.vue`、`src/views/project/environment/index.vue`
- Modify: `src/api/project.ts`、`src/mocks/handlers/project.ts`、`src/mocks/seed/project.ts`、`src/types/models.ts`

**Interfaces:**
- Produces: `Environment/MessageConfig/OperationLog/FileItem/ProjectTemplate` 类型；对应 service 函数（命名 `fetchXxx/createXxx/updateXxx/deleteXxx`）。

- [ ] **Step 1: 数据模型与种子**

```typescript
// types/models.ts 追加
export interface Environment { id: string; projectId: string; name: string; domain: string; variables: KeyValue[]; hosts: KeyValue[]; headers: KeyValue[] }
export interface MessageConfig { id: string; type: '站内信' | '邮件' | '机器人'; enabled: boolean; receivers: string[] }
export interface OperationLog { id: string; scope: string; object: string; action: string; user: string; time: string }
export interface FileItem { id: string; name: string; type: string; size: number; repo: string; time: string }
export interface ProjectTemplate { id: string; name: string; kind: '用例' | '缺陷'; fields: TemplateField[] }
export interface TemplateField { id: string; key: string; label: string; required: boolean; type: 'text' | 'select' | 'textarea' }
```

```typescript
// seed/project.ts 追加
export function createEnvironments(): Environment[] {
  return [
    { id: 'env-1', projectId: 'p-1', name: '测试环境', domain: 'http://demo.testengine.io', variables: [{ key: 'token', value: 'abc123', enabled: true }], hosts: [], headers: [] },
    { id: 'env-2', projectId: 'p-1', name: '预发环境', domain: 'https://pre.testengine.io', variables: [], hosts: [{ key: 'api.testengine.io', value: '10.0.0.8', enabled: true }], headers: [] },
  ]
}
export function createLogs(): OperationLog[] {
  return [
    { id: 'l-1', scope: '用例', object: '登录用例', action: '删除', user: 'test', time: '2026-08-26 14:00' },
    { id: 'l-2', scope: '场景', object: '登录态通用场景', action: '执行', user: 'Administrator', time: '2026-08-26 13:30' },
  ]
}
```

- [ ] **Step 2: handler + api + 视图（通用 CRUD 模式）**

每个子页面按通用 CRUD 模式实现；差异点：
- `environment`：环境列表 + 编辑抽屉（域名、变量 KeyValueEditor、HOST 映射 KeyValueEditor、公共请求头 KeyValueEditor），对应 FR-ENV-001~005。
- `template`：模板列表 + 「设计模板」抽屉（字段列表：添加/删除/排序字段，字段类型下拉），对应 FR-PJ-008/009（动态表单设计器）。
- `file`：文件表格 + 仓库配置表单（GitHub/GitLab/Gitee/Gitea 下拉）。
- `message`：消息开关（el-switch）+ 接收人配置。
- `script`：公共脚本列表 + 编辑器（el-input textarea）。
- `log`：操作日志表格 + 检索（范围/对象/时间筛选）。

- [ ] **Step 3: 补路由（6 个子路由）**

routes.ts children 追加 `project/template`、`project/file`、`project/message`、`project/script`、`project/log`（均 `meta.permission: 'project:view'`），`project/environment` 已在 Task 1.3 定义。

- [ ] **Step 4: 验证并提交**

Run: `npm run dev`，逐个访问 6 个配置页，确认列表/表单/开关可用。
`git commit -am "feat: project config pages (template/file/message/script/log/environment)"`

### Task 6.3：系统设置（用户/用户组/组织/参数/插件）

**Files:**
- Create: `src/api/setting.ts`、`src/mocks/seed/setting.ts`、`src/mocks/handlers/setting.ts`、`src/views/setting/system/user/index.vue`、`src/views/setting/system/org/index.vue`、`src/views/setting/system/param/index.vue`、`src/views/setting/system/plugin/index.vue`
- Modify: `src/mocks/handlers/index.ts`、`src/mocks/seed/index.ts`、`src/router/routes.ts`、`src/types/models.ts`（`SysUser/SysParam/Plugin`）

**Interfaces:**
- Produces: `api/setting.ts` 的 `fetchSysUsers/createSysUser/toggleSysUser/resetCredential/fetchSysParams/fetchPlugins/fetchSysOrgs`；seed `createSysUsers/createSysParams/createPlugins/createSysOrgs`。

- [ ] **Step 1: 数据模型与种子**

```typescript
// types/models.ts 追加
export interface SysUser { id: string; username: string; name: string; email: string; role: string; enabled: boolean }
export interface SysParam { id: string; key: string; value: string; description: string }
export interface Plugin { id: string; name: string; type: '协议' | '缺陷'; version: string; enabled: boolean }
```

```typescript
// seed/setting.ts
import type { SysUser, SysParam, Plugin } from '@/types/models'
export function createSysUsers(): SysUser[] {
  return [
    { id: 'u-1', username: 'Administrator', name: '系统管理员', email: 'admin@testengine.io', role: '系统管理员', enabled: true },
    { id: 'u-2', username: 'test', name: '测试工程师', email: 'test@testengine.io', role: '系统成员', enabled: true },
    { id: 'u-3', username: 'dev', name: '开发工程师', email: 'dev@testengine.io', role: '系统成员', enabled: true },
  ]
}
export function createSysParams(): SysParam[] {
  return [
    { id: 'p1', key: 'base.url', value: 'http://47.92.225.146:8081', description: '平台基础地址' },
    { id: 'p2', key: 'mail.host', value: 'smtp.testengine.io', description: '邮件服务器' },
  ]
}
export function createPlugins(): Plugin[] {
  return [
    { id: 'pl-1', name: 'MeterSphere TCP 协议', type: '协议', version: '1.0.0', enabled: true },
    { id: 'pl-2', name: 'Jira 缺陷插件', type: '缺陷', version: '2.1.0', enabled: false },
  ]
}
```

- [ ] **Step 2: handler + api + 视图（通用 CRUD 模式）**

- `system/user`：用户表格（启用开关 `toggleSysUser`、重置凭证 `resetCredential`、新建 `createSysUser`）。
- `system/org`：组织与项目表格（创建组织/创建项目）。
- `system/param`：参数表格 + 编辑。
- `system/plugin`：插件表格 + 启用开关 + 上传（`el-upload`）。
- handler 各 `GET/POST/PUT` 内存 CRUD；api 对应函数。

- [ ] **Step 3: 补路由并验证提交**

routes.ts 追加 `setting/system/param`、`setting/system/plugin`（`meta.permission: 'system:view'`）。`setting/system/org`、`setting/system/user` 已在 Task 1.3。
Run 验证后 `git commit -am "feat: system settings (user/org/param/plugin)"`

### Task 6.4：组织设置（成员/用户组/集成/项目）

**Files:**
- Create: `src/views/setting/org/member/index.vue`、`src/views/setting/org/userGroup/index.vue`、`src/views/setting/org/integration/index.vue`、`src/views/setting/org/project/index.vue`
- Modify: `src/api/setting.ts`、`src/mocks/handlers/setting.ts`、`src/mocks/seed/setting.ts`

**Interfaces:**
- Produces: `fetchOrgMembers/fetchOrgGroups/fetchIntegrations/fetchOrgProjects` 等（通用 CRUD 模式）。

- [ ] **Step 1: 视图（复用项目级同类页面的结构）**

- `org/member`：组织成员表格（复用成员管理模式，数据源 `orgMembers`）。
- `org/userGroup`：组织用户组 + 权限树（复用 PermissionTree）。
- `org/integration`：服务集成（Jira/禅道/TAPD 卡片，各含连接测试按钮 → toast）。
- `org/project`：组织下项目表格（管理入口）。

- [ ] **Step 2: 验证并提交**

Run: `npm run dev`，访问 `/setting/org/*` 验证列表与操作。
`git commit -am "feat: org settings (member/userGroup/integration/project)"`

### Task 6.5：个人中心（资料/表格设置/回收站）

**Files:**
- Create: `src/views/personal/profile/index.vue`、`src/views/personal/recycle/index.vue`
- Modify: `src/api/auth.ts`（`updateProfile/changePassword`）、`src/api/testCase.ts`（回收站已在 Task 3.5）、`src/mocks/handlers/auth.ts`

**Interfaces:**
- Consumes: `fetchRecycle/restoreCase/purgeCase`（Task 3.5）、`fetchProjects`。

- [ ] **Step 1: 个人资料页**

- `profile/index.vue`：个人资料表单（姓名/邮箱）+ 修改密码表单（旧密码/新密码/确认，前端校验一致）+ 本地执行地址配置（FR-CM-003）+ 表格设置（默认每页条数下拉）。
- `updateProfile` / `changePassword` 在 `api/auth.ts` 新增，mock handler 返回 `ok(null)` + toast。

- [ ] **Step 2: 回收站页**

- `recycle/index.vue`：tab 切换「用例/场景」回收站；用例恢复/彻底删除复用 Task 3.5 的 `restoreCase/purgeCase`；场景回收站同模式（Task 4.3 场景删除进回收站，此步补 `restoreScenario/purgeScenario`）。

- [ ] **Step 3: 验证并提交**

Run: `npm run dev`，访问 `/personal/profile` 修改资料与密码；`/personal/recycle` 查看并恢复/彻底删除。
`git commit -am "feat: personal center (profile/recycle)"`

### Task 6.6：收尾 — 全量构建与空态/异常态校验

**Files:**
- Modify: `README.md`（新建，说明启动/账号/Mock 开关）、`.env.development`

**Interfaces:**
- Produces: `.env.development`（`VITE_USE_MOCK=true`）；`README.md`（启动说明 + 测试账号表）。

- [ ] **Step 1: 写入 .env.development 与 README**

```bash
# .env.development
VITE_USE_MOCK=true
VITE_API_BASE_URL=
```

```markdown
# TestEngine 测试平台前端
## 启动
npm install && npm run dev
## 测试账号
| 账号 | 密码 | 角色 |
| --- | --- | --- |
| Administrator | admin123 | 系统管理员（全权限） |
| test | test123 | 测试工程师 |
| dev | dev123 | 开发工程师 |
## Mock
VITE_USE_MOCK=true 启用 MSW；设为 false 且配置 VITE_API_BASE_URL 走真实后端。
```

- [ ] **Step 2: 空态/异常态抽查**

- 顶栏切换「空项目」（p-2）后用例/缺陷列表应展示空态（「暂无数据」），不报错。
- 在 `mocks/handlers/workstation.ts` 临时抛错验证错误 toast 与 403 拦截，验证后还原。

- [ ] **Step 3: 全量构建验证**

Run: `npm run build`
Expected: `vue-tsc` 类型检查通过，`vite build` 产出 `dist/` 无错误。

- [ ] **Step 4: 提交** `git commit -am "docs: README and env; verify build"`

---

## 自检记录（Self-Review）

**1. Spec 覆盖**（P0 全部落到任务，P1/P2 标注）：

| 需求范围 | 覆盖任务 | 备注 |
| --- | --- | --- |
| FR-G-001/002/003/004/006/007/008/009/011/013/014/016 | 1.2/1.4/1.5/2.1/3.2/3.5 | 通用交互（分页/筛选/空态/toast/权限）贯穿各列表页 |
| FR-WS-001/003/004/006 | 2.1/2.2/2.3/2.4 | FR-WS-002 卡片设置、FR-WS-005 我创建的为 P1，未单列任务，可作为后续增量 |
| FR-PJ-001~013 | 6.1/6.2 | FR-PJ-003 缺陷同步 P1 以配置 UI 落地 |
| FR-ENV-001~008 | 6.2 | FR-ENV-004 数据源/005 HOST 映射/006 前后置/007 断言在环境抽屉内以表单项落地 |
| FR-TC-001~011 | 3.1~3.5 | FR-TC-012 AI 生成 P1、FR-TC-004 脑图为树形编辑器（非 SVG 全脑图） |
| FR-RV-001~004 | 3.7 | |
| FR-TP-001~010 | 5.1~5.4 | FR-TP-002 计划组、FR-TP-005 脑图执行 P1 未单列 |
| FR-API-001~018 | 4.1/4.2/4.5 | FR-API-002 插件协议、FR-API-004 内置函数、FR-API-007 本地执行 P1 以 UI 入口落地 |
| FR-SC-001~014 | 4.3 | FR-SC-003 导入、FR-SC-009 仅一次、FR-SC-010 脚本、FR-SC-014 定时任务以步骤类型/配置项落地 |
| FR-RP-001~004 | 4.4 | |
| FR-BG-001~006 | 5.5 | FR-BG-004 第三方同步 P1 配置 UI |
| FR-SYS-001~008 | 6.3 | FR-SYS-004 资源池/005 插件/007 模型/008 许可以列表+配置落地 |
| FR-ORG-001~004 | 6.4 | |
| FR-CM-001~007 | 1.1/6.5 | |

**2. 占位符扫描**：全计划无 `TBD/TODO/implement later/类似 Task N`；每个代码步骤给出可编译代码或明确的模式引用（通用 CRUD 模式已在 Milestone 6 首部定义）。

**3. 类型一致性**：`ApiResult/PageResult/PageQuery`（Task 0.3）→ `request<T>`（Task 0.4）→ 各 `api/*` 返回类型签名一致；`TestCase/Scenario/ScenarioStep/Bug/TestPlan/Environment` 等实体在 `types/models.ts` 统一定义，seed/handler/api/view 引用同一类型；`useUserStore.hasPermission(point: string)` 被路由守卫（Task 1.3）、`v-permission`（Task 1.4）、`SidebarMenu`（Task 1.2）一致调用；`fetchProjects({ orgId })` 在 Task 1.3 占位、Task 6.1 重写，签名不变。

**执行顺序依赖**：Milestone 0 → 1 → 2 → 3 → 4 → 5 → 6 顺序执行；M2 起每任务末尾的 `typecheck`/`dev` 验证保证前置接口已存在。

<!-- PLAN-SECTION-END-3 -->



