<template>
  <div class="script">
    <div class="toolbar">
      <el-button type="primary" @click="openEdit()">新增脚本</el-button>
    </div>
    <el-table :data="scripts" v-loading="loading">
      <el-table-column prop="name" label="脚本名称" min-width="200" />
      <el-table-column prop="updateTime" label="更新时间" width="160" />
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="drawerVisible" :title="editingId ? '编辑脚本' : '新增脚本'" size="560px">
      <el-form label-width="90px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="脚本名称" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="12" placeholder="输入脚本内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchScripts, createScript, updateScript, deleteScript } from '@/api/project'
import type { Script } from '@/types/models'

const scripts = ref<Script[]>([])
const loading = ref(false)
const drawerVisible = ref(false)
const editingId = ref('')
const form = reactive({ name: '', content: '' })

function now() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function openEdit(row?: Script) {
  editingId.value = row?.id ?? ''
  form.name = row?.name ?? ''
  form.content = row?.content ?? ''
  drawerVisible.value = true
}
async function onSave() {
  const data = { name: form.name, content: form.content, updateTime: now() }
  if (editingId.value) await updateScript(editingId.value, data)
  else await createScript(data)
  ElMessage.success('已保存')
  drawerVisible.value = false
  load()
}
async function onDelete(row: Script) {
  await ElMessageBox.confirm(`确定删除脚本 ${row.name}？`, '提示', { type: 'warning' })
  await deleteScript(row.id)
  ElMessage.success('已删除')
  load()
}
async function load() {
  loading.value = true
  scripts.value = await fetchScripts()
  loading.value = false
}
onMounted(load)
</script>
<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
