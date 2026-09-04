// src/mocks/handlers/collections.ts — 通用目录管理（按模块划分）
import { http, HttpResponse } from "msw";
import { ok } from "../utils";
import {
  getFolders,
  addFolder,
  updateFolder,
  deleteFolder,
  clearFolderRef,
} from "../seed/collections";

export const collectionsHandlers = [
  http.get("/api/collections/:module/folders", ({ params }) =>
    HttpResponse.json(ok(getFolders(String(params.module))))
  ),
  http.post("/api/collections/:module/folders", async ({ params, request }) => {
    const { name } = (await request.json()) as { name: string };
    return HttpResponse.json(ok(addFolder(String(params.module), name)));
  }),
  http.put("/api/collections/:module/folders/:folderId", async ({ params, request }) => {
    const { name } = (await request.json()) as { name: string };
    updateFolder(String(params.module), String(params.folderId), name);
    return HttpResponse.json(ok(null));
  }),
  http.delete("/api/collections/:module/folders/:folderId", ({ params }) => {
    const m = String(params.module);
    const fid = String(params.folderId);
    deleteFolder(m, fid);
    clearFolderRef(m, fid);
    return HttpResponse.json(ok(null));
  }),
];
