<template>
  <el-menu :default-active="route.path" :collapse="appStore.sidebarCollapsed"
    router unique-opened background-color="transparent" text-color="#94a3b8" active-text-color="#fff">
    <template v-for="item in visibleMenus" :key="item.key">
      <el-sub-menu v-if="item.children?.length" :index="item.key">
        <template #title>
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ t(item.i18nKey) }}</span>
        </template>
        <el-menu-item v-for="child in item.children" :key="child.key" :index="child.path">
          {{ t(child.i18nKey) }}
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else :index="item.path">
        <el-icon><component :is="item.icon" /></el-icon>
        <template #title>{{ t(item.i18nKey) }}</template>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { menuTree } from '@/config/menu'

const { t } = useI18n()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const visibleMenus = computed(() =>
  menuTree
    .filter((m) => (!m.permission || userStore.hasPermission(m.permission)) && (!m.children || m.children.some((c) => !c.permission || userStore.hasPermission(c.permission))))
    .map((m) => (m.children ? { ...m, children: m.children.filter((c) => !c.permission || userStore.hasPermission(c.permission)) } : m)),
)
</script>
