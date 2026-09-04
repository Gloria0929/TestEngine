// src/mocks/seed/collections.ts — 各业务模块的目录数据（记录通过 folderId 归入目录）
import type { ModuleFolder } from "../../types/models";

const state: Record<string, ModuleFolder[]> = {
  "test-plan": [
    { id: "tp-f1", name: "版本回归" },
    { id: "tp-f2", name: "冒烟测试" },
  ],
  "test-case": [{ id: "tc-f1", name: "核心用例" }],
  bug: [{ id: "bug-f1", name: "本迭代缺陷" }],
  project: [{ id: "pj-f1", name: "审计留存" }],
  "api-test": [
    { id: "at-f1", name: "用户中心接口" },
    { id: "at-f2", name: "订单链路场景" },
  ],
};

let seq = 100;
const nextId = (p: string) => `${p}-${++seq}`;

export function getFolders(module: string): ModuleFolder[] {
  return state[module] ?? [];
}

export function addFolder(module: string, name: string): ModuleFolder {
  const folder: ModuleFolder = { id: nextId("f"), name };
  (state[module] ??= []).push(folder);
  return folder;
}

export function updateFolder(module: string, folderId: string, name: string): void {
  const f = (state[module] ?? []).find((x) => x.id === folderId);
  if (f) f.name = name;
}

/** 删除目录 */
export function deleteFolder(module: string, folderId: string): void {
  const list = state[module] ?? [];
  const idx = list.findIndex((x) => x.id === folderId);
  if (idx >= 0) list.splice(idx, 1);
}

/**
 * 各模块记录的 folderId 清理函数注册表。
 * 模块 handler 启动时注册：删除目录后把目录内记录移回未分类。
 */
const refCleaners: Record<string, (folderId: string) => void> = {};

export function registerFolderCleaner(module: string, fn: (folderId: string) => void) {
  refCleaners[module] = fn;
}

export function clearFolderRef(module: string, folderId: string): void {
  refCleaners[module]?.(folderId);
}
