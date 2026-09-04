import type { OperationLog } from "@/types/models";

export function createLogs(): OperationLog[] {
  return [
    {
      id: "l-1",
      scope: "用例",
      object: "登录用例",
      action: "删除",
      user: "test",
      time: "2026-08-26 14:00",
      folderId: "pj-f1",
    },
    {
      id: "l-2",
      scope: "场景",
      object: "登录态通用场景",
      action: "执行",
      user: "Administrator",
      time: "2026-08-26 13:30",
    },
    {
      id: "l-3",
      scope: "接口",
      object: "/api/v1/login",
      action: "修改",
      user: "dev",
      time: "2026-08-26 12:10",
    },
    {
      id: "l-4",
      scope: "缺陷",
      object: "首页加载慢",
      action: "新增",
      user: "test",
      time: "2026-08-26 11:45",
    },
    {
      id: "l-5",
      scope: "项目",
      object: "示例项目",
      action: "修改",
      user: "Administrator",
      time: "2026-08-26 10:20",
    },
    {
      id: "l-6",
      scope: "环境",
      object: "测试环境",
      action: "新增",
      user: "ops",
      time: "2026-08-26 09:50",
    },
    {
      id: "l-7",
      scope: "用例",
      object: "注册用例",
      action: "评审",
      user: "test",
      time: "2026-08-26 09:15",
    },
    {
      id: "l-8",
      scope: "接口",
      object: "/api/v1/logout",
      action: "执行",
      user: "dev",
      time: "2026-08-26 08:40",
    },
  ];
}
