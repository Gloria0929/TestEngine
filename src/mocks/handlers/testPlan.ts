// src/mocks/handlers/testPlan.ts
import { http, HttpResponse } from "msw";
import { ok, page } from "../utils";
import { createPlans } from "../seed/testPlan";
import { createCases, createModules } from "../seed/testCase";
import type { PageQuery } from "@/types";
import type {
  TestPlan,
  PlanCaseResult,
  PlanReport,
  ModuleNode,
  CaseExecuteHistory,
} from "@/types/models";

let plans = createPlans();
let planCases: Record<string, PlanCaseResult[]> = {};
let caseHistory: Record<string, CaseExecuteHistory[]> = {};

// 未手动提交过结果时，按计划的 progress/passRate 合成演示执行结果，
// 保证列表页通过率、详情页执行进度、报告页统计三者数据一致
function resolveResults(planId: string): PlanCaseResult[] {
  if (planCases[planId]) return planCases[planId];
  const plan = plans.find((p) => p.id === planId);
  if (!plan || plan.status === "DRAFT") return [];
  const all = createCases();
  const executed = Math.max(
    1,
    Math.min(all.length, Math.round((all.length * (plan.progress ?? 0)) / 100)),
  );
  const passCount = Math.max(
    0,
    Math.min(executed, Math.round((executed * (plan.passRate ?? 0)) / 100)),
  );
  return all.slice(0, executed).map((c, i) => ({
    caseId: c.id,
    result: (i < passCount
      ? "PASS"
      : i % 2 === 0
        ? "FAIL"
        : "BLOCK") as PlanCaseResult["result"],
    actual: "",
  }));
}

export const testPlanHandlers = [
  http.get("/api/test-plan/list", ({ request }) => {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams) as unknown as PageQuery;
    let filtered = plans;
    const status = query.status as string | undefined;
    const group = query.group as string | undefined;
    if (status) filtered = filtered.filter((p) => p.status === status);
    if (group && group !== "全部")
      filtered = filtered.filter((p) => p.group === group);
    return HttpResponse.json(ok(page(filtered, query)));
  }),
  http.post("/api/test-plan", async ({ request }) => {
    const body = (await request.json()) as TestPlan;
    const p = { ...body, id: "tp-" + Date.now() };
    plans.unshift(p);
    return HttpResponse.json(ok(p));
  }),
  http.put("/api/test-plan/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<TestPlan>;
    plans = plans.map((p) => (p.id === params.id ? { ...p, ...body } : p));
    return HttpResponse.json(ok(null));
  }),
  http.delete("/api/test-plan/:id", ({ params }) => {
    plans = plans.filter((p) => p.id !== params.id);
    return HttpResponse.json(ok(null));
  }),
  http.get("/api/test-plan/:id", ({ params }) => {
    return HttpResponse.json(ok(plans.find((p) => p.id === params.id) ?? null));
  }),
  http.post("/api/test-plan/:id/copy", ({ params }) => {
    const src = plans.find((p) => p.id === params.id);
    if (!src) return HttpResponse.json(ok(null));
    const cp = { ...src, id: "tp-" + Date.now(), name: src.name + "（副本）" };
    plans.unshift(cp);
    return HttpResponse.json(ok(cp));
  }),
  http.get("/api/test-plan/:id/cases", ({ request, params }) => {
    const url = new URL(request.url);
    const moduleId = url.searchParams.get("moduleId");
    const testPoint = url.searchParams.get("testPoint");
    const keyword = url.searchParams.get("keyword")?.toLowerCase();
    let cases = createCases();
    const collectIds = (nodes: ModuleNode[]): string[] =>
      nodes.flatMap((n) => [n.id, ...collectIds(n.children)]);
    const matchModule = (nodes: ModuleNode[]): string[] => {
      for (const n of nodes) {
        if (n.id === moduleId) return [n.id, ...collectIds(n.children)];
        const child = matchModule(n.children);
        if (child.length) return child;
      }
      return [];
    };
    if (moduleId) {
      const ids = matchModule(createModules());
      cases = cases.filter((c) => ids.includes(c.moduleId));
    }
    if (testPoint) {
      cases = cases.filter((c) => c.testPoint === testPoint);
    }
    if (keyword) {
      cases = cases.filter(
        (c) =>
          c.name.toLowerCase().includes(keyword) ||
          c.id.toLowerCase().includes(keyword),
      );
    }
    const result = resolveResults(params.id as string);
    return HttpResponse.json(
      ok(
        cases.map((c) => ({
          ...c,
          result: result.find((r) => r.caseId === c.id)?.result ?? null,
        })),
      ),
    );
  }),
  http.post("/api/test-plan/:id/results", async ({ params, request }) => {
    const body = (await request.json()) as PlanCaseResult[];
    const planId = params.id as string;
    const prev = planCases[planId] ?? resolveResults(planId);
    planCases[planId] = body;
    for (const r of body) {
      const prevResult = prev.find((p) => p.caseId === r.caseId)?.result;
      if (r.result && r.result !== prevResult) {
        const key = `${planId}:${r.caseId}`;
        if (!caseHistory[key]) caseHistory[key] = [];
        caseHistory[key].unshift({
          id: "eh-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
          planId,
          caseId: r.caseId,
          result: r.result,
          actual: r.actual ?? "",
          executor: "Administrator",
          executeTime: new Date().toISOString().slice(0, 19).replace("T", " "),
        });
      }
    }
    return HttpResponse.json(ok(null));
  }),
  http.get("/api/test-plan/:planId/cases/:caseId/history", ({ params }) => {
    const key = `${params.planId as string}:${params.caseId as string}`;
    return HttpResponse.json(ok(caseHistory[key] ?? []));
  }),
  http.get("/api/test-plan/:id/history", ({ params }) => {
    const planId = params.id as string;
    const list = Object.values(caseHistory)
      .flat()
      .filter((h) => h.planId === planId)
      .sort((a, b) => b.executeTime.localeCompare(a.executeTime));
    return HttpResponse.json(ok(list));
  }),
  http.get("/api/test-plan/:id/report", ({ params }) => {
    const planId = params.id as string;
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return HttpResponse.json(ok(null));
    const resultMap = resolveResults(planId);
    const caseRows = createCases();
    const results: PlanReport["results"] = caseRows.map((c) => ({
      caseId: c.id,
      caseName: c.name,
      testPoint: c.testPoint,
      level: c.level,
      type: "manual",
      result: resultMap.find((r) => r.caseId === c.id)?.result ?? "SKIP",
    }));
    const total = results.length;
    const passed = results.filter((r) => r.result === "PASS").length;
    const failed = results.filter((r) => r.result === "FAIL").length;
    const blocked = results.filter((r) => r.result === "BLOCK").length;
    const skipped = results.filter((r) => r.result === "SKIP").length;
    // 通过率与详情页口径一致：按已执行（排除跳过）计算
    const executedCount = results.filter((r) => r.result !== "SKIP").length;
    const passRate = executedCount
      ? Math.round((passed / executedCount) * 100)
      : 0;
    const moduleNameMap: Record<string, string> = {};
    const walk = (nodes: ModuleNode[]) => {
      for (const n of nodes) {
        moduleNameMap[n.id] = n.name;
        walk(n.children);
      }
    };
    walk(createModules());
    const failCounts: Record<string, number> = {};
    for (const c of caseRows) {
      const r = resultMap.find((x) => x.caseId === c.id)?.result;
      if (r === "FAIL" || r === "BLOCK") {
        const key = moduleNameMap[c.moduleId] ?? c.moduleId;
        failCounts[key] = (failCounts[key] ?? 0) + 1;
      }
    }
    const failDistribution = Object.entries(failCounts).map(
      ([module, count]) => ({ module, count }),
    );
    const report: PlanReport = {
      id: "rp-" + planId,
      planId,
      name: plan.name ?? "",
      progress: plan.progress ?? 0,
      passRate,
      total,
      passed,
      failed,
      blocked,
      skipped,
      failDistribution,
      results,
      shareUrl: "",
      expireAt: "",
    };
    return HttpResponse.json(ok(report));
  }),
  http.post("/api/test-plan/:id/report/export", ({ params }) => {
    return HttpResponse.json(ok({ url: "/reports/" + params.id + ".html" }));
  }),
  http.post("/api/test-plan/:id/report/share", ({ params }) => {
    return HttpResponse.json(
      ok({
        shareUrl: "https://mock.testengine.io/share/" + params.id,
        expireAt: "2026-09-03 23:59:59",
      }),
    );
  }),

  // 报告列表
  http.get("/api/test-report/list", ({ request }) => {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams) as unknown as PageQuery;
    const reports = [
      {
        id: "rp-1",
        name: "登录模块测试报告",
        type: "测试计划报告",
        planName: "v1.0 回归测试",
        result: "通过",
        passRate: 96,
        trigger: "手动执行",
        owner: "Administrator",
        createTime: "2026-08-28 15:30",
      },
      {
        id: "rp-2",
        name: "支付接口测试报告",
        type: "接口测试报告",
        planName: "支付中台接口测试",
        result: "部分通过",
        passRate: 72,
        trigger: "定时任务",
        owner: "test",
        createTime: "2026-08-28 02:00",
      },
      {
        id: "rp-3",
        name: "订单模块测试报告",
        type: "测试计划报告",
        planName: "订单中心回归",
        result: "失败",
        passRate: 45,
        trigger: "API 触发",
        owner: "dev",
        createTime: "2026-08-27 18:00",
      },
      {
        id: "rp-4",
        name: "系统任务执行报告",
        type: "任务报告",
        planName: "每日自动巡检",
        result: "通过",
        passRate: 100,
        trigger: "定时任务",
        owner: "Administrator",
        createTime: "2026-08-27 06:00",
      },
    ];
    return HttpResponse.json(ok(page(reports, query)));
  }),
  http.delete("/api/test-report/:id", () => {
    return HttpResponse.json(ok(null));
  }),
  http.post("/api/upload", async ({ request }) => {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const name = file?.name ?? "file";
    return HttpResponse.json(
      ok({ url: "/uploads/" + Date.now() + "-" + name }),
    );
  }),
];
