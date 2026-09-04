// src/config/moduleFolders.ts — 各业务模块的目录侧边栏配置
import { fetchPlans } from "@/api/testPlan";
import { fetchCaseList } from "@/api/testCase";
import { fetchBugs } from "@/api/bug";
import { fetchOperationLogs } from "@/api/project";
import {
  fetchApiDefinitionPage,
  fetchScenarioPage,
  fetchApiReportPage,
} from "@/api/apiTest";

/** 目录树中的一条业务记录 */
export interface FolderItem {
  id: string;
  name: string;
  /** 所在目录，空 = 未分类 */
  folderId?: string;
  /** 记录详情页地址，无则不可点击 */
  openPath?: string;
}

export interface ModuleFolderConfig {
  /** 路由前缀，命中时在 DefaultLayout 展示该侧边栏 */
  prefix: string;
  /** 命中 prefix 但不需要展示侧边栏的子路径 */
  exclude?: string[];
  /** 目录模块 key（对应 /api/collections/:module/folders） */
  module: string;
  title: string;
  /** 记录列表页地址，点击目录时带 folderId 跳转过滤 */
  listPath: string;
  /** 加载该模块全部记录（不分页） */
  loadItems: () => Promise<FolderItem[]>;
}

export const MODULE_FOLDER_CONFIGS: ModuleFolderConfig[] = [
  {
    prefix: "/test-plan",
    module: "test-plan",
    title: "测试计划目录",
    listPath: "/test-plan/list",
    loadItems: async () => {
      const res: any = await fetchPlans({ pageNum: 1, pageSize: 999 } as any);
      return (res?.list ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        folderId: p.folderId,
        openPath: `/test-plan/execute/${p.id}?name=${encodeURIComponent(p.name)}`,
      }));
    },
  },
  {
    prefix: "/test-case",
    module: "test-case",
    title: "测试用例目录",
    listPath: "/test-case/list",
    loadItems: async () => {
      const res: any = await fetchCaseList({ pageNum: 1, pageSize: 999 } as any);
      return (res?.list ?? []).map((c: any) => ({
        id: c.id,
        name: c.name,
        folderId: c.folderId,
        openPath: `/test-case/detail/${c.id}`,
      }));
    },
  },
  {
    prefix: "/bug",
    module: "bug",
    title: "缺陷目录",
    listPath: "/bug/list",
    loadItems: async () => {
      const res: any = await fetchBugs({ pageNum: 1, pageSize: 999 } as any);
      return (res?.list ?? []).map((b: any) => ({
        id: b.id,
        name: b.title,
        folderId: b.folderId,
      }));
    },
  },
  {
    prefix: "/project",
    module: "project",
    title: "操作日志目录",
    listPath: "/project/log",
    loadItems: async () => {
      const res: any = await fetchOperationLogs({ pageNum: 1, pageSize: 999 } as any);
      return (res?.list ?? []).map((l: any) => ({
        id: l.id,
        name: `${l.action} ${l.object}`,
        folderId: l.folderId,
      }));
    },
  },
  {
    prefix: "/api-test",
    exclude: ["/api-test/debug"],
    module: "api-test",
    title: "接口目录",
    listPath: "/api-test/definition",
    loadItems: async () => {
      const [defs, scens, rpts] = await Promise.all([
        fetchApiDefinitionPage({ pageNum: 1, pageSize: 999 } as any),
        fetchScenarioPage({ pageNum: 1, pageSize: 999 } as any),
        fetchApiReportPage({ pageNum: 1, pageSize: 999 } as any),
      ]);
      return [
        ...defs.list.map((d) => ({
          id: d.id,
          name: d.name,
          folderId: d.folderId,
          openPath: `/api-test/debug?definitionId=${d.id}&name=${encodeURIComponent(d.name)}`,
        })),
        ...scens.list.map((s) => ({
          id: s.id,
          name: s.name,
          folderId: s.folderId,
          openPath: `/api-test/scenario/edit/${s.id}`,
        })),
        ...rpts.list.map((r) => ({
          id: r.id,
          name: r.name,
          folderId: r.folderId,
        })),
      ];
    },
  },
];
