// src/config/menu.ts
export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  permission?: string;
  children?: MenuItem[];
}

export const menuTree: MenuItem[] = [
  {
    key: "testplan",
    label: "测试计划",
    icon: "Calendar",
    path: "/test-plan/list",
  },
  {
    key: "testcase",
    label: "测试用例",
    icon: "Tickets",
    path: "/test-case/list",
  },
  {
    key: "bug",
    label: "缺陷管理",
    icon: "Warning",
    path: "/bug/list",
    permission: "bug:view",
  },
  {
    key: "apiparent",
    label: "接口测试",
    icon: "Connection",
    path: "/api-test/debug",
    children: [
      {
        key: "api-debug",
        label: "接口调试",
        path: "/api-test/debug",
        permission: "apiTest:view",
      },
      {
        key: "api-def",
        label: "接口定义",
        path: "/api-test/definition",
        permission: "apiTest:view",
      },
      {
        key: "api-scenario",
        label: "场景管理",
        path: "/api-test/scenario",
        permission: "apiTest:view",
      },
      {
        key: "api-report",
        label: "接口报告",
        path: "/api-test/report",
        permission: "apiTest:view",
      },
    ],
  },
  {
    key: "log",
    label: "日志",
    icon: "Document",
    path: "/project/log",
    permission: "project:view",
  },
];
