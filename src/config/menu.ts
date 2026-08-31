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
  { key: "home", label: "工作台", icon: "Odometer", path: "/workstation/home" },
  {
    key: "project",
    label: "项目管理",
    icon: "Folder",
    children: [
      {
        key: "project-info",
        label: "基本信息",
        path: "/project/info",
        permission: "project:view",
      },
      {
        key: "project-file",
        label: "文件管理",
        path: "/project/file",
        permission: "project:view",
      },
      {
        key: "project-message",
        label: "消息管理",
        path: "/project/message",
        permission: "project:view",
      },
      {
        key: "project-log",
        label: "日志",
        path: "/project/log",
        permission: "project:view",
      },
    ],
  },
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
    children: [
      {
        key: "case-list",
        label: "用例列表",
        path: "/test-case/list",
        permission: "testCase:view",
      },
      {
        key: "mindmap",
        label: "脑图",
        path: "/test-case/mindmap",
        permission: "testCase:view",
      },
      {
        key: "review",
        label: "用例评审",
        path: "/test-case/review",
        permission: "testCase:view",
      },
    ],
  },
  {
    key: "apiparent",
    label: "接口测试",
    icon: "Connection",
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
      {
        key: "api-mock",
        label: "Mock",
        path: "/api-test/mock",
        permission: "apiTest:view",
      },
    ],
  },
  {
    key: "bug",
    label: "缺陷管理",
    icon: "WarningFilled",
    path: "/bug/list",
    permission: "bug:view",
  },
  {
    key: "setting",
    label: "系统设置",
    icon: "Setting",
    path: "/setting/system/user",
    permission: "system:view",
  },
];
