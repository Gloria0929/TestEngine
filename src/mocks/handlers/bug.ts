// src/mocks/handlers/bug.ts
import { http, HttpResponse } from "msw";
import { ok, page } from "../utils";
import { createBugs } from "../seed/bug";
import { registerFolderCleaner } from "../seed/collections";
import { now } from "@/utils/format";
import type { PageQuery } from "@/types";
import type { Bug } from "@/types/models";

export let bugs = createBugs();

// 删除目录时，把目录内的缺陷移回未分类
registerFolderCleaner("bug", (folderId) => {
  bugs = bugs.map((b) => (b.folderId === folderId ? { ...b, folderId: undefined } : b));
});

export const bugHandlers = [
  http.get("/api/bug/list", ({ request }) => {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams) as unknown as PageQuery;
    const status = query.status as string | undefined;
    const severity = query.severity as string | undefined;
    const assignee = query.assignee as string | undefined;
    const moduleId = query.moduleId as string | undefined;
    let list = bugs;
    if (status) list = list.filter((b) => b.status === status);
    if (severity) list = list.filter((b) => b.severity === severity);
    if (assignee) list = list.filter((b) => b.assignee === assignee);
    if (moduleId) list = list.filter((b) => b.moduleId === moduleId);
    return HttpResponse.json(ok(page(list, query)));
  }),
  http.post("/api/bug", async ({ request }) => {
    const body = (await request.json()) as Bug;
    const createTime = body.createTime || now();
    const b = { ...body, id: "b-" + Date.now(), createTime };
    bugs.unshift(b);
    return HttpResponse.json(ok(b));
  }),
  http.get("/api/test-plan/:id/bugs", ({ params }) => {
    const planId = params.id as string;
    return HttpResponse.json(ok(bugs.filter((b) => b.planId === planId)));
  }),
  http.put("/api/bug/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<Bug>;
    bugs = bugs.map((b) => (b.id === params.id ? { ...b, ...body } : b));
    return HttpResponse.json(ok(bugs.find((b) => b.id === params.id) ?? null));
  }),
  http.delete("/api/bug/:id", ({ params }) => {
    bugs = bugs.filter((b) => b.id !== params.id);
    return HttpResponse.json(ok(null));
  }),
];
