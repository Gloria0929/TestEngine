import { http, HttpResponse } from "msw";
import { ok, page } from "../utils";
import type {
  Project,
  MessageConfig,
  FileItem,
} from "@/types/models";
import type { PageQuery } from "@/types";
import {
  createProjects,
  createPermissionTree,
  createLogs,
  createMessageConfigs,
  createFiles,
} from "../seed/project";

let projects = createProjects();
let logs = createLogs();
let messageConfigs = createMessageConfigs();
let files = createFiles();

export const projectHandlers = [
  http.get("/api/project/list", ({ request }) => {
    const url = new URL(request.url);
    const orgId = url.searchParams.get("orgId") ?? undefined;
    return HttpResponse.json(
      ok(projects.filter((p) => p.orgId === (orgId ?? p.orgId))),
    );
  }),
  http.post("/api/project", async ({ request }) => {
    const body = (await request.json()) as Partial<Project>;
    const project: Project = {
      id: "p-" + Date.now(),
      orgId: body.orgId ?? "100001",
      name: body.name ?? "",
      description: body.description ?? "",
      createTime: body.createTime ?? "",
      members: body.members ?? 0,
      caseCount: body.caseCount ?? 0,
    };
    projects.push(project);
    return HttpResponse.json(ok(project));
  }),
  http.get("/api/project/permission-tree", () =>
    HttpResponse.json(ok(createPermissionTree())),
  ),

  // 消息
  http.get("/api/project/messages", () =>
    HttpResponse.json(ok(messageConfigs)),
  ),
  http.put("/api/project/messages/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<MessageConfig>;
    messageConfigs = messageConfigs.map((m) =>
      m.id === params.id ? { ...m, ...body } : m,
    );
    return HttpResponse.json(
      ok(messageConfigs.find((m) => m.id === params.id) ?? null),
    );
  }),

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

  // 文件
  http.get("/api/project/files", () => HttpResponse.json(ok(files))),
  http.post("/api/project/files", async ({ request }) => {
    const body = (await request.json()) as Partial<FileItem>;
    const file: FileItem = {
      id: "file-" + Date.now(),
      name: body.name ?? "",
      type: body.type ?? "",
      size: body.size ?? 0,
      repo: body.repo ?? "",
      time: body.time ?? "",
    };
    files.unshift(file);
    return HttpResponse.json(ok(file));
  }),
  http.delete("/api/project/files/:id", ({ params }) => {
    files = files.filter((f) => f.id !== params.id);
    return HttpResponse.json(ok(null));
  }),

  // 注意：:id 通用路由必须放在所有具体路径之后，否则会抢占 messages/logs/files 等请求
  http.get("/api/project/:id", ({ params }) =>
    HttpResponse.json(ok(projects.find((p) => p.id === params.id) ?? null)),
  ),
  http.put("/api/project/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<Project>;
    projects = projects.map((p) =>
      p.id === params.id ? { ...p, ...body } : p,
    );
    return HttpResponse.json(ok(null));
  }),
];
