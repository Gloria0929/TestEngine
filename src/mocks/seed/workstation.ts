// src/mocks/seed/workstation.ts
import type { TrendPoint } from "@/types/models";

export const overviewStats = {
  caseCount: 1284,
  reviewCount: 36,
  apiCount: 208,
  scenarioCount: 42,
};

export function createTrend(): TrendPoint[] {
  const dates = ["08-21", "08-22", "08-23", "08-24", "08-25", "08-26", "08-27"];
  return dates.map((date, i) => ({
    date,
    cases: 1180 + i * 18,
    apis: 170 + i * 6,
  }));
}
