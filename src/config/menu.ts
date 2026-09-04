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
    children: [
      {
        key: "plan-list",
        label: "计划列表",
        path: "/test-plan/list",
        permission: "testPlan:view",
      },
      {
        key: "plan-report",
        label: "测试报告",
        path: "/test-plan/reports",
        permission: "testPlan:view",
      },
    ],
  },
  {
    key: "testcase",
    label: "测试用例",
    icon: "Tickets",
    path: "/test-case/list",
    children: [
      {
        key: "case-list",
        label: "用例列表",
        path: "/test-case/list",
        permission: "testCase:view",
      },
      {
        key: "case-review",
        label: "用例评审",
        path: "/test-case/review",
        permission: "testCase:view",
      },
      {
        key: "case-recycle",
        label: "用例回收站",
        path: "/test-case/recycle",
        permission: "testCase:view",
      },
    ],
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
    key: "project",
    label: "操作日志",
    icon: "Document",
    path: "/project/log",
    permission: "project:view",
  },
];
