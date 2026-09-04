import { http, HttpResponse } from "msw";
import { ok, page } from "../utils";
import type { PageQuery } from "@/types";
import { createLogs } from "../seed/project";

let logs = createLogs();

export const projectHandlers = [
  // 日志
  http.get("/api/project/logs", ({ request }) => {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams) as unknown as PageQuery;
    const scope = query.scope as string | undefined;
    const object = query.object as string | undefined;
    const action = query.action as string | undefined;
    const user = query.user as string | undefined;
    let list = logs;
    if (scope) list = list.filter((l) => l.scope === scope);
    if (object) list = list.filter((l) => l.object.includes(object));
    if (action) list = list.filter((l) => l.action.includes(action));
    if (user) list = list.filter((l) => l.user.includes(user));
    return HttpResponse.json(ok(page(list, query)));
  }),
];
