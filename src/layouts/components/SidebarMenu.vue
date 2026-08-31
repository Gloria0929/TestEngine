<template>
  <div class="menu-wrap">
    <el-menu
      :default-active="route.path"
      :collapse="appStore.sidebarCollapsed"
      router
      unique-opened
      background-color="transparent"
      text-color="var(--text-2)"
      active-text-color="var(--accent)"
      :collapse-transition="false"
    >
      <template v-for="item in visibleMenus" :key="item.key">
        <el-sub-menu v-if="item.children?.length" :index="item.key">
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.key"
            :index="child.path"
          >
            {{ child.label }}
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.label }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";
import { menuTree } from "@/config/menu";

const route = useRoute();
const appStore = useAppStore();
const userStore = useUserStore();

const visibleMenus = computed(() =>
  menuTree
    .filter(
      (m) =>
        (!m.permission || userStore.hasPermission(m.permission)) &&
        (!m.children ||
          m.children.some(
            (c) => !c.permission || userStore.hasPermission(c.permission),
          )),
    )
    .map((m) =>
      m.children
        ? {
            ...m,
            children: m.children.filter(
              (c) => !c.permission || userStore.hasPermission(c.permission),
            ),
          }
        : m,
    ),
);
</script>

<style scoped>
.menu-wrap {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
