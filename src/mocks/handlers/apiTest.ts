// src/mocks/handlers/apiTest.ts
import { http, HttpResponse } from "msw";
import { ok } from "../utils";
import {
  createDebugRequests,
  createApiDefinitions,
  createScenarios,
  createApiReports,
} from "../seed/apiTest";
import type {
  DebugRequest,
  ExecuteResponse,
  ApiDefinition,
  Scenario,
} from "@/types/models";

let debugRequests = createDebugRequests();
let definitions = createApiDefinitions();
let scenarios = createScenarios();
let reports = createApiReports();

export const apiTestHandlers = [
  http.get("/api/api-test/debug", () => HttpResponse.json(ok(debugRequests))),
  http.post("/api/api-test/execute", async ({ request }) => {
    const req = (await request.json()) as DebugRequest;
    await new Promise((r) => setTimeout(r, 250));
    const resp: ExecuteResponse = {
      status: 200,
      time: Math.floor(120 + Math.random() * 200),
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(
        {
          code: 0,
          message: "ok",
          data: {
            mock: true,
            method: req.method,
            url: req.url,
            bodyType: req.bodyType,
            body: req.bodyType === "raw" ? req.body : req.bodyParams,
            headers: req.headers,
            auth: req.auth,
          },
        },
        null,
        2,
      ),
      console: [`> ${req.method} ${req.url}`, "< 200 OK (mock 回显)"],
    };
    return HttpResponse.json(ok(resp));
  }),
  http.get("/api/api-test/definitions", ({ request }) => {
    const url = new URL(request.url);
    const pageNum = url.searchParams.get("pageNum");
    // 无分页参数：返回全量数组（场景/Mock 页面复用）
    if (!pageNum) return HttpResponse.json(ok(definitions));
    // 分页 + 过滤：返回 { list, total }（接口定义列表页）
    const pageSize = Number(url.searchParams.get("pageSize")) || 10;
    const keyword = (url.searchParams.get("keyword") || "").toLowerCase();
    const method = url.searchParams.get("method") || "";
    const status = url.searchParams.get("status") || "";
    let list = definitions.filter((d) => {
      if (method && d.method !== method) return false;
      if (status && d.status !== status) return false;
      if (
        keyword &&
        !`${d.name} ${d.path} ${d.id}`.toLowerCase().includes(keyword)
      )
        return false;
      return true;
    });
    const total = list.length;
    const start = (Number(pageNum) - 1) * pageSize;
    list = list.slice(start, start + pageSize);
    return HttpResponse.json(ok({ list, total }));
  }),
  http.post("/api/api-test/definitions", async ({ request }) => {
    const body = (await request.json()) as ApiDefinition;
    const d = { ...body, id: "API-" + Date.now() };
    definitions.unshift(d);
    return HttpResponse.json(ok(d));
  }),
  http.put("/api/api-test/definitions/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<ApiDefinition>;
    definitions = definitions.map((d) =>
      d.id === params.id ? { ...d, ...body } : d,
    );
    return HttpResponse.json(ok(definitions.find((d) => d.id === params.id)));
  }),
  http.delete("/api/api-test/definitions/:id", ({ params }) => {
    definitions = definitions.filter((d) => d.id !== params.id);
    return HttpResponse.json(ok(null));
  }),
  http.post("/api/api-test/import-definition", async ({ request }) => {
    const { text } = (await request.json()) as { text: string };
    const count = text.split("\n").filter((l) => l.trim()).length;
    return HttpResponse.json(ok({ count }));
  }),
  http.get("/api/api-test/scenarios", ({ request }) => {
    const url = new URL(request.url);
    const pageNum = url.searchParams.get("pageNum");
    if (!pageNum) return HttpResponse.json(ok(scenarios));
    const pageSize = Number(url.searchParams.get("pageSize")) || 10;
    const keyword = (url.searchParams.get("keyword") || "").toLowerCase();
    const status = url.searchParams.get("status") || "";
    let list = scenarios.filter((d) => {
      if (status && d.status !== status) return false;
      if (keyword && !`${d.name} ${d.id}`.toLowerCase().includes(keyword))
        return false;
      return true;
    });
    const total = list.length;
    const start = (Number(pageNum) - 1) * pageSize;
    list = list.slice(start, start + pageSize);
    return HttpResponse.json(ok({ list, total }));
  }),
  http.post("/api/api-test/scenarios", async ({ request }) => {
    const body = (await request.json()) as Scenario;
    const s = { ...body, id: "SCEN-" + Date.now() };
    scenarios.unshift(s);
    return HttpResponse.json(ok(s));
  }),
  http.put("/api/api-test/scenarios/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<Scenario>;
    scenarios = scenarios.map((s) =>
      s.id === params.id ? { ...s, ...body } : s,
    );
    return HttpResponse.json(ok(scenarios.find((s) => s.id === params.id)));
  }),
  http.delete("/api/api-test/scenarios/:id", ({ params }) => {
    scenarios = scenarios.filter((x) => x.id !== params.id);
    return HttpResponse.json(ok(null));
  }),
  http.get("/api/api-test/scenarios/:id", ({ params }) => {
    return HttpResponse.json(
      ok(scenarios.find((s) => s.id === params.id) ?? null),
    );
  }),
  http.post("/api/api-test/scenarios/:id/execute", async ({ params }) => {
    await new Promise((r) => setTimeout(r, 400));
    const s = scenarios.find((x) => x.id === params.id);
    const pass = s?.status !== "失败" && s?.status !== "执行中";
    return HttpResponse.json(
      ok({
        result: pass ? "SUCCESS" : "FAIL",
        passRate: pass
          ? Math.floor(80 + Math.random() * 20)
          : Math.floor(20 + Math.random() * 50),
      }),
    );
  }),
  http.get("/api/api-test/reports", ({ request }) => {
    const url = new URL(request.url);
    const pageNum = Number(url.searchParams.get("pageNum")) || 1;
    const pageSize = Number(url.searchParams.get("pageSize")) || 10;
    const keyword = (url.searchParams.get("keyword") || "").toLowerCase();
    const type = url.searchParams.get("type") || "";
    let list = reports.filter((r) => {
      if (type && r.type !== type) return false;
      if (keyword && !`${r.name} ${r.id}`.toLowerCase().includes(keyword))
        return false;
      return true;
    });
    const total = list.length;
    const start = (pageNum - 1) * pageSize;
    list = list.slice(start, start + pageSize);
    return HttpResponse.json(ok({ list, total }));
  }),
  http.get("/api/api-test/reports/:id", ({ params }) => {
    const item = reports.find((r) => r.id === params.id);
    if (!item) return HttpResponse.json(ok(null));
    const definitions = createApiDefinitions();
    const steps = [];
    for (let k = 0; k < item.total; k++) {
      const def = definitions[(k * 7) % definitions.length];
      steps.push({
        name: def ? def.name : "接口步骤 " + (k + 1),
        method: def ? def.method : "GET",
        path: def ? def.path : "/api/v1/step/" + (k + 1),
        result: k < item.success ? "成功" : "失败",
        time: 30 + ((k * 37) % 220),
      });
    }
    return HttpResponse.json(ok({ ...item, steps }));
  }),
  http.delete("/api/api-test/reports/:id", ({ params }) => {
    reports = reports.filter((r) => r.id !== params.id);
    return HttpResponse.json(ok(null));
  }),
];
