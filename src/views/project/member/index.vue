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
        <el-form-item label="系统用户">
          <el-select v-model="memberForm.userId" placeholder="选择系统用户" style="width: 100%" @change="onUserChange">
            <el-option v-for="u in SYS_USERS" :key="u.id" :label="`${u.name}（${u.email}）`" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="memberForm.name" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="memberForm.email" disabled />
        </el-form-item>
        <el-form-item label="用户组">
          <el-select v-model="memberForm.groupId" placeholder="选择用户组" style="width: 100%" @change="onGroupChange">
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
import { fetchMembers, addMember, removeMember } from '@/api/project'
import type { ProjectMember } from '@/types/models'

const PROJECT_ID = 'p-1'
const SYS_USERS = [
  { id: 'u-1', name: '系统管理员', email: 'admin@testengine.io' },
  { id: 'u-2', name: '测试工程师', email: 'test@testengine.io' },
  { id: 'u-3', name: '开发工程师', email: 'dev@testengine.io' },
]
const GROUPS = [
  { id: 'g-1', name: '项目管理员' },
  { id: 'g-2', name: '测试工程师' },
  { id: 'g-3', name: '开发工程师' },
]

const members = ref<ProjectMember[]>([])
const loading = ref(false)
const addVisible = ref(false)
const memberForm = reactive({ userId: '', name: '', email: '', groupId: '', role: '' })

const canSubmit = computed(() => Boolean(memberForm.userId && memberForm.groupId))

function groupLabel(groupId: string) {
  return GROUPS.find((g) => g.id === groupId)?.name ?? groupId
}
function onUserChange(id: string) {
  const u = SYS_USERS.find((it) => it.id === id)
  memberForm.name = u?.name ?? ''
  memberForm.email = u?.email ?? ''
}
function onGroupChange(id: string) {
  const g = GROUPS.find((it) => it.id === id)
  memberForm.role = g?.name ?? ''
}
function openAdd() {
  memberForm.userId = ''
  memberForm.name = ''
  memberForm.email = ''
  memberForm.groupId = ''
  memberForm.role = ''
  addVisible.value = true
}
async function onAdd() {
  await addMember(PROJECT_ID, { id: '', name: memberForm.name, email: memberForm.email, role: memberForm.role, groupId: memberForm.groupId })
  ElMessage.success('已添加')
  addVisible.value = false
  load()
}
async function onRemove(row: ProjectMember) {
  await ElMessageBox.confirm(`确定移除成员 ${row.name}？`, '提示', { type: 'warning' })
  await removeMember(PROJECT_ID, row.id)
  ElMessage.success('已移除')
  load()
}
async function load() {
  loading.value = true
  members.value = await fetchMembers(PROJECT_ID)
  loading.value = false
}
onMounted(load)
</script>
<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
