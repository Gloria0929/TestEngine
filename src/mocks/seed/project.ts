import type {
  Project,
  PermissionNode,
  MessageConfig,
  OperationLog,
  FileItem,
} from "@/types/models";

export function createProjects(): Project[] {
  return [
    {
      id: "p-1",
      orgId: "100001",
      name: "示例项目",
      description: "演示项目，含全量资产",
      createTime: "2026-08-01 10:00:00",
      members: 8,
      caseCount: 1284,
    },
    {
      id: "p-2",
      orgId: "100001",
      name: "空项目",
      description: "无任何资产",
      createTime: "2026-08-10 10:00:00",
      members: 2,
      caseCount: 0,
    },
    {
      id: "p-3",
      orgId: "100001",
      name: "电商核心项目",
      description: "电商业务",
      createTime: "2026-08-15 10:00:00",
      members: 5,
      caseCount: 342,
    },
  ];
}
export function createPermissionTree(): PermissionNode[] {
  return [
    {
      id: "project",
      name: "项目管理",
      children: [{ id: "project:view", name: "查看" }],
    },
    {
      id: "testCase",
      name: "测试用例",
      children: [
        { id: "testCase:view", name: "查看" },
        { id: "testCase:create", name: "新建" },
        { id: "testCase:edit", name: "编辑" },
      ],
    },
    {
      id: "apiTest",
      name: "接口测试",
      children: [
        { id: "apiTest:view", name: "查看" },
        { id: "apiTest:debug", name: "调试" },
      ],
    },
    {
      id: "bug",
      name: "缺陷管理",
      children: [
        { id: "bug:view", name: "查看" },
        { id: "bug:create", name: "新建" },
      ],
    },
    {
      id: "testPlan",
      name: "测试计划",
      children: [{ id: "testPlan:view", name: "查看" }],
    },
    {
      id: "system",
      name: "系统设置",
      children: [{ id: "system:view", name: "查看" }],
    },
  ];
}
export function createLogs(): OperationLog[] {
  return [
    {
      id: "l-1",
      scope: "用例",
      object: "登录用例",
      action: "删除",
      user: "test",
      time: "2026-08-26 14:00",
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
export function createMessageConfigs(): MessageConfig[] {
  return [
    { id: "m1", type: "站内信", enabled: true, receivers: ["test", "dev"] },
    {
      id: "m2",
      type: "邮件",
      enabled: true,
      receivers: ["admin@testengine.io"],
    },
    { id: "m3", type: "企业微信", enabled: false, receivers: [] },
    { id: "m4", type: "钉钉", enabled: false, receivers: [] },
    { id: "m5", type: "飞书", enabled: false, receivers: [] },
    {
      id: "m6",
      type: "Webhook",
      enabled: true,
      receivers: ["https://hook.example.com"],
    },
  ];
}
export function createTemplates(): never[] {
  return [];
}
export function createFiles(): FileItem[] {
  return [
    {
      id: "file-1",
      name: "登录模块脚本.sql",
      type: "SQL",
      size: 2048,
      repo: "GitLab",
      time: "2026-08-26 10:00",
    },
    {
      id: "file-2",
      name: "测试数据.csv",
      type: "CSV",
      size: 51200,
      repo: "GitHub",
      time: "2026-08-25 09:00",
    },
  ];
}
