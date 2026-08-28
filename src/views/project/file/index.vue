<template>
  <div class="file">
    <div class="toolbar">
      <el-select v-model="repo" style="width: 160px">
        <el-option v-for="r in REPOS" :key="r" :label="r" :value="r" />
      </el-select>
      <el-upload :auto-upload="false" :show-file-list="false" :on-change="onUpload">
        <el-button type="primary">上传文件</el-button>
      </el-upload>
    </div>
    <el-table :data="files" v-loading="loading">
      <el-table-column prop="name" label="文件名" min-width="200" />
      <el-table-column prop="type" label="类型" width="90" />
      <el-table-column prop="size" label="大小" width="110">
        <template #default="{ row }">{{ formatSize(row.size) }}</template>
      </el-table-column>
      <el-table-column prop="repo" label="仓库" width="110" />
      <el-table-column prop="time" label="时间" width="160" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { fetchFiles, createFile, deleteFile } from '@/api/project'
import type { FileItem } from '@/types/models'

const REPOS = ['GitHub', 'GitLab', 'Gitee', 'Gitea']
const files = ref<FileItem[]>([])
const loading = ref(false)
const repo = ref('GitLab')

function formatSize(size: number) {
  if (size >= 1024) return (size / 1024).toFixed(1) + ' KB'
  return size + ' B'
}
function now() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
async function onUpload(file: UploadFile) {
  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toUpperCase() : 'FILE'
  await createFile({ name: file.name, type: ext, size: file.size ?? 0, repo: repo.value, time: now() })
  ElMessage.success('上传成功')
  load()
}
async function onDelete(row: FileItem) {
  await ElMessageBox.confirm(`确定删除文件 ${row.name}？`, '提示', { type: 'warning' })
  await deleteFile(row.id)
  ElMessage.success('已删除')
  load()
}
async function load() {
  loading.value = true
  files.value = await fetchFiles()
  loading.value = false
}
onMounted(load)
</script>
<style scoped>
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
</style>
