<template>
  <div class="case-review-page">
    <!-- 顶部 -->
    <div class="cr-header">
      <div class="breadcrumb">
        <span class="bc-link" @click="goBackToDetail">评审详情</span>
        <span class="bc-sep">/</span>
        <span>评审用例</span>
      </div>
      <div class="title-row">
        <div class="title-left">
          <el-tag :type="resultType" round>{{ resultLabel }}</el-tag>
          <h1 class="case-title">[{{ currentCase?.id }}] {{ currentCase?.name }}</h1>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <el-tabs v-model="activeTab" class="cr-tabs">
      <el-tab-pane label="基本信息" name="basic" />
      <el-tab-pane label="详情" name="detail" />
    </el-tabs>

    <!-- 内容区 -->
    <div class="cr-body">
      <!-- 基本信息 -->
      <div v-if="activeTab === 'basic'" class="cr-panel">
        <div class="info-section">
          <div class="section-title">基本信息</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">用例ID</span>
              <span class="info-value">{{ currentCase?.id ?? "-" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">用例名称</span>
              <span class="info-value">{{ currentCase?.name ?? "-" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">测试点</span>
              <span class="info-value">{{ currentCase?.testPoint ?? "-" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">用例等级</span>
              <span class="info-value">
                <span :class="['level-dot', (currentCase?.level ?? '').toLowerCase()]">●</span>
                {{ currentCase?.level ?? "-" }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">创建人</span>
              <span class="info-value">{{ currentCase?.createUser ?? "-" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">标签</span>
              <span class="info-value">
                <span v-if="!currentCase?.tags?.length">-</span>
                <el-tag v-for="tag in currentCase?.tags.slice(0, 3)" :key="tag" effect="plain" class="case-tag">{{ tag
                  }}</el-tag>
              </span>
            </div>
            <div class="info-item info-item-wide">
              <span class="info-label">评审目的</span>
              <span class="info-value">{{ currentCase?.purpose || "-" }}</span>
            </div>
            <div class="info-item info-item-wide">
              <span class="info-label">备注</span>
              <span class="info-value">{{ currentCase?.remark || "-" }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 详情 -->
      <div v-else-if="activeTab === 'detail'" class="cr-panel">
        <div class="info-section">
          <div class="section-title">前置条件</div>
          <div class="section-content">{{ currentCase?.precondition || "无" }}</div>
        </div>

        <div class="info-section">
          <div class="section-title">步骤描述</div>
          <el-table :data="currentCase?.steps ?? []" border style="width: 100%">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="description" label="用例步骤" min-width="240" />
            <el-table-column prop="expected" label="预期结果" min-width="240" />
          </el-table>
          <div v-if="!currentCase?.steps?.length" class="empty-state">暂无数据</div>
        </div>

        <div class="info-section">
          <div class="section-title">备注</div>
          <div class="section-content">{{ currentCase?.remark || "无" }}</div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="cr-footer">
      <div class="footer-left">
        <el-text class="result-radio" :class="{ active: form.passed === true }" @click="form.passed = true">
          <span class="radio-dot pass">
            <Check v-if="form.passed === true" />
          </span>
          <span>通过</span>
        </el-text>
        <el-text class="result-radio" :class="{ active: form.passed === false }" @click="form.passed = false">
          <span class="radio-dot fail">
            <Close v-if="form.passed === false" />
          </span>
          <span>不通过</span>
        </el-text>
      </div>
      <div class="footer-center">
        <el-switch v-model="autoNext" active-text="自动下一条" />
      </div>
      <div class="footer-actions">
        <el-input v-model="form.comment" placeholder="评审意见（选填）" style="width: 260px" />
        <el-button type="primary" :loading="saving" @click="onSubmit">提交评审</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Check, Close } from "@element-plus/icons-vue";
import { fetchReviewDetail, submitReviewResult } from "@/api/testCase";
import type { ReviewDetail, TestCase } from "@/types/models";

const route = useRoute();
const router = useRouter();
const reviewId = computed(() => String(route.params.id));
const caseId = computed(() => String(route.params.caseId));

const loading = ref(false);
const saving = ref(false);
const detail = ref<ReviewDetail | null>(null);
const activeTab = ref("detail");
const autoNext = ref(false);

const form = reactive<{ passed: boolean; comment: string }>({
  passed: true,
  comment: "",
});

const currentCase = computed(
  () => detail.value?.cases.find((c) => c.id === caseId.value) ?? (null as TestCase | null),
);

const resultLabel = computed(() => {
  const r = detail.value?.results?.[caseId.value];
  return r ? (r.passed ? "通过" : "不通过") : "未评审";
});
const resultType = computed(() => {
  const r = detail.value?.results?.[caseId.value];
  return r ? (r.passed ? "success" : "danger") : "info";
});

function initForm() {
  const existed = detail.value?.results?.[caseId.value];
  form.passed = existed ? existed.passed : true;
  form.comment = existed?.comment ?? "";
}

function goBackToDetail() {
  router.push(`/test-case/review/detail/${reviewId.value}`);
}

async function load() {
  loading.value = true;
  try {
    detail.value = await fetchReviewDetail(reviewId.value);
    initForm();
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  if (!currentCase.value) return;
  saving.value = true;
  try {
    await submitReviewResult(reviewId.value, [
      { caseId: currentCase.value.id, passed: form.passed, comment: form.comment },
    ]);
    ElMessage.success("评审已提交");
    if (autoNext.value) {
      const cases = detail.value?.cases ?? [];
      const idx = cases.findIndex((c) => c.id === caseId.value);
      if (idx >= 0 && idx < cases.length - 1) {
        const next = cases[idx + 1];
        router.replace(`/test-case/review/detail/${reviewId.value}/case/${next.id}`);
        return;
      }
    }
    goBackToDetail();
  } finally {
    saving.value = false;
  }
}

watch(caseId, () => {
  initForm();
});

onMounted(load);
</script>

<style scoped>
.case-review-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.cr-header {
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
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.case-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-1);
}

.cr-tabs {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px 10px 0 0;
  padding: 0 20px;
  border-bottom: none;
}

:deep(.cr-tabs .el-tabs__header) {
  margin-bottom: 0;
}

.cr-body {
  flex: 1;
}

.cr-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 10px 10px;
  padding: 20px;
}

.info-section {
  margin-bottom: 24px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 12px;
}

.section-content {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-2);
  white-space: pre-wrap;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item-wide {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 12px;
  color: var(--text-3);
}

.info-value {
  font-size: 13px;
  color: var(--text-1);
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

.case-tag {
  margin-right: 4px;
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

.cr-footer {
  margin-top: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.result-radio {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-2);
  user-select: none;
}

.result-radio .radio-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid currentColor;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.result-radio .radio-dot.pass {
  color: #16a34a;
  border-color: #16a34a;
}

.result-radio .radio-dot.fail {
  color: #dc2626;
  border-color: #dc2626;
}

.result-radio.active .radio-dot.pass {
  background: #16a34a;
  color: #fff;
}

.result-radio.active .radio-dot.fail {
  background: #dc2626;
  color: #fff;
}

.footer-center {
  flex-shrink: 0;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
</style>
