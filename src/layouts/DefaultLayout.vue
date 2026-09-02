<template>
  <el-container class="layout">
    <el-header class="topbar" height="auto">
      <div class="brand-row">
        <div class="brand">TestEngine</div>
      </div>
      <TopNavMenu />
    </el-header>
    <el-main class="content"><router-view /></el-main>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAppStore } from "@/stores/app";
import TopNavMenu from "./components/TopNavMenu.vue";

const appStore = useAppStore();
onMounted(() => appStore.applyTheme());
</script>

<style scoped>
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.topbar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  height: auto;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 16px;
}
.brand-row {
  display: flex;
  align-items: center;
  height: 42px;
}
.brand {
  font-weight: 700;
  font-size: 18px;
  color: var(--accent);
  white-space: nowrap;
  letter-spacing: 0.5px;
}
.content {
  background: var(--app-bg);
  padding: 20px;
  overflow: auto;
  flex: 1;
}
/* 水平菜单样式 */
:deep(.topnav.el-menu--horizontal) {
  border-bottom: none;
  background: transparent;
  height: 44px;
  min-width: 0;
  width: 100%;
  flex: 0 0 auto;
}
:deep(.topnav .el-menu-item) {
  height: 44px;
  line-height: 44px;
  border-bottom: none;
  font-size: 14px;
  color: var(--text-1);
}
:deep(.topnav .el-menu-item:hover) {
  color: var(--accent);
  background: transparent;
}
:deep(.topnav .el-menu-item.is-active) {
  color: var(--accent);
  border-bottom: 2px solid var(--accent);
  font-weight: 600;
  background: transparent;
}
:deep(.topnav .el-menu-item .el-icon) {
  margin-right: 4px;
  vertical-align: middle;
}
</style>