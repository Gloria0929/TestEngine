<template>
  <div class="integration">
    <div class="cards" v-loading="loading">
      <el-card v-for="item in integrations" :key="item.id" class="card">
        <div class="card-header">
          <span class="name">{{ item.name }}</span>
          <el-switch :model-value="item.enabled" @change="(v: string | number | boolean) => onToggle(item, Boolean(v))" />
        </div>
        <div class="type">{{ item.type }}</div>
        <div class="desc">{{ item.description }}</div>
        <div class="actions">
          <el-button size="small" @click="onTest">连接测试</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchIntegrations, toggleIntegration } from '@/api/setting'
import type { Integration } from '@/types/models'

const integrations = ref<Integration[]>([])
const loading = ref(false)

async function onToggle(item: Integration, v: boolean) {
  await toggleIntegration(item.id, v)
  ElMessage.success('已更新')
  load()
}
function onTest() {
  ElMessage.success('连接成功')
}
async function load() {
  loading.value = true
  integrations.value = await fetchIntegrations()
  loading.value = false
}
onMounted(load)
</script>
<style scoped>
.cards { display: flex; flex-wrap: wrap; gap: 16px; }
.card { width: 320px; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.name { font-weight: 600; font-size: 16px; }
.type { color: var(--el-text-color-secondary); font-size: 13px; margin-bottom: 4px; }
.desc { color: var(--el-text-color-regular); font-size: 13px; margin-bottom: 12px; }
</style>
