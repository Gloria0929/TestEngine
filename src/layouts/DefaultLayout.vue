<template>
  <el-container class="layout">
    <el-header class="topbar" height="auto">
      <div class="brand-row">
        <router-link class="brand" to="/workstation/home">TestEngine</router-link>
      </div>
      <div class="nav-row">
        <TopNavMenu />
        <el-tooltip :content="appStore.theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'" placement="bottom">
          <el-button text class="theme-toggle" @click="appStore.toggleTheme()">
            <el-icon>
              <Moon v-if="appStore.theme === 'light'" />
              <Sunny v-else />
            </el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </el-header>
    <el-main class="content"><router-view /></el-main>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Moon, Sunny } from "@element-plus/icons-vue";
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
  box-shadow: var(--shadow-sm);
  padding: 0 16px;
  z-index: 10;
}

.brand-row {
  display: flex;
  align-items: center;
  height: 42px;
  padding: 30px 0;
}

.brand {
  font-weight: 700;
  font-size: 18px;
  color: var(--accent);
  white-space: nowrap;
  letter-spacing: 0.5px;
  text-decoration: none;
  transition: opacity 0.18s var(--ease);
}

.brand:hover {
  opacity: 0.8;
}

.content {
  background: var(--app-bg);
  padding: 20px;
  overflow: auto;
  flex: 1;
}

/* 导航行：菜单占满，主题切换按钮靠右并与一级菜单行垂直居中 */
.nav-row {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.theme-toggle {
  margin-left: auto;
  margin-top: 6px;
  /* (44px 菜单行高 - 32px 按钮) / 2 */
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: var(--radius-sm);
  color: var(--text-2);
  font-size: 17px;
  transition: color 0.18s var(--ease), background-color 0.18s var(--ease);
}

.theme-toggle:hover {
  color: var(--accent);
  background: rgba(var(--accent-rgb), 0.06);
}
</style>