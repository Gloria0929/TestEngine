<template>
  <div class="review">
    <div class="toolbar">
      <div class="spacer" />
      <el-button type="primary" @click="dialogVisible = true">新建评审</el-button>
    </div>
    <el-table :data="rows" v-loading="loading">
      <el-table-column prop="name" label="名称" min-width="200" />
      <el-table-column label="评审人" min-width="160">
        <template #default="{ row }">{{ row.reviewers.join('、') }}</template>
      </el-table-column>
      <el-table-column label="状态" min-width="100">
        <template #default="{ row }"><el-tag :type="statusMap[row.status as ReviewStatus].type" size="small">{{
          statusMap[row.status as ReviewStatus].text }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="caseCount" label="用例数" min-width="80" />
      <el-table-column label="起止时间" min-width="260">
        <template #default="{ row }">{{ row.startTime }} ~ {{ row.endTime }}</template>
      </el-table-column>
      <el-table-column label="操作" min-width="100" fixed="right">
        <template #default="{ row }"><el-button link type="primary" @click="openReview(row)">评审</el-button></template>
      </el-table-column>
    </el-table>

    <ReviewDialog v-model="dialogVisible" @saved="load" />

    <el-dialog v-model="reviewVisible" :title="current?.name" width="720px" class="review-dialog">
      <div v-loading="detailLoading">
        <template v-if="detail">
          <div v-for="c in detail.cases" :key="c.id" class="case-row">
            <div class="case-info">
              <div class="case-name">{{ c.name }}</div>
              <div class="case-meta">{{ c.moduleId }} · {{ c.level }}</div>
            </div>
            <div class="case-review">
              <el-radio-group v-model="results[c.id].passed">
                <el-radio-button :value="true">通过</el-radio-button>
                <el-radio-button :value="false">不通过</el-radio-button>
              </el-radio-group>
              <el-input v-model="results[c.id].comment" placeholder="评审意见（选填）" />
            </div>
          </div>
        </template>
        <el-empty v-else-if="!detailLoading" description="暂无关联用例" />
      </div>
      <template #footer>
        <el-button @click="reviewVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">提交评审</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import ReviewDialog from './components/ReviewDialog.vue'
import { fetchReviews, fetchReviewDetail, submitReviewResult } from '@/api/testCase'
import type { Review, ReviewDetail } from '@/types/models'

type ReviewStatus = Review['status']
interface CaseResult { passed: boolean; comment: string }

const rows = ref<Review[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const reviewVisible = ref(false)
const detailLoading = ref(false)
const submitting = ref(false)
const current = ref<Review | null>(null)
const detail = ref<ReviewDetail | null>(null)
const results = reactive<Record<string, CaseResult>>({})

const statusMap: Record<ReviewStatus, { text: string; type: 'warning' | 'success' | 'danger' }> = {
  PENDING: { text: '待评审', type: 'warning' },
  PASSED: { text: '通过', type: 'success' },
  REJECTED: { text: '驳回', type: 'danger' },
}

async function load() {
  loading.value = true
  try {
    rows.value = await fetchReviews()
  } finally {
    loading.value = false
  }
}
async function openReview(row: Review) {
  current.value = row
  reviewVisible.value = true
  detailLoading.value = true
  detail.value = null
  Object.keys(results).forEach((k) => delete results[k])
  const d = await fetchReviewDetail(row.id)
  detail.value = d
  if (d) d.cases.forEach((c) => { results[c.id] = { passed: true, comment: '' } })
  detailLoading.value = false
}
async function onSubmit() {
  if (!current.value || !detail.value) return
  submitting.value = true
  const list = detail.value.cases.map((c) => ({
    caseId: c.id, passed: results[c.id].passed, comment: results[c.id].comment,
  }))
  await submitReviewResult(current.value.id, list)
  ElMessage.success('评审已提交')
  submitting.value = false
  reviewVisible.value = false
  load()
}
onMounted(load)
</script>

<style scoped>
.review {
  padding: 16px;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.spacer {
  flex: 1;
}

.case-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.case-info {
  min-width: 200px;
}

.case-name {
  font-weight: 500;
}

.case-meta {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-top: 4px;
}

.case-review {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.case-review .el-input {
  flex: 1;
}
</style>
