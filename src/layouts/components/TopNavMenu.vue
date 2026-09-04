<template>
  <div class="topnav-wrap">
    <el-menu mode="horizontal" router :default-active="activeMenu" background-color="transparent"
      text-color="var(--text-1)" active-text-color="var(--accent)" :ellipsis="false" class="topnav">
      <template v-for="item in visibleMenus" :key="item.key">
        <el-menu-item :index="item.path">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </template>
    </el-menu>

    <!-- 二级导航：横向展开 -->
    <div v-if="subItems.length" class="subnav">
      <router-link v-for="child in subItems" :key="child.key" :to="child.path" class="subnav-item"
        :class="{ on: isSubActive(child.path) }">
        {{ child.label }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { menuTree } from "@/config/menu";

const route = useRoute();
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
    .map((m) => ({
      ...m,
      path: m.path || (m.children?.[0]?.path ?? ""),
    })),
);

const activeMenu = computed(() => {
  const currentPath = route.path;
  for (const item of visibleMenus.value) {
    if (item.path === currentPath) return item.path;
    if (item.children) {
      for (const child of item.children) {
        if (child.path === currentPath) return item.path;
      }
    }
  }
  // 回退：匹配路径前缀
  for (const item of visibleMenus.value) {
    if (item.path && currentPath.startsWith(item.path)) return item.path;
    if (item.children) {
      for (const child of item.children) {
        if (child.path && currentPath.startsWith(child.path)) return child.path;
      }
    }
  }
  return currentPath;
});

// 当前激活的父级菜单的子菜单项
const subItems = computed(() => {
  const currentPath = route.path;
  for (const item of visibleMenus.value) {
    if (!item.children?.length) continue;
    const isParentActive =
      item.path === currentPath ||
      item.children.some(
        (c) => c.path === currentPath || (c.path && currentPath.startsWith(c.path)),
      );
    if (isParentActive) {
      return item.children.filter(
        (c): c is typeof c & { path: string } => !!c.path && (!c.permission || userStore.hasPermission(c.permission)),
      );
    }
  }
  return [];
});

function isSubActive(path: string) {
  return route.path === path || route.path.startsWith(path + "/");
}
</script>

<style scoped>
.topnav-wrap {
  width: 100%;
}

/* 菜单项背景之间留出间隙 */
.topnav {
  gap: 4px;
}

.subnav {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 50px;
  padding: 0 4px;
  border-top: 1px solid var(--border);
}

.subnav-item {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 14px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-2);
  text-decoration: none;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.subnav-item:hover {
  color: var(--accent);
  background: rgba(var(--accent-rgb), 0.06);
}

.subnav-item.on {
  color: var(--accent);
  background: rgba(var(--accent-rgb), 0.1);
  font-weight: 600;
}
</style>