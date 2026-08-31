import type { SysUser, SysParam, Plugin, Organization, ProjectMember, UserGroup, Integration } from '@/types/models'
export function createSysUsers(): SysUser[] {
  return [
    { id: 'u-1', username: 'Administrator', name: '系统管理员', email: 'admin@testengine.io', role: '系统管理员', enabled: true },
    { id: 'u-2', username: 'test', name: '测试工程师', email: 'test@testengine.io', role: '系统成员', enabled: true },
    { id: 'u-3', username: 'dev', name: '开发工程师', email: 'dev@testengine.io', role: '系统成员', enabled: true },
  ]
}
export function createSysParams(): SysParam[] {
  return [
    { id: 'p1', key: 'base.url', value: 'http://47.92.225.146:8081', description: '平台基础地址' },
    { id: 'p2', key: 'mail.host', value: 'smtp.testengine.io', description: '邮件服务器' },
  ]
}
export function createPlugins(): Plugin[] {
  return [
    { id: 'pl-1', name: 'MeterSphere TCP 协议', type: '协议', version: '1.0.0', enabled: true },
    { id: 'pl-2', name: 'Jira 缺陷插件', type: '缺陷', version: '2.1.0', enabled: false },
  ]
}
export function createSysOrgs(): Organization[] {
  return [{ id: '100001', name: '默认组织', description: '演示组织' }]
}
export function createOrgMembers(): ProjectMember[] {
  return [
    { id: 'om-1', name: '组织管理员', email: 'admin@testengine.io', role: '组织管理员', groupId: 'og-1' },
    { id: 'om-2', name: '测试工程师', email: 'test@testengine.io', role: '组织成员', groupId: 'og-2' },
    { id: 'om-3', name: '开发工程师', email: 'dev@testengine.io', role: '组织成员', groupId: 'og-2' },
  ]
}
export function createOrgGroups(): UserGroup[] {
  return [
    { id: 'og-1', name: '组织管理员', builtin: true, scope: 'internal', memberCount: 1, permissions: ['project:view', 'testCase:view', 'testCase:create', 'apiTest:view', 'bug:view', 'system:view'] },
    { id: 'og-2', name: '组织成员', builtin: true, scope: 'project', memberCount: 2, permissions: ['project:view', 'testCase:view', 'apiTest:view', 'bug:view'] },
  ]
}
export function createIntegrations(): Integration[] {
  return [
    { id: 'it-1', name: 'Jira', type: 'Jira', enabled: true, description: '缺陷与任务同步' },
    { id: 'it-2', name: '禅道', type: '禅道', enabled: false, description: '项目与缺陷同步' },
    { id: 'it-3', name: 'TAPD', type: 'TAPD', enabled: false, description: '需求与缺陷同步' },
  ]
}
