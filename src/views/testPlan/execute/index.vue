<template>
  <div class="plan-detail">
    <!-- 顶部面包屑 + 标题 + 操作 -->
    <div class="detail-header">
      <div class="breadcrumb">
        <span class="bc-link" @click="goBack">测试计划</span>
        <span class="bc-sep">/</span>
        <span>测试计划详情</span>
      </div>
      <div class="title-row">
        <div class="title-left">
          <el-tag
            :type="planStatusType"
            size="small"
            effect="light"
            class="status-tag"
          >
            {{ planStatusLabel }}
          </el-tag>
          <h1 class="plan-title">[1] {{ planName }}</h1>
        </div>
        <div class="title-actions">
          <el-button link type="primary" :icon="Edit">编辑</el-button>
          <el-button link type="primary" :icon="Document">生成报告</el-button>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-item"
          >已执行 <strong>{{ doneCount }} / {{ rows.length }}</strong></span
        >
        <span class="stat-item"
          >通过率 <strong>{{ passRate }}%</strong></span
        >
        <el-progress
          :percentage="percent"
          :show-text="false"
          :color="progressColors"
          class="progress-bar"
        />
      </div>
    </div>

    <!-- Tab -->
    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="功能用例" name="case">
        <template #label>
          <span>功能用例</span>
          <el-tag size="small" type="info" effect="plain" class="tab-count">{{
            rows.length
          }}</el-tag>
        </template>
      </el-tab-pane>
      <el-tab-pane label="缺陷列表" name="bug" />
      <el-tab-pane label="执行历史" name="history" />
    </el-tabs>

    <!-- 功能用例内容 -->
    <div v-if="activeTab === 'case'" class="case-workspace">
      <!-- 左侧树 -->
      <div class="case-tree">
        <el-radio-group v-model="treeMode" size="small" class="tree-mode">
          <el-radio-button value="point">测试点</el-radio-button>
          <el-radio-button value="module">模块</el-radio-button>
        </el-radio-group>
        <el-input
          v-model="treeKeyword"
          placeholder="请输入名称"
          size="small"
          clearable
          class="tree-search"
        />
        <el-tree
          :data="treeData"
          :props="{ label: 'name', children: 'children' }"
          :default-expand-all="true"
          :highlight-current="true"
          node-key="id"
          @node-click="onTreeNodeClick"
        />
      </div>

      <!-- 右侧表格 -->
      <div class="case-main">
        <div class="toolbar">
          <el-input
            v-model="keyword"
            placeholder="通过 ID/名称搜索"
            clearable
            size="small"
            style="width: 240px"
            @change="loadCases"
            @keyup.enter="loadCases"
          >
            <template #prefix
              ><el-icon><Search /></el-icon
            ></template>
          </el-input>
          <div class="toolbar-right">
            <el-button size="small" :icon="Filter">筛选</el-button>
            <el-button size="small" :icon="RefreshRight" @click="loadCases"
              >刷新</el-button
            >
            <el-button
              type="primary"
              size="small"
              :icon="Plus"
              @click="linkVisible = true"
              >关联用例</el-button
            >
          </div>
        </div>

        <el-table
          :data="rows"
          v-loading="loading"
          @selection-change="(s: CaseRow[]) => (selectedRows = s)"
        >
          <el-table-column type="selection" width="48" />
          <el-table-column prop="id" label="ID" sortable width="90" />
          <el-table-column prop="name" label="用例名称" min-width="220" />
          <el-table-column prop="testPoint" label="测试点" min-width="160" />
          <el-table-column label="用例等级" width="110">
            <template #default="{ row }">
              <span :class="['level-dot', row.level.toLowerCase()]">●</span>
              {{ row.level }}
            </template>
          </el-table-column>
          <el-table-column label="标签" min-width="140">
            <template #default="{ row }">
              <span v-if="!row.tags.length">-</span>
              <el-tag
                v-for="tag in row.tags.slice(0, 2)"
                :key="tag"
                size="small"
                effect="plain"
                class="case-tag"
                >{{ tag }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openExecute(row)"
                >执行</el-button
              >
              <el-button link type="primary" @click="unlinkCase(row)"
                >取消关联</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 其他 Tab 占位 -->
    <div v-else class="tab-placeholder">
      {{
        { plan: "测试规划内容", bug: "缺陷列表内容", history: "执行历史内容" }[
          activeTab
        ]
      }}
    </div>

    <!-- 执行结果抽屉 -->
    <el-drawer v-model="executeVisible" title="执行用例" size="640px">
      <div v-if="currentRow" class="execute-form">
        <!-- 用例基本信息 -->
        <div class="case-info-box">
          <div class="info-row">
            <span class="info-label">用例名称</span>
            <span>{{ currentRow.name }}</span>
          </div>
          <div class="info-row" v-if="currentRow.precondition">
            <span class="info-label">前置条件</span>
            <span>{{ currentRow.precondition }}</span>
          </div>
        </div>

        <!-- 整体执行结果 -->
        <div class="form-section">
          <div class="section-label">执行结果</div>
          <div class="result-btns">
            <el-button
              v-for="s in states"
              :key="s.value"
              size="default"
              :type="executeForm.result === s.value ? s.type : 'default'"
              :plain="executeForm.result !== s.value"
              @click="executeForm.result = s.value"
              >{{ s.label }}</el-button
            >
          </div>
        </div>

        <!-- 步骤执行表格 -->
        <div class="form-section" v-if="currentRow.steps.length">
          <div class="section-label">步骤执行</div>
          <el-table
            :data="currentRow.steps"
            border
            size="small"
            class="step-table"
          >
            <el-table-column type="index" label="序号" width="52" />
            <el-table-column
              prop="description"
              label="用例步骤"
              min-width="140"
            />
            <el-table-column prop="expected" label="预期结果" min-width="140" />
            <el-table-column label="实际结果" min-width="160">
              <template #default="{ row: step }">
                <el-input
                  v-model="stepForm[step.id].actual"
                  placeholder="请输入实际"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="步骤执行结果" width="110">
              <template #default="{ row: step }">
                <el-select
                  v-model="stepForm[step.id].result"
                  placeholder="请选择"
                  size="small"
                >
                  <el-option
                    v-for="s in stepStates"
                    :key="s.value"
                    :label="s.label"
                    :value="s.value"
                  />
                </el-select>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 底部操作 -->
        <div class="form-footer">
          <el-switch v-model="autoNext" active-text="自动下一条" size="small" />
          <div class="footer-btns">
            <el-button @click="executeVisible = false">取消</el-button>
            <el-button type="primary" :loading="saving" @click="onExecuteSubmit"
              >提交结果</el-button
            >
          </div>
        </div>
      </div>
    </el-drawer>

    <PlanCaseDialog v-model="linkVisible" @linked="loadCases" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Edit,
  Document,
  DocumentCopy,
  Star,
  MoreFilled,
  Search,
  Filter,
  RefreshRight,
  Plus,
} from "@element-plus/icons-vue";
import PlanCaseDialog from "../list/components/PlanCaseDialog.vue";
import { fetchPlanCases, submitCaseResult } from "@/api/testPlan";
import { fetchModuleTree } from "@/api/testCase";
import type {
  TestCase,
  ExecuteResult,
  ModuleNode,
  PlanCaseResult,
} from "@/types/models";

interface CaseRow extends TestCase {
  result: ExecuteResult | null;
}

const route = useRoute();
const router = useRouter();
const planId = computed(() => String(route.params.id));
const planName = computed(() => String(route.query.name ?? ""));
const planStatus = computed(() => String(route.query.status ?? "RUNNING"));

const activeTab = ref("case");
const loading = ref(false);
const saving = ref(false);
const rows = ref<CaseRow[]>([]);
const selectedRows = ref<CaseRow[]>([]);
const keyword = ref("");
const treeMode = ref<"point" | "module">("point");
const treeKeyword = ref("");
const treeData = ref<ModuleNode[]>([]);
const currentModuleId = ref("");
const currentTestPoint = ref("");
const linkVisible = ref(false);

const executeVisible = ref(false);
const currentRow = ref<CaseRow | null>(null);
const executeForm = reactive<{ result: ExecuteResult | ""; actual: string }>({
  result: "",
  actual: "",
});
const stepForm = reactive<
  Record<string, { actual: string; result: ExecuteResult | "" }>
>({});
const autoNext = ref(false);

const planStatusLabel = computed(() => {
  return (
    { DRAFT: "未开始", RUNNING: "进行中", DONE: "已完成" }[planStatus.value] ??
    "进行中"
  );
});
const planStatusType = computed(() => {
  return (
    ({ DRAFT: "info", RUNNING: "primary", DONE: "success" }[
      planStatus.value
    ] as "info" | "primary" | "success") ?? "primary"
  );
});

const doneCount = computed(() => rows.value.filter((r) => r.result).length);
const percent = computed(() =>
  rows.value.length
    ? Math.round((doneCount.value / rows.value.length) * 100)
    : 0,
);
const passRate = computed(() => {
  const done = rows.value.filter((r) => r.result);
  if (!done.length) return 0;
  return Math.round(
    (done.filter((r) => r.result === "PASS").length / done.length) * 100,
  );
});
const progressColors = [
  { color: "#16a34a", percentage: 100 },
  { color: "#ef4444", percentage: 50 },
  { color: "#f59e0b", percentage: 0 },
];

const states: {
  value: ExecuteResult;
  label: string;
  type: "success" | "danger" | "warning" | "info";
}[] = [
  { value: "PASS", label: "成功", type: "success" },
  { value: "FAIL", label: "失败", type: "danger" },
  { value: "BLOCK", label: "阻塞", type: "warning" },
  { value: "SKIP", label: "跳过", type: "info" },
];

const stepStates: { value: ExecuteResult; label: string }[] = [
  { value: "PASS", label: "成功" },
  { value: "FAIL", label: "失败" },
  { value: "BLOCK", label: "阻塞" },
  { value: "SKIP", label: "跳过" },
];

function goBack() {
  router.push("/test-plan/list");
}
function onTreeNodeClick(node: ModuleNode) {
  if (treeMode.value === "module") {
    if (currentModuleId.value === node.id) {
      currentModuleId.value = "";
    } else {
      currentModuleId.value = node.id;
    }
    currentTestPoint.value = "";
  } else {
    if (node.id === "__all__" || currentTestPoint.value === node.id) {
      currentTestPoint.value = "";
    } else {
      currentTestPoint.value = node.id;
    }
    currentModuleId.value = "";
  }
  loadCases();
}

async function loadTree() {
  if (treeMode.value === "module") {
    treeData.value = await fetchModuleTree("p-1");
  } else {
    const all = await fetchPlanCases(planId.value);
    const countMap = all.reduce(
      (acc, c) => {
        acc[c.testPoint] = (acc[c.testPoint] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const points = Array.from(
      new Set(all.map((c) => c.testPoint).filter(Boolean)),
    );
    treeData.value = [
      {
        id: "__all__",
        name: `全部功能用例 (${all.length})`,
        children: points.map((p) => ({
          id: p,
          name: `${p} (${countMap[p]})`,
          children: [] as ModuleNode[],
        })),
      },
    ];
  }
}
async function loadCases() {
  loading.value = true;
  try {
    const params: { moduleId?: string; testPoint?: string; keyword?: string } =
      {};
    if (treeMode.value === "module" && currentModuleId.value) {
      params.moduleId = currentModuleId.value;
    }
    if (treeMode.value === "point" && currentTestPoint.value) {
      params.testPoint = currentTestPoint.value;
    }
    if (keyword.value) params.keyword = keyword.value;
    rows.value = await fetchPlanCases(planId.value, params);
  } finally {
    loading.value = false;
  }
}

function openExecute(row: CaseRow) {
  currentRow.value = row;
  executeForm.result = row.result ?? "PASS";
  executeForm.actual = "";
  // 初始化步骤表单
  Object.keys(stepForm).forEach((k) => delete stepForm[k]);
  for (const step of row.steps) {
    stepForm[step.id] = { actual: "", result: "" };
  }
  executeVisible.value = true;
}

async function onExecuteSubmit() {
  if (!currentRow.value || !executeForm.result) return;
  saving.value = true;
  const stepResults = currentRow.value.steps.map((s) => ({
    stepId: s.id,
    result: (stepForm[s.id]?.result ?? "") as ExecuteResult | "",
    actual: stepForm[s.id]?.actual ?? "",
  }));
  const existing = rows.value
    .filter((r) => r.result && r.id !== currentRow.value!.id)
    .map(
      (r) =>
        ({ caseId: r.id, result: r.result!, actual: "" }) as PlanCaseResult,
    );
  await submitCaseResult(planId.value, [
    ...existing,
    {
      caseId: currentRow.value.id,
      result: executeForm.result,
      actual: executeForm.actual,
      stepResults,
    },
  ]);
  saving.value = false;
  currentRow.value.result = executeForm.result;
  const submittedId = currentRow.value.id;
  executeVisible.value = false;
  ElMessage.success("已保存执行结果");

  if (autoNext.value) {
    const idx = rows.value.findIndex((r) => r.id === submittedId);
    if (idx >= 0 && idx < rows.value.length - 1) {
      nextTick(() => openExecute(rows.value[idx + 1]));
    }
  }
}

async function unlinkCase(row: CaseRow) {
  await ElMessageBox.confirm("确认取消该用例与计划的关联？", "提示", {
    type: "warning",
  });
  rows.value = rows.value.filter((r) => r.id !== row.id);
  ElMessage.success("已取消关联");
}

watch(treeMode, () => {
  currentModuleId.value = "";
  currentTestPoint.value = "";
  loadTree();
  loadCases();
});

onMounted(() => {
  loadTree();
  loadCases();
});
</script>

<style scoped>
.plan-detail {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.detail-header {
  margin-bottom: 12px;
}
.breadcrumb {
  font-size: 13px;
  color: var(--text-3);
  margin-bottom: 12px;
}
.bc-link {
  color: var(--el-color-primary);
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
  margin-bottom: 12px;
}
.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.status-tag {
  font-weight: 600;
}
.plan-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-1);
}
.title-actions {
  display: flex;
  gap: 4px;
}
.stat-row {
  display: flex;
  align-items: center;
  gap: 24px;
}
.stat-item {
  font-size: 13px;
  color: var(--text-2);
}
.stat-item strong {
  color: var(--text-1);
  font-weight: 600;
}
.progress-bar {
  flex: 1;
  max-width: 480px;
}
.detail-tabs {
  flex-shrink: 0;
}
.tab-count {
  margin-left: 6px;
  font-size: 11px;
  padding: 0 6px;
  height: 18px;
  line-height: 16px;
}
.case-workspace {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.case-tree {
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  padding-right: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}
.tree-mode {
  width: 100%;
  display: flex;
}
.tree-mode :deep(.el-radio-button) {
  flex: 1;
}
.tree-mode :deep(.el-radio-button__inner) {
  width: 100%;
  border-radius: 0;
  transition: all 0.2s;
  font-size: 13px;
  padding: 5px 0;
}
.tree-mode :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 4px 0 0 4px;
}
.tree-mode :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 4px 4px 0;
}
.tree-search {
  width: 100%;
}
.case-main {
  flex: 1;
  min-width: 0;
  overflow: auto;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.toolbar-right {
  display: flex;
  gap: 8px;
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
.tab-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
}
.execute-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.case-info-box {
  background: var(--el-fill-color-light);
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
}
.info-label {
  color: var(--text-3);
  white-space: nowrap;
  min-width: 56px;
}
.form-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.section-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
}
.result-btns {
  display: flex;
  gap: 10px;
}
.step-table :deep(.el-table__cell) {
  padding: 6px 0;
}
.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}
.footer-btns {
  display: flex;
  gap: 10px;
}
</style>
