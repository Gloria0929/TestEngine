// src/types/models.ts
export interface ModuleNode {
  id: string;
  name: string;
  children: ModuleNode[];
}

export type CaseLevel = "P0" | "P1" | "P2" | "P3";
export type CaseStatus = "DRAFT" | "REVIEW" | "READY";
export interface TestCase {
  id: string;
  projectId: string;
  moduleId: string;
  name: string;
  /** 所在目录（空 = 未分类） */
  folderId?: string;
  testPoint: string;
  precondition: string;
  steps: CaseStep[];
  level: CaseLevel;
  status: CaseStatus;
  executor: string;
  tags: string[];
  createUser: string;
  updateTime: string;
  follow: boolean;
  remark?: string;
  attachments?: string[];
  purpose?: string;
  preCaseIds?: string[];
  postCaseIds?: string[];
  relatedCaseIds?: string[];
  bugIds?: string[];
}
export interface CaseStep {
  id: string;
  description: string;
  expected: string;
}

export type BugSeverity =
  | "BLOCKER"
  | "CRITICAL"
  | "MAJOR"
  | "MINOR"
  | "TRIVIAL";
export type BugStatus =
  | "NEW"
  | "ASSIGNED"
  | "FIXING"
  | "FIXED"
  | "CLOSED"
  | "REOPEN";
export interface Bug {
  id: string;
  projectId: string;
  planId?: string;
  title: string;
  severity: BugSeverity;
  status: BugStatus;
  assignee: string;
  reporter: string;
  description: string;
  createTime: string;
  moduleId: string;
  /** 所在目录（空 = 未分类） */
  folderId?: string;
}
export type DefinitionStatus = "未规划" | "进行中" | "已完成" | "已归档";
export interface ApiDefinition {
  id: string;
  name: string;
  method: HttpMethod;
  path: string;
  protocol: "HTTP" | "HTTPS";
  status: DefinitionStatus;
  responsible: string;
  caseCount: number;
  tags: string[];
  updateTime: string;
  desc: string;
  /** 所在目录（空 = 未分类） */
  folderId?: string;
}
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD"
  | "CONNECT";
export type ScenarioStatus = "未执行" | "执行中" | "通过" | "失败";
export interface ScenarioStep {
  id: string;
  name: string;
  expected?: string;
}
export interface Scenario {
  id: string;
  name: string;
  apiCount: number;
  status: ScenarioStatus;
  responsible: string;
  creator: string;
  createTime: string;
  updateTime: string;
  level?: "P0" | "P1" | "P2" | "P3";
  tags?: string[];
  desc?: string;
  steps?: ScenarioStep[];
  /** 所在目录（空 = 未分类） */
  folderId?: string;
}
export interface TestPlan {
  id: string;
  projectId: string;
  name: string;
  status: "DRAFT" | "RUNNING" | "DONE";
  owner: string;
  startTime: string;
  endTime: string;
  progress: number;
  passRate: number;
  group: string;
  /** 所在目录（空 = 未分类） */
  folderId?: string;
}
export interface TrendPoint {
  date: string;
  cases: number;
  apis: number;
}
/** 单条用例的评审结果 */
export interface ReviewCaseResult {
  passed: boolean;
  comment: string;
}
export interface Review {
  id: string;
  name: string;
  reviewers: string[];
  status: "PENDING" | "PASSED" | "REJECTED";
  caseCount: number;
  caseIds: string[];
  startTime: string;
  endTime: string;
  /** 所在目录，空 = 未分类 */
  folderId?: string;
  /** 每条用例的评审结果（caseId -> 结果），空 = 未评审 */
  results?: Record<string, ReviewCaseResult>;
}
export interface ReviewDetail extends Review {
  cases: TestCase[];
}

export interface KeyValue {
  key: string;
  value: string;
  enabled: boolean;
}
export type BodyType = "none" | "form-data" | "x-www-form-urlencoded" | "raw";
export interface DebugRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  protocol: string;
  headers: KeyValue[];
  query: KeyValue[];
  bodyType: BodyType;
  body: string;
  bodyParams: KeyValue[];
  authType: "none" | "basic" | "bearer" | "cookie";
  auth: Record<string, string>;
}

/** 业务模块目录（测试计划/测试用例/缺陷等按目录划分） */
export interface ModuleFolder {
  id: string;
  name: string;
}
export interface ExecuteResponse {
  status: number;
  time: number;
  headers: Record<string, string>;
  body: string;
  console: string[];
}
export interface DebugFolder {
  id: string;
  name: string;
  items: DebugRequest[];
}
export interface ReportStep {
  name: string;
  method: string;
  path: string;
  result: string;
  time: number;
}
export interface ApiReport {
  id: string;
  name: string;
  type: string;
  result: string;
  passRate: number;
  total: number;
  success: number;
  fail: number;
  executor: string;
  createTime: string;
  steps?: ReportStep[];
  /** 所在目录（空 = 未分类） */
  folderId?: string;
}
export type ExecuteResult = "PASS" | "FAIL" | "BLOCK" | "SKIP";
export interface StepExecuteResult {
  stepId: string;
  result: ExecuteResult | "";
  actual: string;
}
export interface PlanCaseResult {
  caseId: string;
  result: ExecuteResult;
  actual: string;
  stepResults?: StepExecuteResult[];
}
export interface CaseExecuteHistory {
  id: string;
  planId: string;
  caseId: string;
  result: ExecuteResult;
  actual: string;
  executor: string;
  executeTime: string;
}
export interface PlanReport {
  id: string;
  planId: string;
  name: string;
  progress: number;
  passRate: number;
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  failDistribution: Array<{ module: string; count: number }>;
  results: Array<{
    caseId: string;
    caseName: string;
    testPoint: string;
    level: CaseLevel;
    type: "manual" | "auto";
    result: ExecuteResult;
  }>;
  shareUrl: string;
  expireAt: string;
}
export interface OperationLog {
  id: string;
  /** 所在目录（空 = 未分类） */
  folderId?: string;
  scope: string;
  object: string;
  action: string;
  user: string;
  time: string;
}
