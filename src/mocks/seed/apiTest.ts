// src/mocks/seed/apiTest.ts
import type { DebugRequest, ApiDefinition, Scenario, ApiReport } from '@/types/models'

export function createDebugRequests(): DebugRequest[] {
  return [
    { id: 'd-1', name: '获取用户信息', method: 'GET', url: 'http://demo.testengine.io/api/user/info', protocol: 'HTTP', headers: [{ key: 'Authorization', value: 'Bearer ${token}', enabled: true }], query: [], bodyType: 'none', body: '', bodyParams: [], authType: 'none', auth: {} },
    { id: 'd-2', name: '用户登录', method: 'POST', url: 'http://demo.testengine.io/api/auth/login', protocol: 'HTTP', headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }], query: [], bodyType: 'raw', body: '{"username":"admin","password":"123456"}', bodyParams: [], authType: 'none', auth: {} },
    { id: 'd-3', name: '创建订单', method: 'POST', url: 'http://demo.testengine.io/api/order/create', protocol: 'HTTP', headers: [], query: [], bodyType: 'form-data', body: '', bodyParams: [{ key: 'productId', value: '1001', enabled: true }, { key: 'quantity', value: '2', enabled: true }], authType: 'bearer', auth: { token: '${token}' } },
  ]
}

export function createApiDefinitions(): ApiDefinition[] {
  return [
    { id: 'API-1001', name: '查询用户列表', method: 'GET', path: '/api/v1/users', protocol: 'HTTP', status: '未规划', responsible: '李娜', caseCount: 0, tags: ['用户中心', '权限'], updateTime: '2026-08-28 09:00', desc: '查询用户列表接口定义，用于接口自动化场景' },
    { id: 'API-1002', name: '创建用户', method: 'POST', path: '/api/v1/users', protocol: 'HTTPS', status: '进行中', responsible: '刘洋', caseCount: 13, tags: ['用户中心'], updateTime: '2026-08-27 10:07', desc: '创建用户接口定义，用于接口联调场景' },
    { id: 'API-1003', name: '更新用户信息', method: 'PUT', path: '/api/v1/users/{id}', protocol: 'HTTPS', status: '已完成', responsible: '周杰', caseCount: 2, tags: ['用户中心'], updateTime: '2026-08-26 11:14', desc: '更新用户信息接口定义，用于接口自动化场景' },
    { id: 'API-1004', name: '删除用户', method: 'DELETE', path: '/api/v1/users/{id}', protocol: 'HTTP', status: '已归档', responsible: '王强', caseCount: 15, tags: ['用户中心', '权限'], updateTime: '2026-08-25 12:21', desc: '删除用户接口定义，用于接口联调场景' },
    { id: 'API-1005', name: '批量导入用户', method: 'POST', path: '/api/v1/users/import', protocol: 'HTTPS', status: '未规划', responsible: '陈晨', caseCount: 4, tags: ['用户中心', '报表'], updateTime: '2026-08-24 13:28', desc: '批量导入用户接口定义，用于接口自动化场景' },
    { id: 'API-1006', name: '查询用户详情', method: 'GET', path: '/api/v1/users/{id}', protocol: 'HTTPS', status: '进行中', responsible: '张伟', caseCount: 17, tags: ['用户中心'], updateTime: '2026-08-23 14:35', desc: '查询用户详情接口定义，用于接口联调场景' },
    { id: 'API-1007', name: '重置用户密码', method: 'PUT', path: '/api/v1/users/{id}/password', protocol: 'HTTP', status: '已完成', responsible: '赵敏', caseCount: 6, tags: ['用户中心', '权限'], updateTime: '2026-08-22 15:42', desc: '重置用户密码接口定义，用于接口自动化场景' },
    { id: 'API-1008', name: '获取用户角色列表', method: 'GET', path: '/api/v1/roles', protocol: 'HTTPS', status: '已归档', responsible: '杨帆', caseCount: 19, tags: ['权限'], updateTime: '2026-08-21 16:49', desc: '获取用户角色列表接口定义，用于接口联调场景' },
    { id: 'API-1009', name: '分配用户角色', method: 'POST', path: '/api/v1/users/{id}/roles', protocol: 'HTTPS', status: '未规划', responsible: '李娜', caseCount: 8, tags: ['权限'], updateTime: '2026-08-20 17:56', desc: '分配用户角色接口定义，用于接口自动化场景' },
    { id: 'API-1010', name: '查询订单列表', method: 'GET', path: '/api/v1/orders', protocol: 'HTTP', status: '进行中', responsible: '张伟', caseCount: 21, tags: ['订单中心'], updateTime: '2026-08-19 09:12', desc: '查询订单列表接口定义，用于接口联调场景' },
    { id: 'API-1011', name: '创建订单', method: 'POST', path: '/api/v1/orders', protocol: 'HTTPS', status: '已完成', responsible: '赵敏', caseCount: 11, tags: ['订单中心'], updateTime: '2026-08-18 10:30', desc: '创建订单接口定义，用于接口自动化场景' },
    { id: 'API-1012', name: '订单退款', method: 'POST', path: '/api/v1/orders/{id}/refund', protocol: 'HTTPS', status: '已归档', responsible: '王强', caseCount: 3, tags: ['订单中心', '报表'], updateTime: '2026-08-17 14:45', desc: '订单退款接口定义，用于接口联调场景' },
  ]
}

export function createScenarios(): Scenario[] {
  return [
    { id: 'SCEN-1001', name: '用户注册登录流程', apiCount: 12, status: '未执行', responsible: '王强', creator: '李娜', createTime: '2026-08-27 10:00', updateTime: '2026-08-28 15:00', level: 'P1', tags: ['冒烟'], desc: '覆盖注册、登录、令牌刷新主链路', steps: [
      { id: 'st-1', name: '准备测试环境', expected: '环境准备就绪' },
      { id: 'st-2', name: '输入正确账号密码完成登录', expected: '登录成功并返回令牌' },
      { id: 'st-3', name: '查询当前用户信息', expected: '返回正确的用户ID' },
      { id: 'st-4', name: '执行用户完成支付订单，购买系统增值服务操作', expected: '操作执行成功' },
    ] },
    { id: 'SCEN-1002', name: '下单支付主流程', apiCount: 18, status: '通过', responsible: '陈晨', creator: '杨帆', createTime: '2026-08-26 10:01', updateTime: '2026-08-27 15:01', level: 'P0', tags: ['核心链路'], desc: '下单→支付→回调全流程验证', steps: [
      { id: 'st-1', name: '准备测试环境和测试数据', expected: '环境准备就绪' },
      { id: 'st-2', name: '创建订单并提交', expected: '订单创建成功' },
      { id: 'st-3', name: '发起支付并完成扣款', expected: '支付成功' },
      { id: 'st-4', name: '验证操作结果', expected: '结果符合预期' },
    ] },
    { id: 'SCEN-1003', name: '订单退款逆向流程', apiCount: 9, status: '失败', responsible: '张伟', creator: '赵敏', createTime: '2026-08-25 10:02', updateTime: '2026-08-26 15:02', level: 'P0', tags: ['逆向流程'], desc: '', steps: [
      { id: 'st-1', name: '对已支付订单发起退款申请', expected: '退款申请受理成功' },
      { id: 'st-2', name: '查询退款进度', expected: '退款状态为已到账' },
    ] },
    { id: 'SCEN-1004', name: '库存扣减与回补链路', apiCount: 15, status: '执行中', responsible: '赵敏', creator: '张伟', createTime: '2026-08-24 10:03', updateTime: '2026-08-25 15:03' },
    { id: 'SCEN-1005', name: '优惠券叠加下单场景', apiCount: 11, status: '通过', responsible: '杨帆', creator: '陈晨', createTime: '2026-08-23 10:04', updateTime: '2026-08-24 15:04' },
    { id: 'SCEN-1006', name: '秒杀高并发下单', apiCount: 24, status: '未执行', responsible: '李娜', creator: '王强', createTime: '2026-08-22 10:05', updateTime: '2026-08-23 15:05' },
    { id: 'SCEN-1007', name: '商品上架校验流程', apiCount: 8, status: '未执行', responsible: '刘洋', creator: '周杰', createTime: '2026-08-27 10:06', updateTime: '2026-08-28 15:06' },
    { id: 'SCEN-1008', name: '用户权限越权检测', apiCount: 10, status: '通过', responsible: '周杰', creator: '刘洋', createTime: '2026-08-26 10:07', updateTime: '2026-08-27 15:07' },
    { id: 'SCEN-1009', name: '支付回调幂等验证', apiCount: 7, status: '失败', responsible: '王强', creator: '李娜', createTime: '2026-08-25 10:08', updateTime: '2026-08-26 15:08' },
    { id: 'SCEN-1010', name: '短信验证码发送限流', apiCount: 5, status: '执行中', responsible: '陈晨', creator: '杨帆', createTime: '2026-08-24 10:09', updateTime: '2026-08-25 15:09' },
    { id: 'SCEN-1011', name: '报表数据汇总核对', apiCount: 13, status: '通过', responsible: '张伟', creator: '赵敏', createTime: '2026-08-23 10:10', updateTime: '2026-08-24 15:10' },
    { id: 'SCEN-1012', name: '消息已读同步场景', apiCount: 6, status: '未执行', responsible: '赵敏', creator: '张伟', createTime: '2026-08-22 10:11', updateTime: '2026-08-23 15:11' },
    { id: 'SCEN-1013', name: '批量导入用户校验', apiCount: 14, status: '未执行', responsible: '杨帆', creator: '陈晨', createTime: '2026-08-27 10:12', updateTime: '2026-08-28 15:12' },
    { id: 'SCEN-1014', name: '订单批量导出校验', apiCount: 9, status: '通过', responsible: '李娜', creator: '王强', createTime: '2026-08-26 10:13', updateTime: '2026-08-27 15:13' },
    { id: 'SCEN-1015', name: '角色分配与回收', apiCount: 8, status: '失败', responsible: '刘洋', creator: '周杰', createTime: '2026-08-25 10:14', updateTime: '2026-08-26 15:14' },
    { id: 'SCEN-1016', name: '登录令牌刷新场景', apiCount: 6, status: '执行中', responsible: '周杰', creator: '刘洋', createTime: '2026-08-24 10:15', updateTime: '2026-08-25 15:15' },
  ]
}

export function createApiReports(): ApiReport[] {
  return [
    { id: 'RPT-1001', name: '用户中心接口定义测试', type: '接口定义', result: '成功', passRate: 96.7, total: 6, success: 6, fail: 0, executor: '李娜', createTime: '2026-08-29 14:00' },
    { id: 'RPT-1002', name: '订单支付接口回归', type: '接口定义', result: '成功', passRate: 100, total: 11, success: 11, fail: 0, executor: '赵敏', createTime: '2026-08-28 14:01' },
    { id: 'RPT-1003', name: '下单主流程场景执行', type: '接口场景', result: '部分成功', passRate: 88.9, total: 16, success: 14, fail: 2, executor: '陈晨', createTime: '2026-08-27 14:02' },
    { id: 'RPT-1004', name: '库存链路压测报告', type: '接口场景', result: '部分成功', passRate: 62.5, total: 21, success: 13, fail: 8, executor: '周杰', createTime: '2026-08-26 14:03' },
    { id: 'RPT-1005', name: '登录鉴权接口测试', type: '接口定义', result: '成功', passRate: 100, total: 26, success: 26, fail: 0, executor: '李娜', createTime: '2026-08-25 14:04' },
    { id: 'RPT-1006', name: '退款逆向流程验证', type: '接口场景', result: '部分成功', passRate: 75.0, total: 31, success: 23, fail: 8, executor: '赵敏', createTime: '2026-08-29 14:05' },
    { id: 'RPT-1007', name: '批量接口冒烟测试', type: '批量测试', result: '成功', passRate: 91.3, total: 36, success: 33, fail: 3, executor: '陈晨', createTime: '2026-08-28 14:06' },
    { id: 'RPT-1008', name: '支付回调幂等测试', type: '接口定义', result: '部分成功', passRate: 83.3, total: 41, success: 34, fail: 7, executor: '周杰', createTime: '2026-08-27 14:07' },
    { id: 'RPT-1009', name: '报表接口联调验证', type: '接口定义', result: '成功', passRate: 100, total: 6, success: 6, fail: 0, executor: '李娜', createTime: '2026-08-26 14:08' },
    { id: 'RPT-1010', name: '秒杀场景并发测试', type: '接口场景', result: '失败', passRate: 54.2, total: 11, success: 6, fail: 5, executor: '赵敏', createTime: '2026-08-25 14:09' },
    { id: 'RPT-1011', name: '全量接口回归', type: '批量测试', result: '成功', passRate: 98.2, total: 16, success: 16, fail: 0, executor: '陈晨', createTime: '2026-08-29 14:10' },
    { id: 'RPT-1012', name: '优惠券接口专项', type: '接口定义', result: '部分成功', passRate: 71.4, total: 21, success: 15, fail: 6, executor: '周杰', createTime: '2026-08-28 14:11' },
    { id: 'RPT-1013', name: '消息中心接口验证', type: '接口定义', result: '成功', passRate: 100, total: 26, success: 26, fail: 0, executor: '李娜', createTime: '2026-08-27 14:12' },
    { id: 'RPT-1014', name: '订单导出批量校验', type: '批量测试', result: '部分成功', passRate: 85.7, total: 31, success: 27, fail: 4, executor: '赵敏', createTime: '2026-08-26 14:13' },
  ]
}
