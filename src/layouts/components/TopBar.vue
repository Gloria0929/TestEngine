<template>
  <div class="topbar">
    <div class="left">
      <el-popover
        v-model:visible="popoverVisible"
        trigger="click"
        placement="bottom-start"
        :width="200"
        :offset="4"
        :show-arrow="false"
      >
        <template #reference>
          <el-input
            :model-value="currentProjectName"
            readonly
            size="small"
            style="width: 200px"
            class="project-input"
          >
            <template #suffix>
              <el-icon :class="{ 'is-reverse': popoverVisible }"
                ><ArrowDown
              /></el-icon>
            </template>
          </el-input>
        </template>
        <div class="project-popover">
          <div class="popover-item add-item" @click="onAddClick">
            <el-icon><Plus /></el-icon>
            <span>添加项目</span>
          </div>
          <div
            v-for="p in projects"
            :key="p.id"
            class="popover-item"
            :class="{ active: p.id === currentProjectId }"
            @click="onSelectProject(p.id)"
          >
            {{ p.name }}
          </div>
        </div>
      </el-popover>
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

    <!-- 添加项目弹窗 -->
    <el-dialog v-model="addVisible" title="添加项目" width="420px">
      <el-form :model="addForm" label-width="72px">
        <el-form-item label="项目名称">
          <el-input v-model="addForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="addForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="adding" @click="onAddProject"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Plus, ArrowDown } from "@element-plus/icons-vue";
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";
import { useNotificationStore } from "@/stores/notification";
import { fetchProjects, createProject } from "@/api/project";

const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();
const notification = useNotificationStore();

const showNotif = ref(false);
const popoverVisible = ref(false);
const projects = ref<Array<{ id: string; name: string }>>([]);
const currentProjectId = ref("p-1");
const currentProjectName = computed(
  () => projects.value.find((p) => p.id === currentProjectId.value)?.name ?? "",
);

const addVisible = ref(false);
const adding = ref(false);
const addForm = reactive({ name: "", description: "" });

function onSelectProject(id: string) {
  currentProjectId.value = id;
  popoverVisible.value = false;
}

function onAddClick() {
  popoverVisible.value = false;
  addForm.name = "";
  addForm.description = "";
  addVisible.value = true;
}

async function onAddProject() {
  if (!addForm.name.trim()) return;
  adding.value = true;
  try {
    const p = await createProject({
      name: addForm.name.trim(),
      description: addForm.description.trim(),
      orgId: "100001",
    });
    projects.value.unshift({ id: p.id, name: p.name });
    currentProjectId.value = p.id;
    addVisible.value = false;
    ElMessage.success("项目创建成功");
  } finally {
    adding.value = false;
  }
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
.project-input :deep(.el-input__inner) {
  cursor: pointer;
}
.project-input :deep(.el-input__suffix) {
  cursor: pointer;
}
.is-reverse {
  transform: rotate(180deg);
  transition: transform 0.2s;
}
.project-popover {
  max-height: 260px;
  overflow-y: auto;
}
.popover-item {
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s;
}
.popover-item:hover {
  background: var(--el-fill-color-light);
}
.popover-item.active {
  color: var(--el-color-primary);
  font-weight: 500;
}
.add-item {
  color: var(--el-color-primary);
  font-weight: 500;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 4px;
  padding-bottom: 10px;
}
</style>
