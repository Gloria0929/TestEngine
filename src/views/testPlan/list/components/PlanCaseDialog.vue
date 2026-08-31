<template>
  <el-dialog :model-value="modelValue" title="关联用例" width="640px"
    @update:model-value="$emit('update:modelValue', $event)" @open="load">
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索用例名称" clearable style="width: 220px" @change="onSearch" />
    </div>
    <el-table :data="rows" v-loading="loading" @selection-change="onSelect">
      <el-table-column type="selection" width="48" />
      <el-table-column prop="name" label="用例名称" min-width="220" />
      <el-table-column prop="level" label="优先级" width="80" />
      <el-table-column prop="moduleId" label="模块" width="110" />
    </el-table>
    <div class="pager">
      <el-pagination background layout="total, prev, pager, next" :total="total"
        v-model:current-page="pageNum" :page-size="pageSize" @current-change="load" />
    </div>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="onConfirm">确认关联</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchCaseList } from '@/api/testCase'
import type { TestCase } from '@/types/models'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const keyword = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const rows = ref<TestCase[]>([])
const selected = ref<TestCase[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await fetchCaseList({ pageNum: pageNum.value, pageSize: pageSize.value, keyword: keyword.value })
    rows.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}
function onSearch() {
  pageNum.value = 1
  load()
}
function onSelect(s: TestCase[]) {
  selected.value = s
}
function onConfirm() {
  ElMessage.success(`已关联 ${selected.value.length} 个用例`)
  emit('update:modelValue', false)
}
</script>

<style scoped>
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.pager { display: flex; justify-content: flex-end; margin-top: 12px; }
</style>
