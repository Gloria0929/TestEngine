<template>
  <div class="recycle">
    <div class="recycle-card">
      <el-table :data="rows" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="用例名称" min-width="240" />
        <el-table-column prop="level" label="等级" min-width="80" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">{{ statusText(row.status) }}</template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="160" />
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="onRestore(row)">恢复</el-button>
            <el-button link type="danger" @click="onPurge(row)">彻底删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchRecycle, restoreCase, purgeCase } from '@/api/testCase'
import type { TestCase } from '@/types/models'

const rows = ref<TestCase[]>([])
const loading = ref(false)

function statusText(s: TestCase['status']) { return { DRAFT: '草稿', REVIEW: '待评审', READY: '就绪' }[s] ?? s }

async function load() {
  loading.value = true
  try {
    rows.value = await fetchRecycle()
  } finally {
    loading.value = false
  }
}
async function onRestore(row: TestCase) {
  await restoreCase(row.id)
  ElMessage.success('已恢复')
  load()
}
async function onPurge(row: TestCase) {
  await ElMessageBox.confirm('彻底删除后不可恢复，确认删除？', '确认', { type: 'warning' })
  await purgeCase(row.id)
  ElMessage.success('已彻底删除')
  load()
}
onMounted(load)
</script>

<style scoped>
.recycle {
  padding: 16px;
}

.recycle-card {
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  overflow: hidden;
}
</style>
