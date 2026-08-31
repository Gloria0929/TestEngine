<template>
  <div class="member">
    <div class="toolbar">
      <el-button type="primary" @click="openAdd">添加成员</el-button>
    </div>
    <el-table :data="members" v-loading="loading">
      <el-table-column prop="name" label="姓名" width="160" />
      <el-table-column prop="email" label="邮箱" min-width="220" />
      <el-table-column prop="role" label="角色" width="140" />
      <el-table-column label="用户组" width="140">
        <template #default="{ row }">{{ groupLabel(row.groupId) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button link type="danger" @click="onRemove(row)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="addVisible" title="添加成员" width="480px">
      <el-form label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="form.name" placeholder="成员姓名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="邮箱地址" />
        </el-form-item>
        <el-form-item label="用户组">
          <el-select v-model="form.groupId" placeholder="选择用户组" style="width: 100%" @change="onGroupChange">
            <el-option v-for="g in GROUPS" :key="g.id" :label="g.name" :value="g.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!canSubmit" @click="onAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchOrgMembers, createOrgMember, removeOrgMember } from '@/api/setting'
import type { ProjectMember } from '@/types/models'

const GROUPS = [
  { id: 'og-1', name: '组织管理员' },
  { id: 'og-2', name: '组织成员' },
]

const members = ref<ProjectMember[]>([])
const loading = ref(false)
const addVisible = ref(false)
const form = reactive({ name: '', email: '', role: '组织成员', groupId: '' })

const canSubmit = computed(() => Boolean(form.name && form.email && form.groupId))

function groupLabel(groupId: string) {
  return GROUPS.find((g) => g.id === groupId)?.name ?? groupId
}
function onGroupChange(id: string) {
  const g = GROUPS.find((it) => it.id === id)
  form.role = g?.name ?? '组织成员'
}
function openAdd() {
  form.name = ''
  form.email = ''
  form.role = '组织成员'
  form.groupId = ''
  addVisible.value = true
}
async function onAdd() {
  await createOrgMember({ name: form.name, email: form.email, role: form.role, groupId: form.groupId })
  ElMessage.success('已添加')
  addVisible.value = false
  load()
}
async function onRemove(row: ProjectMember) {
  await ElMessageBox.confirm(`确定移除成员 ${row.name}？`, '提示', { type: 'warning' })
  await removeOrgMember(row.id)
  ElMessage.success('已移除')
  load()
}
async function load() {
  loading.value = true
  try {
    members.value = await fetchOrgMembers()
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>
<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
