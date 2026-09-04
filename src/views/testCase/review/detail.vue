<template>
  <div class="rv-detail">
    <!-- 顶部 -->
    <div class="rv-header">
      <div class="breadcrumb">
        <span class="bc-link" @click="goBack">评审列表</span>
        <span class="bc-sep">/</span>
        <span>评审详情</span>
      </div>
      <div class="title-row">
        <div class="title-left">
          <el-tag :type="statusType" round>{{ statusLabel }}</el-tag>
          <h1 class="rv-title">{{ detail?.name ?? "-" }}</h1>
        </div>
      </div>
      <div class="meta-row">
        <span>评审人：{{ detail?.reviewers.join("、") || "-" }}</span>
        <span>起止时间：{{ detail?.startTime || "-" }} ~ {{ detail?.endTime || "-" }}</span>
        <span>已评审：<b>{{ reviewedCount }}</b> / {{ detail?.cases.length ?? 0 }}</span>
      </div>
    </div>

    <!-- 关联用例 -->
    <div class="rv-body">
      <div class="rv-panel">
        <div class="section-title">关联测试用例</div>
        <el-table v-loading="loading" :data="detail?.cases ?? []" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="id" label="ID" min-width="100" />
          <el-table-column prop="name" label="用例名称" min-width="220" />
          <el-table-column label="用例等级" min-width="100">
            <template #default="{ row }">
              <span :class="['level-dot', (row.level ?? '').toLowerCase()]">●</span>
              {{ row.level }}
            </template>
          </el-table-column>
          <el-table-column label="评审结果" min-width="120">
            <template #default="{ row }">
              <el-tag v-if="resultOf(row.id)" :type="resultOf(row.id)!.passed ? 'success' : 'danger'" round>
                {{ resultOf(row.id)!.passed ? "通过" : "不通过" }}
              </el-tag>
              <el-tag v-else type="info" round>未评审</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="评审意见" min-width="180">
            <template #default="{ row }">{{ resultOf(row.id)?.comment || "-" }}</template>
          </el-table-column>
          <el-table-column label="操作" min-width="90" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary"
                @click="router.push(`/test-case/review/detail/${reviewId}/case/${row.id}`)">评审</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!loading && !detail?.cases.length" class="empty-state">暂无关联用例</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchReviewDetail } from "@/api/testCase";
import type { ReviewDetail } from "@/types/models";

const route = useRoute();
const router = useRouter();
const reviewId = computed(() => String(route.params.id));

const loading = ref(false);
const detail = ref<ReviewDetail | null>(null);

const statusMap = {
  PENDING: { text: "待评审", type: "warning" as const },
  PASSED: { text: "通过", type: "success" as const },
  REJECTED: { text: "驳回", type: "danger" as const },
};
const statusLabel = computed(() => statusMap[detail.value?.status ?? "PENDING"].text);
const statusType = computed(() => statusMap[detail.value?.status ?? "PENDING"].type);

const reviewedCount = computed(
  () => Object.keys(detail.value?.results ?? {}).filter((k) => detail.value?.caseIds.includes(k)).length,
);

function resultOf(caseId: string) {
  return detail.value?.results?.[caseId];
}

function goBack() {
  router.push("/test-case/review");
}

onMounted(async () => {
  loading.value = true;
  try {
    detail.value = await fetchReviewDetail(reviewId.value);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.rv-detail {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.rv-header {
  padding: 16px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 14px;
}

.breadcrumb {
  font-size: 13px;
  color: var(--text-3);
  margin-bottom: 12px;
}

.bc-link {
  color: var(--accent);
  cursor: pointer;
}

.bc-link:hover {
  text-decoration: underline;
}

.bc-sep {
  margin: 0 6px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rv-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-1);
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  font-size: 13px;
  color: var(--text-2);
}

.meta-row b {
  color: var(--accent);
}

.rv-body {
  flex: 1;
}

.rv-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 12px;
}

.level-dot {
  margin-right: 4px;
}

.level-dot.p0 {
  color: #ef4444;
}

.level-dot.p1 {
  color: #f59e0b;
}

.level-dot.p2 {
  color: #3b82f6;
}

.level-dot.p3 {
  color: #94a3b8;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-3);
  font-size: 13px;
  border: 1px dashed var(--border);
  border-radius: 6px;
}
</style>
