// src/api/apiTest.ts
import { request } from "@/utils/request";
import type {
  DebugRequest,
  DebugFolder,
  ExecuteResponse,
  ApiDefinition,
  Scenario,
  ApiReport,
} from "@/types/models";

export function fetchDebugRequests(): Promise<DebugRequest[]> {
  return request({ url: "/api/api-test/debug", method: "get" });
}
export function executeRequest(data: DebugRequest): Promise<ExecuteResponse> {
  return request({ url: "/api/api-test/execute", method: "post", data });
}
/** 收藏夹（文件夹 + 已保存接口） */
export function fetchDebugCollections(): Promise<DebugFolder[]> {
  return request({ url: "/api/api-test/debug-collections", method: "get" });
}
export function createDebugFolder(name: string): Promise<DebugFolder> {
  return request({ url: "/api/api-test/debug-collections", method: "post", data: { name } });
}
export function renameDebugFolder(id: string, name: string): Promise<null> {
  return request({ url: `/api/api-test/debug-collections/${id}`, method: "put", data: { name } });
}
export function deleteDebugFolder(id: string): Promise<null> {
  return request({ url: `/api/api-test/debug-collections/${id}`, method: "delete" });
}
export function saveDebugItem(folderId: string, item: Partial<DebugRequest>): Promise<DebugRequest> {
  return request({ url: `/api/api-test/debug-collections/${folderId}/items`, method: "post", data: item });
}
export function renameDebugItem(folderId: string, itemId: string, name: string): Promise<null> {
  return request({ url: `/api/api-test/debug-collections/${folderId}/items/${itemId}`, method: "put", data: { name } });
}
export function deleteDebugItem(folderId: string, itemId: string): Promise<null> {
  return request({ url: `/api/api-test/debug-collections/${folderId}/items/${itemId}`, method: "delete" });
}
export interface DefinitionPageQuery {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  method?: string;
  status?: string;
  folderId?: string;
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
export interface ScenarioPageQuery {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  status?: string;
  folderId?: string;
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
export function fetchScenario(id: string): Promise<Scenario | null> {
  return request({ url: `/api/api-test/scenarios/${id}`, method: "get" });
}
export function updateScenario(
  id: string,
  data: Partial<Scenario>,
): Promise<Scenario> {
  return request({ url: `/api/api-test/scenarios/${id}`, method: "put", data });
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
export interface ReportPageQuery {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  type?: string;
  folderId?: string;
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
export function updateApiReport(
  id: string,
  data: Partial<ApiReport>,
): Promise<ApiReport> {
  return request({
    url: `/api/api-test/reports/${id}`,
    method: "put",
    data,
  });
}
export function deleteApiReport(id: string): Promise<null> {
  return request({ url: `/api/api-test/reports/${id}`, method: "delete" });
}
