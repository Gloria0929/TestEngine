import type { Project, ProjectMember, UserGroup, PermissionNode } from '@/types/models'

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
