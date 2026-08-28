<template>
  <div class="user-group">
    <el-table :data="groups" v-loading="loading">
      <el-table-column prop="name" label="名称" width="180" />
      <el-table-column label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="row.builtin ? 'info' : 'success'" size="small">{{ row.builtin ? '内置' : '自定义' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="权限数" width="120">
        <template #default="{ row }">{{ row.permissions.length }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button link type="primary" @click="openPermission(row)">配置权限</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="drawerVisible" :title="current ? `配置权限：${current.name}` : '配置权限'" size="360px">
      <PermissionTree v-if="current" :data="tree" :model-value="current.permissions" @update:model-value="onPermissionChange" />
      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import PermissionTree from '@/components/PermissionTree.vue'
import { fetchOrgGroups, updateOrgGroupPermissions } from '@/api/setting'
import { fetchPermissionTree } from '@/api/project'
import type { UserGroup, PermissionNode } from '@/types/models'

const groups = ref<UserGroup[]>([])
const tree = ref<PermissionNode[]>([])
const loading = ref(false)
const drawerVisible = ref(false)
const current = ref<UserGroup | null>(null)

function openPermission(row: UserGroup) {
  current.value = row
  drawerVisible.value = true
}
function onPermissionChange(v: string[]) {
  if (current.value) current.value.permissions = v
}
async function onSave() {
  if (!current.value) return
  await updateOrgGroupPermissions(current.value.id, current.value.permissions)
  ElMessage.success('已保存')
  drawerVisible.value = false
}
async function load() {
  loading.value = true
  groups.value = await fetchOrgGroups()
  tree.value = await fetchPermissionTree()
  loading.value = false
}
onMounted(load)
</script>
