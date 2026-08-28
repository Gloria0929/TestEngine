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
export interface Scenario {
  id: string; name: string; moduleId: string
  status: 'DRAFT' | 'PASS' | 'FAIL'; steps: ScenarioStep[]
}
export interface TestPlan {
  id: string; projectId: string; name: string; status: 'DRAFT' | 'RUNNING' | 'DONE'
  owner: string; startTime: string; endTime: string; progress: number
}
export interface Notification {
  id: string; type: string; title: string; content: string
  read: boolean; createTime: string; targetUrl: string
}
export interface Review { id: string; name: string; reviewers: string[]; status: 'PENDING' | 'PASSED' | 'REJECTED'; caseCount: number; caseIds: string[]; startTime: string; endTime: string }
export interface ReviewDetail extends Review { cases: TestCase[] }

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
export interface ReportStep {
  id: string; name: string; status: 'PASS' | 'FAIL'; time: number
  request: string; response: string; assertion: string; extract: string
  console: string[]
}
export interface ApiReport {
  id: string; name: string; scenarioId: string; status: 'PASS' | 'FAIL'
  duration: number; createTime: string; steps: ReportStep[]
}
export interface MockRule {
  id: string; name: string; definitionId: string; method: HttpMethod
  path: string; match: KeyValue[]; responseStatus: number; responseBody: string; delay: number
}
export type ExecuteResult = 'PASS' | 'FAIL' | 'BLOCK' | 'SKIP'
export interface PlanCaseResult { caseId: string; result: ExecuteResult; actual: string }
export interface PlanReport {
  id: string; planId: string; name: string; progress: number; passRate: number
  total: number; passed: number; failed: number; blocked: number; skipped: number
  failDistribution: Array<{ module: string; count: number }>
  results: Array<{ caseName: string; type: 'manual' | 'auto'; result: ExecuteResult }>
  shareUrl: string; expireAt: string
}
