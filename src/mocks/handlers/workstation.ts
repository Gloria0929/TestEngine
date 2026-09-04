// src/mocks/handlers/workstation.ts
import { http, HttpResponse } from "msw";
import { ok } from "../utils";
import { overviewStats, createTrend } from "../seed/workstation";

export const workstationHandlers = [
  http.get("/api/workstation/overview", () =>
    HttpResponse.json(ok(overviewStats)),
  ),
  http.get("/api/workstation/trend", () =>
    HttpResponse.json(ok(createTrend())),
  ),
];
