<template>
  <el-container class="layout">
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="sidebar">
      <div class="logo">TestEngine</div>
      <SidebarMenu />
    </el-aside>
    <el-container>
      <el-header class="header"><TopBar /></el-header>
      <el-main class="main"><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import SidebarMenu from './components/SidebarMenu.vue'
import TopBar from './components/TopBar.vue'

const appStore = useAppStore()
onMounted(() => appStore.applyTheme())
</script>

<style scoped lang="scss">
.layout { height: 100vh; }
.sidebar { background: var(--sb-bg); color: #fff; transition: width 0.2s; overflow: hidden; }
.logo { height: 56px; line-height: 56px; text-align: center; font-weight: 700; font-size: 18px; }
.header { height: 56px; background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 16px; }
.main { background: var(--app-bg); padding: 16px; overflow: auto; }
</style>
