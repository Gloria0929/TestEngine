<template>
  <el-card shadow="never">
    <template #header>
      <div class="head">
        <span>工作台 · 待办</span>
        <el-select v-model="type" clearable placeholder="全部类型" style="width: 160px">
          <el-option label="计划" value="计划" /><el-option label="评审" value="评审" /><el-option label="缺陷" value="缺陷" />
        </el-select>
      </div>
    </template>
    <el-table :data="filtered" v-loading="loading">
      <el-table-column prop="type" label="类型" min-width="100" />
      <el-table-column prop="title" label="待办事项" />
      <el-table-column prop="dueTime" label="截止时间" min-width="180" />
      <el-table-column label="操作" min-width="100">
        <template #default="{ row }"><el-button link type="primary" @click="router.push(row.targetUrl)">处理</el-button></template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchTodos } from '@/api/workstation'
import type { TodoItem } from '@/types/models'

const router = useRouter()
const type = ref('')
const list = ref<TodoItem[]>([])
const loading = ref(false)
const filtered = computed(() => (type.value ? list.value.filter((x) => x.type === type.value) : list.value))

onMounted(async () => {
  loading.value = true
  try {
    list.value = await fetchTodos()
  } finally {
    loading.value = false
  }
})
</script>
