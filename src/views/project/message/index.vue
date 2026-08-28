<template>
  <div class="message">
    <el-table :data="configs" v-loading="loading">
      <el-table-column prop="type" label="消息类型" width="140" />
      <el-table-column label="启用" width="100">
        <template #default="{ row }">
          <el-switch :model-value="row.enabled" @change="(v: string | number | boolean) => onToggle(row, Boolean(v))" />
        </template>
      </el-table-column>
      <el-table-column label="接收人" min-width="260">
        <template #default="{ row }">
          <el-tag v-for="r in row.receivers" :key="r" size="small" class="tag">{{ r }}</el-tag>
          <span v-if="!row.receivers.length" class="empty">未配置</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">配置接收人</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="`配置接收人：${current?.type ?? ''}`" width="480px">
      <el-input v-model="receiverText" type="textarea" :rows="3" placeholder="多个接收人以逗号分隔" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchMessageConfigs, updateMessageConfig } from '@/api/project'
import type { MessageConfig } from '@/types/models'

const configs = ref<MessageConfig[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const current = ref<MessageConfig | null>(null)
const receiverText = ref('')

async function onToggle(row: MessageConfig, v: boolean) {
  await updateMessageConfig(row.id, { enabled: v })
  ElMessage.success('已更新')
  load()
}
function openEdit(row: MessageConfig) {
  current.value = row
  receiverText.value = row.receivers.join(', ')
  dialogVisible.value = true
}
async function onSave() {
  if (!current.value) return
  const receivers = receiverText.value.split(',').map((s) => s.trim()).filter(Boolean)
  await updateMessageConfig(current.value.id, { receivers })
  ElMessage.success('已保存')
  dialogVisible.value = false
  load()
}
async function load() {
  loading.value = true
  configs.value = await fetchMessageConfigs()
  loading.value = false
}
onMounted(load)
</script>
<style scoped>
.tag { margin-right: 4px; }
.empty { color: #909399; }
</style>
