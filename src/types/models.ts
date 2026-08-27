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
