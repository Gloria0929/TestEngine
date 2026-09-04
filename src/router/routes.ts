// src/router/routes.ts
import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layouts/DefaultLayout.vue"),
    redirect: "/workstation/home",
    children: [
      {
        path: "workstation/home",
        name: "WorkstationHome",
        component: () => import("@/views/workstation/home/index.vue"),
        meta: { title: "menu.workstation" },
      },
      {
        path: "project/log",
        name: "ProjectLog",
        component: () => import("@/views/project/log/index.vue"),
        meta: { permission: "project:view" },
      },
      {
        path: "test-case/list",
        name: "CaseList",
        component: () => import("@/views/testCase/list/index.vue"),
        meta: { permission: "testCase:view" },
      },
      {
        path: "test-case/review",
        name: "CaseReview",
        component: () => import("@/views/testCase/review/index.vue"),
        meta: { permission: "testCase:view" },
      },
      {
        path: "test-case/detail/:id",
        name: "CaseDetail",
        component: () => import("@/views/testCase/detail/index.vue"),
        meta: { permission: "testCase:view" },
      },
      {
        path: "test-case/recycle",
        name: "CaseRecycle",
        component: () => import("@/views/testCase/recycle/index.vue"),
        meta: { permission: "testCase:view" },
      },
      {
        path: "test-plan/list",
        name: "PlanList",
        component: () => import("@/views/testPlan/list/index.vue"),
        meta: { permission: "testPlan:view" },
      },
      {
        path: "test-plan/reports",
        name: "PlanReports",
        component: () => import("@/views/testPlan/list/index.vue"),
        meta: { permission: "testPlan:view" },
      },
      {
        path: "test-plan/execute/:id",
        name: "PlanExecute",
        component: () => import("@/views/testPlan/execute/index.vue"),
        meta: { permission: "testPlan:view" },
      },
      {
        path: "test-plan/case-execute/:planId/:caseId",
        name: "PlanCaseExecute",
        component: () => import("@/views/testPlan/caseExecute/index.vue"),
        meta: { permission: "testPlan:view" },
      },
      {
        path: "test-plan/report/:id",
        name: "TestPlanReport",
        component: () => import("@/views/testPlan/report/index.vue"),
        meta: { permission: "testPlan:view" },
      },
      {
        path: "api-test/debug",
        name: "ApiDebug",
        component: () => import("@/views/apiTest/debug/index.vue"),
        meta: { permission: "apiTest:view" },
      },
      {
        path: "api-test/definition",
        name: "ApiDefinition",
        component: () => import("@/views/apiTest/definition/index.vue"),
        meta: { permission: "apiTest:view" },
      },
      {
        path: "api-test/scenario",
        name: "ApiScenario",
        component: () => import("@/views/apiTest/scenario/index.vue"),
        meta: { permission: "apiTest:view" },
      },
      {
        path: "api-test/scenario/edit/:id",
        name: "ApiScenarioEdit",
        component: () => import("@/views/apiTest/scenario/edit.vue"),
        meta: { permission: "apiTest:view" },
      },
      {
        path: "api-test/report",
        name: "ApiReport",
        component: () => import("@/views/apiTest/report/index.vue"),
        meta: { permission: "apiTest:view" },
      },
      {
        path: "bug/list",
        name: "BugList",
        component: () => import("@/views/bug/list/index.vue"),
        meta: { permission: "bug:view" },
      },
    ],
  },
  {
    path: "/403",
    name: "Forbidden",
    component: () => import("@/views/error/403.vue"),
    meta: { public: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/error/404.vue"),
    meta: { public: true },
  },
];
