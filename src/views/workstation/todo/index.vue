<template>
  <el-card shadow="never">
    <template #header>
      <div class="head">
        <span>{{ t('menu.workstation') }} · {{ t('common.todo') }}</span>
        <el-select v-model="type" clearable placeholder="全部类型" style="width: 160px">
          <el-option label="计划" value="计划" /><el-option label="评审" value="评审" /><el-option label="缺陷" value="缺陷" />
        </el-select>
      </div>
    </template>
    <el-table :data="filtered" v-loading="loading">
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="title" label="待办事项" />
      <el-table-column prop="dueTime" label="截止时间" width="180" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }"><el-button link type="primary" @click="router.push(row.targetUrl)">处理</el-button></template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchTodos } from '@/api/workstation'
import type { TodoItem } from '@/mocks/seed/workstation'

const { t } = useI18n()
const router = useRouter()
const type = ref('')
const list = ref<TodoItem[]>([])
const loading = ref(false)
const filtered = computed(() => (type.value ? list.value.filter((x) => x.type === type.value) : list.value))

onMounted(async () => { loading.value = true; list.value = await fetchTodos(); loading.value = false })
</script>
