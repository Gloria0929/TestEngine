import type { Project, ProjectMember, UserGroup, PermissionNode, Environment, MessageConfig, OperationLog, FileItem, ProjectTemplate, Script } from '@/types/models'

export function createProjects(): Project[] {
  return [
    { id: 'p-1', orgId: '100001', name: '示例项目', description: '演示项目，含全量资产', createTime: '2026-08-01 10:00:00', members: 8, caseCount: 1284 },
    { id: 'p-2', orgId: '100001', name: '空项目', description: '无任何资产', createTime: '2026-08-10 10:00:00', members: 2, caseCount: 0 },
    { id: 'p-3', orgId: '100001', name: '电商核心项目', description: '电商业务', createTime: '2026-08-15 10:00:00', members: 5, caseCount: 342 },
  ]
}
export function createMembers(): ProjectMember[] {
  return [
    { id: 'u-1', name: '系统管理员', email: 'admin@testengine.io', role: '项目管理员', groupId: 'g-1' },
    { id: 'u-2', name: '测试工程师', email: 'test@testengine.io', role: '测试工程师', groupId: 'g-2' },
    { id: 'u-3', name: '开发工程师', email: 'dev@testengine.io', role: '开发工程师', groupId: 'g-3' },
  ]
}
export function createGroups(): UserGroup[] {
  return [
    { id: 'g-1', name: '项目管理员', builtin: true, permissions: ['project:view', 'testCase:view', 'testCase:create', 'testCase:edit', 'apiTest:view', 'bug:view'] },
    { id: 'g-2', name: '测试工程师', builtin: true, permissions: ['project:view', 'testCase:view', 'testCase:create', 'testCase:edit', 'apiTest:view', 'apiTest:debug', 'testPlan:view', 'bug:view', 'bug:create'] },
    { id: 'g-3', name: '开发工程师', builtin: true, permissions: ['apiTest:view', 'apiTest:debug', 'bug:view'] },
  ]
}
export function createPermissionTree(): PermissionNode[] {
  return [
    { id: 'project', name: '项目管理', children: [{ id: 'project:view', name: '查看' }] },
    { id: 'testCase', name: '测试用例', children: [
      { id: 'testCase:view', name: '查看' }, { id: 'testCase:create', name: '新建' }, { id: 'testCase:edit', name: '编辑' },
    ] },
    { id: 'apiTest', name: '接口测试', children: [
      { id: 'apiTest:view', name: '查看' }, { id: 'apiTest:debug', name: '调试' },
    ] },
    { id: 'bug', name: '缺陷管理', children: [
      { id: 'bug:view', name: '查看' }, { id: 'bug:create', name: '新建' },
    ] },
    { id: 'testPlan', name: '测试计划', children: [{ id: 'testPlan:view', name: '查看' }] },
    { id: 'system', name: '系统设置', children: [{ id: 'system:view', name: '查看' }] },
  ]
}
export function createEnvironments(): Environment[] {
  return [
    { id: 'env-1', projectId: 'p-1', name: '测试环境', domain: 'http://demo.testengine.io', variables: [{ key: 'token', value: 'abc123', enabled: true }], hosts: [], headers: [] },
    { id: 'env-2', projectId: 'p-1', name: '预发环境', domain: 'https://pre.testengine.io', variables: [], hosts: [{ key: 'api.testengine.io', value: '10.0.0.8', enabled: true }], headers: [] },
  ]
}
export function createLogs(): OperationLog[] {
  return [
    { id: 'l-1', scope: '用例', object: '登录用例', action: '删除', user: 'test', time: '2026-08-26 14:00' },
    { id: 'l-2', scope: '场景', object: '登录态通用场景', action: '执行', user: 'Administrator', time: '2026-08-26 13:30' },
  ]
}
export function createMessageConfigs(): MessageConfig[] {
  return [
    { id: 'm1', type: '站内信', enabled: true, receivers: ['test', 'dev'] },
    { id: 'm2', type: '邮件', enabled: true, receivers: ['admin@testengine.io'] },
    { id: 'm3', type: '机器人', enabled: false, receivers: [] },
  ]
}
export function createTemplates(): ProjectTemplate[] {
  return [
    { id: 'tpl-1', name: '功能用例模板', kind: '用例', fields: [
      { id: 'f-1', key: 'title', label: '用例标题', required: true, type: 'text' },
      { id: 'f-2', key: 'precondition', label: '前置条件', required: false, type: 'textarea' },
    ] },
    { id: 'tpl-2', name: '缺陷模板', kind: '缺陷', fields: [
      { id: 'f-3', key: 'severity', label: '严重程度', required: true, type: 'select' },
    ] },
  ]
}
export function createFiles(): FileItem[] {
  return [
    { id: 'file-1', name: '登录模块脚本.sql', type: 'SQL', size: 2048, repo: 'GitLab', time: '2026-08-26 10:00' },
    { id: 'file-2', name: '测试数据.csv', type: 'CSV', size: 51200, repo: 'GitHub', time: '2026-08-25 09:00' },
  ]
}
export function createScripts(): Script[] {
  return [
    { id: 'script-1', name: '登录前脚本', content: 'pm.environment.set("token", "abc");', updateTime: '2026-08-26 10:00' },
    { id: 'script-2', name: '数据清理脚本', content: 'console.log("cleanup");', updateTime: '2026-08-25 09:00' },
  ]
}
