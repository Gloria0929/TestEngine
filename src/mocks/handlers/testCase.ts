// src/mocks/handlers/testCase.ts

import { http, HttpResponse } from "msw";
import { ok, page } from "../utils";
import { createModules, createCases, createReviews } from "../seed/testCase";
import type { PageQuery } from "@/types";
import type { TestCase, Review } from "@/types/models";

let modules = createModules();
let cases = createCases();
let recycleBin: TestCase[] = [];
let reviews = createReviews();

export const testCaseHandlers = [
  http.get("/api/test-case/modules", () => HttpResponse.json(ok(modules))),
  http.post("/api/test-case/modules", async ({ request }) => {
    const body = (await request.json()) as { name: string; parentId?: string };
    const node = { id: "m-" + Date.now(), name: body.name, children: [] };
    if (body.parentId) {
      const walk = (list: typeof modules) =>
        list.forEach((m) => {
          if (m.id === body.parentId) m.children.push(node);
          else walk(m.children);
        });
      walk(modules);
    } else modules.push(node);
    return HttpResponse.json(ok(node));
  }),
  http.get("/api/test-case/list", ({ request }) => {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams) as unknown as PageQuery;
    const moduleId = query.moduleId as string | undefined;
    const level = query.level as string | undefined;
    const folderId = url.searchParams.get("folderId") ?? undefined;
    let list = cases;
    if (moduleId) list = list.filter((c) => c.moduleId === moduleId);
    if (level) list = list.filter((c) => c.level === level);
    if (folderId === "none") list = list.filter((c) => !c.folderId);
    else if (folderId) list = list.filter((c) => c.folderId === folderId);
    return HttpResponse.json(ok(page(list, query)));
  }),
  http.get("/api/test-case/recycle", () => HttpResponse.json(ok(recycleBin))),
  http.post("/api/test-case/recycle/:id/restore", ({ params }) => {
    const it = recycleBin.find((c) => c.id === params.id);
    if (it) {
      cases.unshift(it);
      recycleBin = recycleBin.filter((c) => c.id !== params.id);
    }
    return HttpResponse.json(ok(null));
  }),
  http.delete("/api/test-case/recycle/:id", ({ params }) => {
    recycleBin = recycleBin.filter((c) => c.id !== params.id);
    return HttpResponse.json(ok(null));
  }),
  http.get("/api/test-case/reviews", () => HttpResponse.json(ok(reviews))),
  http.post("/api/test-case/reviews", async ({ request }) => {
    const body = (await request.json()) as Partial<Review>;
    const review: Review = {
      id: "rv-" + Date.now(),
      name: body.name ?? "",
      reviewers: body.reviewers ?? [],
      status: "PENDING",
      caseCount: body.caseIds?.length ?? 0,
      caseIds: body.caseIds ?? [],
      startTime: body.startTime ?? "",
      endTime: body.endTime ?? "",
      folderId: body.folderId,
    };
    reviews.unshift(review);
    return HttpResponse.json(ok(review));
  }),
  http.put("/api/test-case/reviews/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<Review>;
    reviews = reviews.map((r) => (r.id === params.id ? { ...r, ...body } : r));
    return HttpResponse.json(
      ok(reviews.find((r) => r.id === params.id) ?? null),
    );
  }),
  http.get("/api/test-case/reviews/:id", ({ params }) => {
    const review = reviews.find((r) => r.id === params.id);
    if (!review) return HttpResponse.json(ok(null));
    return HttpResponse.json(
      ok({
        ...review,
        cases: cases.filter((c) => review.caseIds.includes(c.id)),
      }),
    );
  }),
  http.post(
    "/api/test-case/reviews/:id/result",
    async ({ params, request }) => {
      const body = (await request.json()) as {
        results: { caseId: string; passed: boolean; comment?: string }[];
      };
      const review = reviews.find((r) => r.id === params.id);
      if (!review) return HttpResponse.json(ok(null));
      body.results.forEach((r) => {
        cases = cases.map((c) =>
          c.id === r.caseId
            ? { ...c, status: r.passed ? "READY" : "DRAFT" }
            : c,
        );
      });
      // 合并每用例评审结果，全部评审完才得出整体结论
      const merged: Record<string, { passed: boolean; comment: string }> = {
        ...(review.results ?? {}),
      };
      body.results.forEach((r) => {
        merged[r.caseId] = { passed: r.passed, comment: r.comment ?? "" };
      });
      const reviewed = review.caseIds.filter((id) => merged[id]).length;
      const status: Review["status"] =
        reviewed < review.caseIds.length
          ? "PENDING"
          : review.caseIds.every((id) => merged[id]?.passed)
            ? "PASSED"
            : "REJECTED";
      const updated: Review = { ...review, results: merged, status };
      reviews = reviews.map((r) => (r.id === params.id ? updated : r));
      return HttpResponse.json(ok(updated));
    },
  ),
  http.get("/api/test-case/:id", ({ params }) =>
    HttpResponse.json(ok(cases.find((c) => c.id === params.id) ?? null)),
  ),
  http.post("/api/test-case", async ({ request }) => {
    const body = (await request.json()) as TestCase;
    const c = {
      ...body,
      id: "c-" + Date.now(),
      updateTime: new Date().toISOString(),
    };
    cases.unshift(c);
    return HttpResponse.json(ok(c));
  }),
  http.put("/api/test-case/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<TestCase>;
    cases = cases.map((c) =>
      c.id === params.id
        ? { ...c, ...body, updateTime: new Date().toISOString() }
        : c,
    );
    return HttpResponse.json(ok(cases.find((c) => c.id === params.id)));
  }),
  http.delete("/api/test-case/:id", ({ params }) => {
    const it = cases.find((c) => c.id === params.id);
    if (it) recycleBin.unshift(it);
    cases = cases.filter((c) => c.id !== params.id);
    return HttpResponse.json(ok(null));
  }),
];
