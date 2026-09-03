// src/api/apiTest.ts
import { request } from "@/utils/request";
import type {
  DebugRequest,
  ExecuteResponse,
  ApiDefinition,
  Scenario,
  ApiReport,
} from "@/types/models";

export function fetchDebugRequests(): Promise<DebugRequest[]> {
  return request({ url: "/api/api-test/debug", method: "get" });
}
export function saveDebugRequest(data: DebugRequest): Promise<DebugRequest> {
  return request({ url: "/api/api-test/debug", method: "post", data });
}
export function executeRequest(data: DebugRequest): Promise<ExecuteResponse> {
  return request({ url: "/api/api-test/execute", method: "post", data });
}
export function importCurl(text: string): Promise<DebugRequest> {
  return request({
    url: "/api/api-test/import-curl",
    method: "post",
    data: { text },
  });
}
export function fetchApiDefinitions(): Promise<ApiDefinition[]> {
  return request({ url: "/api/api-test/definitions", method: "get" });
}
export interface DefinitionPageQuery {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  method?: string;
  status?: string;
}
export function fetchApiDefinitionPage(
  query: DefinitionPageQuery,
): Promise<{ list: ApiDefinition[]; total: number }> {
  return request({
    url: "/api/api-test/definitions",
    method: "get",
    params: query,
  });
}
export function createApiDefinition(
  data: Partial<ApiDefinition>,
): Promise<ApiDefinition> {
  return request({ url: "/api/api-test/definitions", method: "post", data });
}
export function updateApiDefinition(
  id: string,
  data: Partial<ApiDefinition>,
): Promise<ApiDefinition> {
  return request({
    url: `/api/api-test/definitions/${id}`,
    method: "put",
    data,
  });
}
export function deleteApiDefinition(id: string): Promise<null> {
  return request({ url: `/api/api-test/definitions/${id}`, method: "delete" });
}
export function importDefinition(text: string): Promise<{ count: number }> {
  return request({
    url: "/api/api-test/import-definition",
    method: "post",
    data: { text },
  });
}
export function fetchScenarios(): Promise<Scenario[]> {
  return request({ url: "/api/api-test/scenarios", method: "get" });
}
export interface ScenarioPageQuery {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  status?: string;
}
export function fetchScenarioPage(
  query: ScenarioPageQuery,
): Promise<{ list: Scenario[]; total: number }> {
  return request({
    url: "/api/api-test/scenarios",
    method: "get",
    params: query,
  });
}
export function createScenario(data: Partial<Scenario>): Promise<Scenario> {
  return request({ url: "/api/api-test/scenarios", method: "post", data });
}
export function updateScenario(
  id: string,
  data: Partial<Scenario>,
): Promise<Scenario> {
  return request({ url: `/api/api-test/scenarios/${id}`, method: "put", data });
}
export function saveScenario(data: Scenario): Promise<Scenario> {
  return request({ url: "/api/api-test/scenarios", method: "post", data });
}
export function executeScenario(id: string): Promise<Record<string, unknown>> {
  return request({
    url: `/api/api-test/scenarios/${id}/execute`,
    method: "post",
  });
}
export function deleteScenario(id: string): Promise<null> {
  return request({ url: `/api/api-test/scenarios/${id}`, method: "delete" });
}
export function fetchScenarioRecycle(): Promise<Scenario[]> {
  return request({ url: "/api/api-test/scenarios/recycle", method: "get" });
}
export function restoreScenario(id: string): Promise<null> {
  return request({
    url: `/api/api-test/scenarios/recycle/${id}/restore`,
    method: "post",
  });
}
export function purgeScenario(id: string): Promise<null> {
  return request({
    url: `/api/api-test/scenarios/recycle/${id}`,
    method: "delete",
  });
}
export interface ReportPageQuery {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  type?: string;
}
export function fetchApiReportPage(
  query: ReportPageQuery,
): Promise<{ list: ApiReport[]; total: number }> {
  return request({
    url: "/api/api-test/reports",
    method: "get",
    params: query,
  });
}
export function fetchApiReport(id: string): Promise<ApiReport> {
  return request({ url: `/api/api-test/reports/${id}`, method: "get" });
}
export function deleteApiReport(id: string): Promise<null> {
  return request({ url: `/api/api-test/reports/${id}`, method: "delete" });
}
