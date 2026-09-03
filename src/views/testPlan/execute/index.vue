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
          <el-tag :type="planStatusType" effect="light" class="status-tag">
            {{ planStatusLabel }}
          </el-tag>
          <h1 class="plan-title">[1] {{ planName }}</h1>
        </div>
        <div class="title-actions">
          <el-button link type="primary" :icon="Edit" @click="openPlanEdit">编辑</el-button>
          <el-button link type="primary" :icon="Document" @click="onGenerateReport">生成报告</el-button>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-item">已执行 <strong>{{ doneCount }} / {{ rows.length }}</strong></span>
        <span class="stat-item">通过率 <strong>{{ passRate }}%</strong></span>
        <span class="stat-item">缺陷 <strong>{{ bugUnresolved }}</strong> / {{ bugTotal }}</span>
        <span class="stat-item">执行记录 <strong>{{ historyTotal }}</strong></span>
        <el-progress :percentage="percent" :show-text="false" :color="progressColors" class="progress-bar" />
      </div>
    </div>

    <!-- Tab -->
    <el-tabs v-model="activeTab">
      <el-tab-pane label="功能用例" name="case">
        <template #label>
          <span>功能用例</span>
          <el-tag type="info" effect="plain" class="tab-count">{{
            rows.length
          }}</el-tag>
        </template>
      </el-tab-pane>
      <el-tab-pane name="bug">
        <template #label>
          <span>缺陷列表</span>
          <el-tag type="info" effect="plain" class="tab-count">{{ bugTotal }}</el-tag>
        </template>
      </el-tab-pane>
      <el-tab-pane name="history">
        <template #label>
          <span>执行历史</span>
          <el-tag type="info" effect="plain" class="tab-count">{{ historyTotal }}</el-tag>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 功能用例内容 -->
    <div v-if="activeTab === 'case'" class="case-workspace">
      <!-- 测试用例列表 -->
      <div class="case-main">
        <div class="toolbar">
          <el-input v-model="keyword" placeholder="通过 ID/名称搜索" clearable style="width: 240px" @change="loadCases"
            @keyup.enter="loadCases">
            <template #prefix><el-icon>
                <Search />
              </el-icon></template>
          </el-input>
          <div class="toolbar-right">
            <el-button :icon="RefreshRight" @click="loadCases">刷新</el-button>
            <el-button type="primary" :icon="Plus" @click="linkVisible = true">关联用例</el-button>
          </div>
        </div>

        <el-table :data="rows" v-loading="loading" @selection-change="(s: CaseRow[]) => (selectedRows = s)">
          <el-table-column type="selection" width="48" />
          <el-table-column prop="id" label="ID" sortable min-width="90" />
          <el-table-column prop="name" label="用例名称" min-width="220" />
          <el-table-column prop="testPoint" label="测试点" min-width="160" />
          <el-table-column label="用例等级" min-width="110">
            <template #default="{ row }">
              <span :class="['level-dot', row.level.toLowerCase()]">●</span>
              {{ row.level }}
            </template>
          </el-table-column>
          <el-table-column label="标签" min-width="140">
            <template #default="{ row }">
              <span v-if="!row.tags.length">-</span>
              <el-tag v-for="tag in row.tags.slice(0, 2)" :key="tag" effect="plain" class="case-tag">{{ tag
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="goCaseExecute(row)">执行</el-button>
              <el-button link type="primary" @click="unlinkCase(row)">取消关联</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 缺陷列表 -->
    <div v-else-if="activeTab === 'bug'" class="case-workspace">
      <div class="case-main">
        <el-table v-loading="bugLoading" :data="bugList" style="width: 100%">
          <el-table-column prop="id" label="ID" min-width="100" />
          <el-table-column prop="title" label="缺陷标题" min-width="240" />
          <el-table-column label="严重程度" min-width="110">
            <template #default="{ row }">
              <span class="bg-pill" :class="severityCls(row.severity)">{{ severityLabel(row.severity) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              <span class="bg-pill" :class="statusCls(row.status)">{{ statusLabel(row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="assignee" label="受理人" min-width="120">
            <template #default="{ row }">
              <span>{{ row.assignee || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="reporter" label="报告人" min-width="120" />
          <el-table-column prop="createTime" label="创建时间" min-width="160" />
        </el-table>
        <div v-if="!bugLoading && !bugList.length" class="empty-state">暂无缺陷</div>
      </div>
    </div>

    <!-- 执行历史 -->
    <div v-else-if="activeTab === 'history'" class="case-workspace">
      <div class="case-main">
        <el-table v-loading="historyLoading" :data="historyList" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column label="执行结果" min-width="100">
            <template #default="{ row }">
              <span class="bg-pill" :class="resultCls(row.result)">{{ resultLabel(row.result) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="actual" label="实际结果/备注" min-width="260">
            <template #default="{ row }">
              <span style="white-space: pre-wrap">{{ row.actual || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="executor" label="执行人" min-width="120" />
          <el-table-column prop="executeTime" label="执行时间" min-width="160" />
        </el-table>
        <div v-if="!historyLoading && !historyList.length" class="empty-state">暂无执行历史</div>
      </div>
    </div>

    <!-- 编辑测试计划弹窗 -->
    <el-dialog v-model="editVisible" width="520px" :close-on-click-modal="false">
      <template #header>
        <h3>编辑测试计划</h3>
      </template>
      <div class="tp-form">
        <div class="tp-row">
          <label>计划名称<em>*</em></label>
          <el-input v-model="editForm.name" maxlength="60" placeholder="请输入计划名称" style="width:100%" />
          <div v-if="editErr.name" class="err">{{ editErr.name }}</div>
        </div>
        <div class="tp-row">
          <label>所属模块</label>
          <el-select v-model="editForm.group" style="width:100%">
            <el-option v-for="m in MODULES" :key="m" :label="m" :value="m" />
          </el-select>
        </div>
        <div class="tp-row">
          <label>创建人<em>*</em></label>
          <el-input v-model="editForm.owner" maxlength="20" placeholder="请输入创建人" style="width:100%" />
          <div v-if="editErr.owner" class="err">{{ editErr.owner }}</div>
        </div>
        <div class="tp-row">
          <label>开始时间</label>
          <el-date-picker v-model="editForm.startTime" type="date" value-format="YYYY-MM-DD" placeholder="选择开始日期"
            style="width:100%" />
        </div>
        <div class="tp-row">
          <label>结束时间</label>
          <el-date-picker v-model="editForm.endTime" type="date" value-format="YYYY-MM-DD" placeholder="选择结束日期"
            style="width:100%" />
        </div>
        <div class="tp-row">
          <label>状态</label>
          <el-select v-model="editForm.status" style="width:100%">
            <el-option v-for="s in STATUSES" :key="s.v" :label="s.t" :value="s.v" />
          </el-select>
        </div>
      </div>
      <template #footer>
        <div class="tp-modal-foot">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" :disabled="editSaving" @click="savePlanEdit">{{ editSaving ? '保存中…' : '保存'
            }}</el-button>
        </div>
      </template>
    </el-dialog>

    <PlanCaseDialog v-model="linkVisible" @linked="loadCases" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Edit,
  Document,
  Search,
  RefreshRight,
  Plus,
} from "@element-plus/icons-vue";
import PlanCaseDialog from "../list/components/PlanCaseDialog.vue";
import {
  fetchPlan,
  fetchPlanCases,
  updatePlan,
  exportPlanReport,
  fetchPlanBugs,
  fetchPlanExecuteHistory,
} from "@/api/testPlan";
import type { TestCase, ExecuteResult, Bug, BugSeverity, BugStatus, CaseExecuteHistory } from "@/types/models";

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
const rows = ref<CaseRow[]>([]);
const selectedRows = ref<CaseRow[]>([]);
const keyword = ref("");
const linkVisible = ref(false);

const planInfo = ref<Partial<import("@/types/models").TestPlan>>({});

// 缺陷列表
const bugList = ref<Bug[]>([]);
const bugLoading = ref(false);
// 执行历史
const historyList = ref<CaseExecuteHistory[]>([]);
const historyLoading = ref(false);

// 编辑弹窗
const editVisible = ref(false);
const editSaving = ref(false);
const editForm = reactive({
  name: "",
  group: "订单中心",
  owner: "",
  startTime: "",
  endTime: "",
  status: "DRAFT" as "DRAFT" | "RUNNING" | "DONE",
});
const editErr = reactive({ name: "", owner: "" });
const MODULES = ["订单中心", "支付中台", "用户中心", "商品模块", "营销活动", "权限中心"];
const STATUSES = [
  { v: "DRAFT", t: "未开始" },
  { v: "RUNNING", t: "进行中" },
  { v: "DONE", t: "已完成" },
];

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

const bugTotal = computed(() => bugList.value.length);
const bugUnresolved = computed(() => bugList.value.filter((b) => !["CLOSED", "FIXED"].includes(b.status)).length);
const historyTotal = computed(() => historyList.value.length);
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

function goBack() {
  router.push("/test-plan/list");
}

function goCaseExecute(row: CaseRow) {
  router.push({
    path: `/test-plan/case-execute/${planId.value}/${row.id}`,
    query: { name: planName.value },
  });
}

async function loadPlan() {
  try {
    planInfo.value = await fetchPlan(planId.value);
  } catch {
    planInfo.value = {};
  }
}

async function loadCases() {
  loading.value = true;
  try {
    const params: { keyword?: string } = {};
    if (keyword.value) params.keyword = keyword.value;
    rows.value = await fetchPlanCases(planId.value, params);
  } finally {
    loading.value = false;
  }
}

async function loadBugs() {
  bugLoading.value = true;
  try {
    bugList.value = await fetchPlanBugs(planId.value);
  } catch {
    bugList.value = [];
  } finally {
    bugLoading.value = false;
  }
}

async function loadHistory() {
  historyLoading.value = true;
  try {
    historyList.value = await fetchPlanExecuteHistory(planId.value);
  } catch {
    historyList.value = [];
  } finally {
    historyLoading.value = false;
  }
}

function openPlanEdit() {
  const p = planInfo.value;
  editForm.name = p.name ?? planName.value ?? "";
  editForm.group = p.group ?? MODULES[0];
  editForm.owner = p.owner ?? "";
  editForm.startTime = p.startTime ?? "";
  editForm.endTime = p.endTime ?? "";
  editForm.status = (p.status as any) ?? "DRAFT";
  editErr.name = "";
  editErr.owner = "";
  editVisible.value = true;
}

async function savePlanEdit() {
  editErr.name = editForm.name.trim() ? "" : "请输入计划名称";
  editErr.owner = editForm.owner.trim() ? "" : "请输入创建人";
  if (!editForm.name.trim() || !editForm.owner.trim()) return;
  editSaving.value = true;
  try {
    await updatePlan(planId.value, { ...editForm });
    ElMessage.success("已保存");
    editVisible.value = false;
    await loadPlan();
  } finally {
    editSaving.value = false;
  }
}

async function onGenerateReport() {
  try {
    await exportPlanReport(planId.value);
    ElMessage.success("报告生成成功");
    router.push({
      path: `/test-plan/report/${planId.value}`,
      query: { name: planName.value },
    });
  } catch {
    ElMessage.error("报告生成失败");
  }
}

async function unlinkCase(row: CaseRow) {
  await ElMessageBox.confirm("确认取消该用例与计划的关联？", "提示", {
    type: "warning",
  });
  rows.value = rows.value.filter((r) => r.id !== row.id);
  ElMessage.success("已取消关联");
}

const severityLabelMap: Record<BugSeverity, string> = {
  BLOCKER: "阻塞", CRITICAL: "严重", MAJOR: "主要", MINOR: "次要", TRIVIAL: "轻微",
};
const severityClsMap: Record<BugSeverity, string> = {
  BLOCKER: "sv-blocker", CRITICAL: "sv-critical", MAJOR: "sv-major", MINOR: "sv-minor", TRIVIAL: "sv-trivial",
};
function severityLabel(s: BugSeverity) { return severityLabelMap[s] ?? s; }
function severityCls(s: BugSeverity) { return severityClsMap[s] ?? "sv-minor"; }

const statusLabelMap: Record<BugStatus, string> = {
  NEW: "新建", ASSIGNED: "已指派", FIXING: "修复中", FIXED: "已解决", CLOSED: "已关闭", REOPEN: "重新打开",
};
const statusClsMap: Record<BugStatus, string> = {
  NEW: "st-new", ASSIGNED: "st-assigned", FIXING: "st-fixing", FIXED: "st-fixed", CLOSED: "st-closed", REOPEN: "st-reopen",
};
function statusLabel(s: BugStatus) { return statusLabelMap[s] ?? s; }
function statusCls(s: BugStatus) { return statusClsMap[s] ?? "st-new"; }

const resultLabelMap: Record<string, string> = { PASS: "成功", FAIL: "失败", BLOCK: "阻塞", SKIP: "跳过" };
const resultClsMap: Record<string, string> = { PASS: "rs-pass", FAIL: "rs-fail", BLOCK: "rs-block", SKIP: "rs-none" };
function resultLabel(r: ExecuteResult) { return resultLabelMap[r] ?? r; }
function resultCls(r: ExecuteResult) { return resultClsMap[r] ?? "rs-none"; }

onMounted(() => {
  loadPlan();
  loadCases();
  loadBugs();
  loadHistory();
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

.empty-state {
  padding: 40px 0;
  text-align: center;
  color: var(--text-3);
}

.bg-pill {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  font-size: 12px;
  line-height: 1;
}

.rs-pass {
  background: #ecfdf5;
  color: #065f46;
}

.rs-fail {
  background: #fef2f2;
  color: #991b1b;
}

.rs-block {
  background: #fffbeb;
  color: #92400e;
}

.rs-none {
  background: #f3f4f6;
  color: #374151;
}

.sv-blocker {
  background: #fef2f2;
  color: #991b1b;
}

.sv-critical {
  background: #fff1f2;
  color: #be123c;
}

.sv-major {
  background: #fffbeb;
  color: #92400e;
}

.sv-minor {
  background: #eff6ff;
  color: #1d4ed8;
}

.sv-trivial {
  background: #f3f4f6;
  color: #4b5563;
}

.st-new {
  background: #eff6ff;
  color: #1e40af;
}

.st-assigned {
  background: #f3e8ff;
  color: #6b21a8;
}

.st-fixing {
  background: #fffbeb;
  color: #92400e;
}

.st-fixed {
  background: #ecfdf5;
  color: #065f46;
}

.st-closed {
  background: #f3f4f6;
  color: #4b5563;
}

.st-reopen {
  background: #fef2f2;
  color: #991b1b;
}

.tp-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tp-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tp-row label {
  font-size: 13px;
  color: var(--text-2);
}

.tp-row label em {
  color: #ef4444;
  margin-left: 2px;
}

.tp-row .err {
  font-size: 12px;
  color: #ef4444;
}

.tp-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
