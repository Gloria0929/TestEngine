// src/mocks/handlers/index.ts
import { workstationHandlers } from "./workstation";
import { projectHandlers } from "./project";
import { testCaseHandlers } from "./testCase";
import { apiTestHandlers } from "./apiTest";
import { testPlanHandlers } from "./testPlan";
import { bugHandlers } from "./bug";
export const handlers = [
  ...workstationHandlers,
  ...projectHandlers,
  ...testCaseHandlers,
  ...apiTestHandlers,
  ...testPlanHandlers,
  ...bugHandlers,
];
