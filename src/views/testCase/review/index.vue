<template>
  <div class="review">
    <div class="rv-head">
      <div></div>
      <el-button type="primary" @click="dialogVisible = true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        新建评审
      </el-button>
    </div>
    <div class="review-card">
      <el-table :data="rows" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="名称" min-width="200" />
        <el-table-column label="评审人" min-width="160">
          <template #default="{ row }">{{ row.reviewers.join('、') }}</template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }"><el-tag :type="statusMap[row.status as ReviewStatus].type" round>{{
            statusMap[row.status as ReviewStatus].text }}</el-tag></template>
        </el-table-column>
        <el-table-column label="评审进度" min-width="140">
          <template #default="{ row }">{{ reviewedCount(row) }} / {{ row.caseCount }}</template>
        </el-table-column>
        <el-table-column prop="caseCount" label="用例数" min-width="80" />
        <el-table-column label="起止时间" min-width="260">
          <template #default="{ row }">{{ row.startTime }} ~ {{ row.endTime }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push(`/test-case/review/detail/${row.id}`)">编辑</el-button>
            <el-button link type="primary" @click="onMove(row)">移动</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <ReviewDialog v-model="dialogVisible" @saved="load" />
    <!-- 移动到目录弹窗 -->
    <MoveFolderDialog v-model="moveVisible" :folders="folders" :current="movingRow?.folderId" @confirm="confirmMove" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ReviewDialog from './components/ReviewDialog.vue'
import MoveFolderDialog from '@/layouts/components/MoveFolderDialog.vue'
import { useFolders } from '@/composables/useFolders'
import { useCollectionsStore } from '@/stores/collections'
import { fetchReviews, updateReview } from '@/api/testCase'
import type { Review } from '@/types/models'

type ReviewStatus = Review['status']

const router = useRouter()
const rows = ref<Review[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const collectionsStore = useCollectionsStore()
const { folders, loadFolders } = useFolders('test-case')

// 移动到目录
const moveVisible = ref(false)
const movingRow = ref<Review | null>(null)
function onMove(row: Review) {
  movingRow.value = row
  moveVisible.value = true
}
async function confirmMove(folderId: string) {
  if (!movingRow.value) return
  await updateReview(movingRow.value.id, { folderId: folderId || undefined })
  ElMessage.success('已移动')
  collectionsStore.notifyChange()
  load()
}

const statusMap: Record<ReviewStatus, { text: string; type: 'warning' | 'success' | 'danger' }> = {
  PENDING: { text: '待评审', type: 'warning' },
  PASSED: { text: '通过', type: 'success' },
  REJECTED: { text: '驳回', type: 'danger' },
}

function reviewedCount(row: Review) {
  return row.caseIds.filter((id) => row.results?.[id]).length
}

async function load() {
  loading.value = true
  try {
    rows.value = await fetchReviews()
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  loadFolders()
  load()
})
</script>

<style scoped>
.review {
  padding: 16px;
}

.rv-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  /* 拉满整行宽度：向左扩展到目录侧边栏左缘（自身padding 16 + 侧栏 200 + 间距 16） */
  margin-left: -232px;
}

.review-card {
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  overflow: hidden;
}
</style>
