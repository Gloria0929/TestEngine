import type { SysUser, SysParam, Plugin, Organization } from '@/types/models'
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
