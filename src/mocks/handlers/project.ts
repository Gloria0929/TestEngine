import { http, HttpResponse } from "msw";
import { ok, page } from "../utils";
import type { PageQuery } from "@/types";
import { createLogs } from "../seed/project";
import { registerFolderCleaner } from "../seed/collections";

let logs = createLogs();

// 删除目录时，把目录内的日志移回未分类
registerFolderCleaner("project", (folderId) => {
  logs = logs.map((l) => (l.folderId === folderId ? { ...l, folderId: undefined } : l));
});

export const projectHandlers = [
  // 日志
  http.get("/api/project/logs", ({ request }) => {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams) as unknown as PageQuery;
    const scope = query.scope as string | undefined;
    const object = query.object as string | undefined;
    const action = query.action as string | undefined;
    const user = query.user as string | undefined;
    const folderId = url.searchParams.get("folderId") ?? undefined;
    let list = logs;
    if (scope) list = list.filter((l) => l.scope === scope);
    if (object) list = list.filter((l) => l.object.includes(object));
    if (action) list = list.filter((l) => l.action.includes(action));
    if (user) list = list.filter((l) => l.user.includes(user));
    if (folderId === "none") list = list.filter((l) => !l.folderId);
    else if (folderId) list = list.filter((l) => l.folderId === folderId);
    return HttpResponse.json(ok(page(list, query)));
  }),
  // 移动日志到目录
  http.put("/api/project/logs/:id/folder", async ({ params, request }) => {
    const { folderId } = (await request.json()) as { folderId?: string };
    logs = logs.map((l) =>
      l.id === params.id ? { ...l, folderId: folderId || undefined } : l,
    );
    return HttpResponse.json(ok(null));
  }),
];
