// src/stores/app.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { storage } from "@/utils/storage";

export const useAppStore = defineStore("app", () => {
  const theme = ref<"light" | "dark">(storage.get("theme") ?? "light");
  const sidebarCollapsed = ref<boolean>(
    storage.get("sidebarCollapsed") ?? false,
  );

  function applyTheme() {
    document.documentElement.classList.toggle("dark", theme.value === "dark");
  }
  function toggleTheme() {
    theme.value = theme.value === "light" ? "dark" : "light";
    storage.set("theme", theme.value);
    applyTheme();
  }
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    storage.set("sidebarCollapsed", sidebarCollapsed.value);
  }

  return { theme, sidebarCollapsed, applyTheme, toggleTheme, toggleSidebar };
});
