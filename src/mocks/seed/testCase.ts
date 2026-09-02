// src/mocks/seed/testCase.ts
import type { TestCase, ModuleNode, Review } from '@/types/models'

export function createModules(): ModuleNode[] {
  return [
    {
      id: 'm-1', name: '登录模块', children: [
        { id: 'm-1-1', name: '账号密码登录', children: [] },
        { id: 'm-1-2', name: '第三方登录', children: [] },
      ],
    },
    { id: 'm-2', name: '订单模块', children: [
      { id: 'm-2-1', name: '创建订单', children: [] },
      { id: 'm-2-2', name: '订单查询', children: [] },
    ] },
    { id: 'm-3', name: '支付模块', children: [] },
  ]
}

export function createCases(): TestCase[] {
  return [
    { id: 'c-1', projectId: 'p-1', moduleId: 'm-1-1', name: '正确账号密码登录成功', testPoint: '登录功能', precondition: '已注册账号', steps: [{ id: 's-1', description: '输入正确账号密码', expected: '登录成功进入工作台' }], level: 'P0', status: 'READY', executor: 'test', tags: ['冒烟', '登录'], createUser: 'test', updateTime: '2026-08-26 14:00', follow: true },
    { id: 'c-2', projectId: 'p-1', moduleId: 'm-1-1', name: '错误密码登录失败', testPoint: '登录功能', precondition: '已注册账号', steps: [{ id: 's-1', description: '输入错误密码', expected: '提示密码错误' }], level: 'P1', status: 'DRAFT', executor: 'test', tags: ['登录'], createUser: 'test', updateTime: '2026-08-26 10:00', follow: false },
    { id: 'c-3', projectId: 'p-1', moduleId: 'm-2-1', name: '创建普通订单', testPoint: '订单功能', precondition: '登录态', steps: [{ id: 's-1', description: '提交订单表单', expected: '订单创建成功' }], level: 'P0', status: 'READY', executor: 'dev', tags: ['订单'], createUser: 'dev', updateTime: '2026-08-25 16:00', follow: false },
    { id: 'c-4', projectId: 'p-1', moduleId: 'm-2-1', name: '创建订单-库存不足', testPoint: '订单功能', precondition: '库存为 0', steps: [{ id: 's-1', description: '提交订单', expected: '提示库存不足' }], level: 'P1', status: 'REVIEW', executor: 'test', tags: ['订单', '边界'], createUser: 'test', updateTime: '2026-08-24 09:00', follow: false },
    { id: 'c-5', projectId: 'p-1', moduleId: 'm-3', name: '支付宝支付成功', testPoint: '支付功能', precondition: '有订单', steps: [{ id: 's-1', description: '发起支付', expected: '支付成功' }], level: 'P0', status: 'READY', executor: 'test', tags: ['支付'], createUser: 'Administrator', updateTime: '2026-08-23 11:00', follow: true },
    { id: 'c-6', projectId: 'p-1', moduleId: 'm-3', name: '微信支付取消', testPoint: '支付功能', precondition: '有订单', steps: [{ id: 's-1', description: '取消支付', expected: '返回未支付' }], level: 'P2', status: 'DRAFT', executor: 'dev', tags: ['支付'], createUser: 'dev', updateTime: '2026-08-22 15:00', follow: false },
  ]
}

export function createReviews(): Review[] {
  return [
    { id: 'rv-1', name: '登录模块用例评审', reviewers: ['test', 'dev'], status: 'PENDING', caseCount: 2, caseIds: ['c-1', 'c-2'], startTime: '2026-08-27 10:00', endTime: '2026-08-28 10:00' },
    { id: 'rv-2', name: '支付模块用例评审', reviewers: ['Administrator'], status: 'PASSED', caseCount: 2, caseIds: ['c-5', 'c-6'], startTime: '2026-08-20 09:00', endTime: '2026-08-21 09:00' },
  ]
}
