// src/stores/app.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { storage } from "@/utils/storage";

export const useAppStore = defineStore("app", () => {
  const theme = ref<"light" | "dark">(storage.get("theme") ?? "light");
  const sidebarCollapsed = ref<boolean>(
    storage.get("sidebarCollapsed") ?? false,
  );

  let themeTimer: ReturnType<typeof setTimeout> | undefined;

  function applyTheme() {
    document.documentElement.classList.toggle("dark", theme.value === "dark");
  }
  function toggleTheme() {
    theme.value = theme.value === "light" ? "dark" : "light";
    storage.set("theme", theme.value);
    // 切换瞬间启用全元素颜色过渡，实现平滑变色
    const root = document.documentElement;
    root.classList.add("theme-switching");
    clearTimeout(themeTimer);
    themeTimer = setTimeout(() => root.classList.remove("theme-switching"), 350);
    applyTheme();
  }
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    storage.set("sidebarCollapsed", sidebarCollapsed.value);
  }

  return { theme, sidebarCollapsed, applyTheme, toggleTheme, toggleSidebar };
});
