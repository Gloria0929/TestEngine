<template>
  <el-container class="layout">
    <el-aside
      :width="appStore.sidebarCollapsed ? '64px' : '220px'"
      class="sidebar"
    >
      <div class="logo">
        <span v-if="!appStore.sidebarCollapsed">TestEngine</span>
        <span v-else class="logo-mini">TE</span>
      </div>
      <SidebarMenu />
      <div class="sidebar-collapse" @click="appStore.toggleSidebar()">
        <el-icon><Fold v-if="!appStore.sidebarCollapsed" /><Expand v-else /></el-icon>
      </div>
    </el-aside>
    <el-container>
      <el-header class="header"><TopBar /></el-header>
      <el-main class="main"><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Fold, Expand } from "@element-plus/icons-vue";
import { useAppStore } from "@/stores/app";
import SidebarMenu from "./components/SidebarMenu.vue";
import TopBar from "./components/TopBar.vue";

const appStore = useAppStore();
onMounted(() => appStore.applyTheme());
</script>

<style scoped lang="scss">
.layout {
  height: 100vh;
}
.sidebar {
  background: var(--sb-bg);
  color: var(--text-1);
  transition: width 0.2s;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}
.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  color: var(--accent);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  overflow: hidden;
}
.logo-mini {
  font-size: 16px;
}
.sidebar-collapse {
  height: 48px;
  flex-shrink: 0;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-2);
  transition: background 0.2s;
}
.sidebar-collapse:hover {
  background: rgba(var(--accent-rgb), 0.08);
  color: var(--accent);
}
.header {
  height: 56px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 40px;
}
.main {
  background: var(--app-bg);
  padding: 20px;
  overflow: auto;
}
</style>
