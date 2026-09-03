// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { useUserStore } from "@/stores/user";

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const userStore = useUserStore();
  if (to.meta.public) return true;
  const required = to.meta.permission as string | undefined;
  if (required && !userStore.hasPermission(required)) return { path: "/403" };
  return true;
});

export default router;
