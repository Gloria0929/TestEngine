<template>
  <div class="profile">
    <el-card class="card">
      <template #header><span class="card-title">个人资料</span></template>
      <el-form label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="profileForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSaveProfile">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="card">
      <template #header><span class="card-title">修改密码</span></template>
      <el-form label-width="80px">
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
          <el-button type="primary" @click="onChangePassword">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="card">
      <template #header><span class="card-title">本地执行地址</span></template>
      <el-form label-width="80px">
        <el-form-item label="执行地址">
          <el-input v-model="execUrl" placeholder="请输入本地执行地址" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSaveExecUrl">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="card">
      <template #header><span class="card-title">表格设置</span></template>
      <el-form label-width="100px">
        <el-form-item label="默认每页条数">
          <el-select v-model="pageSize" style="width: 200px">
            <el-option :value="10" label="10 条/页" />
            <el-option :value="20" label="20 条/页" />
            <el-option :value="50" label="50 条/页" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSavePageSize">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { storage } from '@/utils/storage'
import { updateProfile, changePassword } from '@/api/auth'

const userStore = useUserStore()

const profileForm = reactive({ name: '', email: '' })
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const execUrl = ref<string>(storage.get<string>('execUrl') ?? '')
const pageSize = ref<number>(storage.get<number>('pageSize') ?? 10)

onMounted(() => {
  profileForm.name = userStore.user?.name ?? ''
  profileForm.email = userStore.user?.email ?? ''
})

async function onSaveProfile() {
  await updateProfile({ name: profileForm.name, email: profileForm.email })
  const u = userStore.user
  if (u) {
    u.name = profileForm.name
    u.email = profileForm.email
    storage.set('user', u)
  }
  ElMessage.success('资料已保存')
}

async function onChangePassword() {
  if (!pwdForm.newPassword || !pwdForm.oldPassword) {
    ElMessage.warning('请填写旧密码和新密码')
    return
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }
  await changePassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
  ElMessage.success('密码已修改')
  pwdForm.oldPassword = ''
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
}

function onSaveExecUrl() {
  storage.set('execUrl', execUrl.value)
  ElMessage.success('已保存')
}

function onSavePageSize() {
  storage.set('pageSize', pageSize.value)
  ElMessage.success('已保存')
}
</script>

<style scoped>
.profile { padding: 16px; display: flex; flex-direction: column; gap: 16px; max-width: 640px; }
.card-title { font-weight: 600; }
</style>
