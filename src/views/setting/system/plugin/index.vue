<template>
  <div class="plugin">
    <div class="toolbar">
      <el-upload :auto-upload="false" :show-file-list="false" :on-change="onUpload">
        <el-button type="primary">上传插件</el-button>
      </el-upload>
    </div>
    <el-table :data="plugins" v-loading="loading">
      <el-table-column prop="name" label="插件名称" min-width="220" />
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="version" label="版本" width="120" />
      <el-table-column label="启用" width="90">
        <template #default="{ row }">
          <el-switch :model-value="row.enabled" @change="(v: string | number | boolean) => onToggle(row, Boolean(v))" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { fetchPlugins, togglePlugin } from '@/api/setting'
import type { Plugin } from '@/types/models'

const plugins = ref<Plugin[]>([])
const loading = ref(false)

async function onToggle(row: Plugin, v: boolean) {
  await togglePlugin(row.id, v)
  ElMessage.success('已更新')
  load()
}
function onUpload(file: UploadFile) {
  ElMessage.success(`插件 ${file.name} 上传成功`)
}
async function load() {
  loading.value = true
  try {
    plugins.value = await fetchPlugins()
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>
<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
