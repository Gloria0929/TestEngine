<template>
  <div class="profile">
    <div class="profile-header">
      <el-avatar :size="72" class="avatar">{{ avatarText }}</el-avatar>
      <div class="meta">
        <div class="name">{{ userStore.user?.name || "-" }}</div>
        <div class="sub">
          <span class="username">@{{ userStore.user?.username || "-" }}</span>
          <el-tag v-if="userStore.user?.role" type="info">{{
            userStore.user?.role
          }}</el-tag>
        </div>
      </div>
    </div>

    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="个人资料" name="profile">
        <el-form label-width="100px" style="max-width: 480px">
          <el-form-item label="姓名">
            <el-input v-model="profileForm.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSaveProfile">保存资料</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="账号安全" name="security">
        <el-form label-width="100px" style="max-width: 480px">
          <el-form-item label="旧密码">
            <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入旧密码" />
          </el-form-item>
          <el-form-item label="新密码">
            <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="请输入新密码" />
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onChangePassword">修改密码</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="执行设置" name="execution">
        <el-form label-width="120px" style="max-width: 560px">
          <el-form-item label="本地执行地址">
            <el-input v-model="execUrl" placeholder="http://127.0.0.1:8082" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSaveExecUrl">保存执行地址</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";
import { storage } from "@/utils/storage";
import { updateProfile, changePassword } from "@/api/auth";

const userStore = useUserStore();

const activeTab = ref("profile");
const profileForm = reactive({ name: "", email: "" });
const pwdForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const execUrl = ref<string>(storage.get<string>("execUrl") ?? "");

const avatarText = computed(() => userStore.user?.name?.slice(0, 1) || "?");

onMounted(() => {
  profileForm.name = userStore.user?.name ?? "";
  profileForm.email = userStore.user?.email ?? "";
});

async function onSaveProfile() {
  await updateProfile({ name: profileForm.name, email: profileForm.email });
  if (userStore.user) {
    const updated = {
      ...userStore.user,
      name: profileForm.name,
      email: profileForm.email,
    };
    userStore.user = updated;
    storage.set("user", updated);
  }
  ElMessage.success("资料已保存");
}

async function onChangePassword() {
  if (!pwdForm.newPassword || !pwdForm.oldPassword) {
    ElMessage.warning("请填写旧密码和新密码");
    return;
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    ElMessage.warning("两次输入的新密码不一致");
    return;
  }
  await changePassword({
    oldPassword: pwdForm.oldPassword,
    newPassword: pwdForm.newPassword,
  });
  ElMessage.success("密码已修改");
  pwdForm.oldPassword = "";
  pwdForm.newPassword = "";
  pwdForm.confirmPassword = "";
}

function onSaveExecUrl() {
  storage.set("execUrl", execUrl.value);
  ElMessage.success("已保存");
}
</script>

<style scoped>
.profile {
  padding: 16px;
  max-width: 960px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 20px 24px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.profile-header .avatar {
  font-size: 28px;
  background: var(--el-color-primary);
  color: #fff;
}

.profile-header .name {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.profile-header .sub {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
</style>
