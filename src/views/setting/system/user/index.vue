<template>
  <div class="user">
    <div class="toolbar">
      <el-button type="primary" @click="openAdd">新建用户</el-button>
    </div>
    <el-table :data="users" v-loading="loading">
      <el-table-column prop="username" label="用户名" min-width="160" />
      <el-table-column prop="name" label="姓名" min-width="140" />
      <el-table-column prop="email" label="邮箱" min-width="220" />
      <el-table-column prop="role" label="角色" min-width="140" />
      <el-table-column label="启用" min-width="90">
        <template #default="{ row }">
          <el-switch :model-value="row.enabled" @change="(v: string | number | boolean) => onToggle(row, Boolean(v))" />
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="120">
        <template #default="{ row }">
          <el-button link type="primary" @click="onReset(row)">重置凭证</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="addVisible" title="新建用户" width="480px">
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="登录用户名" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name" placeholder="显示名称" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="邮箱地址" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" placeholder="选择角色" style="width: 100%">
            <el-option label="系统管理员" value="系统管理员" />
            <el-option label="系统成员" value="系统成员" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="onAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchSysUsers, createSysUser, toggleSysUser, resetCredential } from '@/api/setting'
import type { SysUser } from '@/types/models'

const users = ref<SysUser[]>([])
const loading = ref(false)
const addVisible = ref(false)
const form = reactive({ username: '', name: '', email: '', role: '系统成员' })

function openAdd() {
  form.username = ''
  form.name = ''
  form.email = ''
  form.role = '系统成员'
  addVisible.value = true
}
async function onAdd() {
  await createSysUser({ username: form.username, name: form.name, email: form.email, role: form.role, enabled: true })
  ElMessage.success('已创建')
  addVisible.value = false
  load()
}
async function onToggle(row: SysUser, v: boolean) {
  await toggleSysUser(row.id, v)
  ElMessage.success('已更新')
  load()
}
async function onReset(row: SysUser) {
  await resetCredential(row.id)
  ElMessage.success(`已重置 ${row.name} 的凭证`)
}
async function load() {
  loading.value = true
  try {
    users.value = await fetchSysUsers()
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>
<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
