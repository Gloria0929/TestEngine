// src/api/collections.ts — 通用目录管理（按模块划分，业务记录通过 folderId 归入目录）
import { request } from "@/utils/request";
import type { ModuleFolder } from "@/types/models";

/** 获取某模块的目录列表 */
export function fetchFolders(module: string) {
  return request<ModuleFolder[]>({
    url: `/api/collections/${module}/folders`,
    method: "get",
  });
}

/** 新建目录 */
export function createFolder(module: string, name: string) {
  return request<ModuleFolder>({
    url: `/api/collections/${module}/folders`,
    method: "post",
    data: { name },
  });
}

/** 重命名目录 */
export function renameFolder(module: string, folderId: string, name: string) {
  return request<null>({
    url: `/api/collections/${module}/folders/${folderId}`,
    method: "put",
    data: { name },
  });
}

/** 删除目录（目录内记录移回未分类） */
export function removeFolder(module: string, folderId: string) {
  return request<null>({
    url: `/api/collections/${module}/folders/${folderId}`,
    method: "delete",
  });
}
