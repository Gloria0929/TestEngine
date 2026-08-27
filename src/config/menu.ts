// src/config/menu.ts
export interface MenuItem {
  key: string
  i18nKey: string
  icon?: string
  path?: string
  permission?: string
  children?: MenuItem[]
}

export const menuTree: MenuItem[] = [
  { key: 'home', i18nKey: 'menu.workstation', icon: 'Odometer', path: '/workstation/home' },
  { key: 'project', i18nKey: 'menu.project', icon: 'Folder', path: '/project/info' },
  { key: 'testplan', i18nKey: 'menu.testPlan', icon: 'Calendar', path: '/test-plan/list' },
  {
    key: 'testcase', i18nKey: 'menu.testCase', icon: 'Tickets', children: [
      { key: 'case-list', i18nKey: 'menu.caseList', path: '/test-case/list', permission: 'testCase:view' },
      { key: 'mindmap', i18nKey: 'menu.mindmap', path: '/test-case/mindmap', permission: 'testCase:view' },
      { key: 'review', i18nKey: 'menu.review', path: '/test-case/review', permission: 'testCase:view' },
    ],
  },
  {
    key: 'apiparent', i18nKey: 'menu.apiTest', icon: 'Connection', children: [
      { key: 'api-debug', i18nKey: 'menu.apiDebug', path: '/api-test/debug', permission: 'apiTest:view' },
      { key: 'api-def', i18nKey: 'menu.apiDefinition', path: '/api-test/definition', permission: 'apiTest:view' },
      { key: 'api-scenario', i18nKey: 'menu.apiScenario', path: '/api-test/scenario', permission: 'apiTest:view' },
      { key: 'api-report', i18nKey: 'menu.apiReport', path: '/api-test/report', permission: 'apiTest:view' },
      { key: 'api-mock', i18nKey: 'menu.apiMock', path: '/api-test/mock', permission: 'apiTest:view' },
    ],
  },
  { key: 'bug', i18nKey: 'menu.bug', icon: 'WarningFilled', path: '/bug/list', permission: 'bug:view' },
  { key: 'setting', i18nKey: 'menu.setting', icon: 'Setting', path: '/setting/system/user', permission: 'system:view' },
]
