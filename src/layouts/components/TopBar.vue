<template>
  <div class="topbar">
    <div class="left">
      <el-select
        :model-value="currentProjectId"
        size="small"
        style="width: 200px"
        @update:model-value="onProjectChange"
      >
        <el-option
          v-for="p in projects"
          :key="p.id"
          :label="p.name"
          :value="p.id"
        />
      </el-select>
    </div>
    <div class="right">
      <el-badge
        :value="notification.unreadCount"
        :hidden="notification.unreadCount === 0"
      >
        <el-icon class="action" @click="showNotif = true"><Bell /></el-icon>
      </el-badge>
      <el-icon class="action" @click="appStore.toggleTheme()">
        <Moon v-if="appStore.theme === 'light'" /><Sunny v-else />
      </el-icon>
      <el-dropdown @command="onUser">
        <span class="user"
          ><el-avatar :size="26">{{
            userStore.user?.name?.slice(0, 1)
          }}</el-avatar></span
        >
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="personal">{{
              "个人中心"
            }}</el-dropdown-item>
            <el-dropdown-item command="logout" divided>{{
              "退出登录"
            }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-drawer v-model="showNotif" :title="'通知'" size="360px">
      <div v-if="notification.list.length === 0" class="empty">
        {{ "暂无数据" }}
      </div>
      <div
        v-for="n in notification.list"
        :key="n.id"
        class="notif-item"
        :class="{ unread: !n.read }"
        @click="notification.markOne(n.id)"
      >
        <div class="title">{{ n.title }}</div>
        <div class="content">{{ n.content }}</div>
      </div>
      <el-button
        v-if="notification.unreadCount > 0"
        size="small"
        @click="notification.markAll()"
        >{{ "全部已读" }}</el-button
      >
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";
import { useNotificationStore } from "@/stores/notification";
import { fetchProjects } from "@/api/project";

const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();
const notification = useNotificationStore();

const showNotif = ref(false);
const projects = ref<Array<{ id: string; name: string }>>([]);
const currentProjectId = ref("p-1");

async function onProjectChange(id: string) {
  currentProjectId.value = id;
}
function onUser(cmd: string) {
  if (cmd === "logout") userStore.logout().then(() => router.replace("/login"));
  else router.push("/personal/profile");
}

onMounted(async () => {
  projects.value = await fetchProjects({ orgId: "100001" });
  await notification.load();
});
</script>

<style scoped lang="scss">
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  gap: 16px;
}
.left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.action {
  font-size: 18px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--text-2);
  transition: var(--transition);
}
.action:hover {
  color: var(--accent);
  background: rgba(var(--accent-rgb), 0.06);
}
.lang {
  font-size: 12px;
  font-weight: 600;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  background: var(--app-bg);
  color: var(--text-2);
}
.user {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
}
.user:hover {
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.15);
}
</style>
