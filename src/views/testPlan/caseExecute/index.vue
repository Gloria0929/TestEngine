<template>
  <div class="case-execute-page">
    <!-- 顶部 -->
    <div class="ce-header">
      <div class="breadcrumb">
        <span class="bc-link" @click="goBack">测试计划详情</span>
        <span class="bc-sep">/</span>
        <span>执行用例</span>
      </div>
      <div class="title-row">
        <div class="title-left">
          <el-tag :type="caseStatusType" effect="light" class="status-tag">
            {{ caseStatusLabel }}
          </el-tag>
          <h1 class="case-title">
            [{{ currentCase?.id }}] {{ currentCase?.name }}
          </h1>
        </div>
        <div class="title-actions">
          <el-button :icon="Edit" @click="openCaseEdit">编辑</el-button>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <el-tabs v-model="activeTab" class="ce-tabs">
      <el-tab-pane label="基本信息" name="basic" />
      <el-tab-pane label="详情" name="detail" />
      <el-tab-pane label="缺陷列表" name="bug">
        <template #label>
          <span>缺陷列表</span>
          <el-tag type="info" effect="plain" class="tab-count">{{
            bugList.length
            }}</el-tag>
        </template>
      </el-tab-pane>
      <el-tab-pane name="history">
        <template #label>
          <span>执行历史</span>
          <el-tag type="info" effect="plain" class="tab-count">{{
            historyList.length
            }}</el-tag>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 内容区 -->
    <div class="ce-body">
      <!-- 基本信息 -->
      <div v-if="activeTab === 'basic'" class="ce-panel">
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
              <span class="info-value">{{
                currentCase?.testPoint ?? "-"
                }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">用例等级</span>
              <span class="info-value">
                <span :class="[
                  'level-dot',
                  (currentCase?.level ?? '').toLowerCase(),
                ]">●</span>
                {{ currentCase?.level ?? "-" }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">状态</span>
              <span class="info-value">{{ currentCase?.status ?? "-" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">标签</span>
              <span class="info-value">
                <span v-if="!currentCase?.tags.length">-</span>
                <el-tag v-for="tag in currentCase?.tags.slice(0, 3)" :key="tag" effect="plain" class="case-tag">{{ tag
                  }}</el-tag>
              </span>
            </div>
            <div class="info-item info-item-wide">
              <span class="info-label">备注</span>
              <span class="info-value">{{ currentCase?.remark || "-" }}</span>
            </div>
            <div class="info-item info-item-wide">
              <span class="info-label">附件</span>
              <span class="info-value">
                <span v-if="!currentCase?.attachments?.length">-</span>
                <el-link v-for="url in currentCase?.attachments" :key="url" :href="url" target="_blank"
                  class="attachment-link" :underline="false">{{
                    url.split("/").pop() }}</el-link>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 详情 -->
      <div v-else-if="activeTab === 'detail'" class="ce-panel">
        <div class="info-section">
          <div class="section-title">前置条件</div>
          <div class="section-content">
            {{ currentCase?.precondition || "无" }}
          </div>
        </div>

        <div class="info-section">
          <div class="section-title">步骤描述</div>
          <el-table :data="currentCase?.steps ?? []" border style="width: 100%">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="description" label="用例步骤" min-width="240" />
            <el-table-column prop="expected" label="预期结果" min-width="240" />
            <el-table-column label="实际结果" min-width="200">
              <template #default="{ row: step }">
                <el-input v-model="stepForm[step.id].actual" placeholder="请输入实际结果" />
              </template>
            </el-table-column>
            <el-table-column label="步骤执行结果" min-width="140">
              <template #default="{ row: step }">
                <el-select v-model="stepForm[step.id].result" placeholder="请选择" style="width: 100%">
                  <el-option v-for="s in stepStates" :key="s.value" :label="s.label" :value="s.value" />
                </el-select>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="!currentCase?.steps.length" class="empty-state">
            暂无数据
          </div>
        </div>

        <div class="info-section">
          <div class="section-title">备注</div>
          <div class="section-content">
            {{ currentCase?.remark || "无" }}
          </div>
        </div>

        <div class="info-section">
          <div class="section-title">附件</div>
          <div v-if="!currentCase?.attachments?.length" class="section-content empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path
                d="M21.44 11.05 12.96 19.53a6.5 6.5 0 0 1-9.19-9.19L12.35 1.76a4.5 4.5 0 0 1 6.36 6.36l-8.48 8.48a2.5 2.5 0 0 1-3.54-3.54l7.78-7.78" />
            </svg>
            <span>暂无附件</span>
          </div>
          <div v-else class="section-content">
            <el-link v-for="url in currentCase?.attachments" :key="url" :href="url" target="_blank"
              class="attachment-link" :underline="false">{{
                url.split("/").pop() }}</el-link>
          </div>
        </div>
      </div>

      <!-- 缺陷列表 -->
      <div v-else-if="activeTab === 'bug'" class="ce-panel">
        <div class="info-section">
          <div class="section-title">缺陷列表</div>
          <el-table v-if="bugList.length" :data="bugList" style="width: 100%">
            <el-table-column prop="id" label="ID" min-width="120" />
            <el-table-column prop="title" label="缺陷名称" min-width="240" />
            <el-table-column label="状态" min-width="100">
              <template #default="{ row }">
                <el-tag :type="bugStatusType(row.status)" round>{{
                  bugStatusLabel(row.status)
                  }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="优先级" min-width="100">
              <template #default="{ row }">
                <el-tag :type="bugPrioType(row.severity)" round>{{
                  bugPrioLabel(row.severity)
                }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div v-else class="empty-state">暂无缺陷</div>
        </div>
      </div>

      <!-- 执行历史 -->
      <div v-else-if="activeTab === 'history'" class="ce-panel">
        <div class="info-section">
          <div class="section-title">执行历史</div>
          <el-table v-loading="historyLoading" :data="historyList" style="width: 100%">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column label="执行结果" min-width="100">
              <template #default="{ row }">
                <el-tag :type="resultType(row.result)" round>{{
                  resultLabel(row.result)
                  }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="actual" label="实际结果/备注" min-width="240">
              <template #default="{ row }">
                <span style="white-space: pre-wrap">{{
                  row.actual || "-"
                  }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="executor" label="执行人" min-width="120" />
            <el-table-column prop="executeTime" label="执行时间" min-width="160" />
          </el-table>
          <div v-if="!historyLoading && !historyList.length" class="empty-state">
            暂无执行历史
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="ce-footer">
      <div class="footer-top">
        <div class="footer-left">
          <el-text class="result-radio" :class="{ active: executeForm.result === 'PASS' }"
            @click="executeForm.result = 'PASS'">
            <span class="radio-dot pass">
              <Check v-if="executeForm.result === 'PASS'" />
            </span>
            <span>成功</span>
          </el-text>
          <el-text class="result-radio" :class="{ active: executeForm.result === 'BLOCK' }"
            @click="executeForm.result = 'BLOCK'">
            <span class="radio-dot block">
              <Minus v-if="executeForm.result === 'BLOCK'" />
            </span>
            <span>阻塞</span>
          </el-text>
          <el-text class="result-radio" :class="{ active: executeForm.result === 'FAIL' }"
            @click="executeForm.result = 'FAIL'">
            <span class="radio-dot fail">
              <Close v-if="executeForm.result === 'FAIL'" />
            </span>
            <span>失败</span>
          </el-text>
        </div>
        <div class="footer-center">
          <el-switch v-model="autoNext" active-text="自动下一条" />
        </div>
      </div>
      <div class="footer-actions">
        <el-button type="primary" :loading="saving" @click="onSubmit">提交结果</el-button>
        <el-button :icon="Plus" @click="openBugModal">添加缺陷</el-button>
      </div>
    </div>

    <!-- 编辑用例弹窗 -->
    <el-dialog v-model="caseEditVisible" width="520px" :show-close="false" align-center class="fixed-dialog">
      <template #header>
        <h3>编辑用例</h3>
      </template>
      <div class="case-edit-form">
        <div class="case-edit-row">
          <el-text>用例名称<em>*</em></el-text>
          <el-input v-model="caseEditForm.name" maxlength="60" placeholder="请输入用例名称" />
          <div v-if="caseEditErr.name" class="err">{{ caseEditErr.name }}</div>
        </div>
        <div class="case-edit-row">
          <el-text>测试点</el-text>
          <el-input v-model="caseEditForm.testPoint" maxlength="60" placeholder="请输入测试点" />
        </div>
        <div class="case-edit-row">
          <el-text>用例等级</el-text>
          <el-select v-model="caseEditForm.level" style="width: 100%">
            <el-option v-for="l in LEVELS" :key="l.v" :value="l.v" :label="l.t" />
          </el-select>
        </div>
        <div class="case-edit-row">
          <el-text>状态</el-text>
          <el-select v-model="caseEditForm.status" style="width: 100%">
            <el-option v-for="s in STATUSES" :key="s.v" :value="s.v" :label="s.t" />
          </el-select>
        </div>
        <div class="case-edit-row">
          <el-text>前置条件</el-text>
          <el-input v-model="caseEditForm.precondition" type="textarea" :rows="3" maxlength="300"
            placeholder="请输入前置条件" />
        </div>
        <div class="case-edit-row">
          <el-text>标签</el-text>
          <el-input v-model="caseEditForm.tags" maxlength="100" placeholder="多个标签用逗号分隔" />
        </div>
        <div class="case-edit-row">
          <el-text>备注</el-text>
          <el-input v-model="caseEditForm.remark" type="textarea" :rows="3" maxlength="500" placeholder="请输入备注" />
        </div>
        <div class="case-edit-row">
          <el-text>附件</el-text>
          <el-upload action="/api/upload" :file-list="attachmentFiles" :on-success="onAttachmentSuccess"
            :on-remove="onAttachmentRemove" :limit="5" multiple class="case-edit-upload">
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="upload-tip">最多 5 个附件，单个不超过 10MB</div>
            </template>
          </el-upload>
        </div>
      </div>
      <template #footer>
        <div class="case-edit-foot">
          <el-button @click="caseEditVisible = false">取消</el-button>
          <el-button type="primary" :loading="caseEditSaving" :disabled="caseEditSaving" @click="saveCaseEdit">
            {{ caseEditSaving ? "保存中…" : "保存" }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加缺陷弹窗 -->
    <el-dialog v-model="bugVisible" width="540px" :show-close="false" align-center class="fixed-dialog">
      <template #header>
        <h3>添加缺陷</h3>
      </template>
      <div class="bug-form">
        <div class="bug-row bug-full">
          <el-text>缺陷名称<em>*</em></el-text>
          <el-input v-model="bugForm.title" maxlength="80" placeholder="请输入缺陷名称" />
          <div v-if="bugErr.title" class="err">{{ bugErr.title }}</div>
        </div>
        <div class="bug-row">
          <el-text>状态</el-text>
          <el-select v-model="bugForm.status" style="width: 100%">
            <el-option v-for="s in bugStatusOptions" :key="s.v" :value="s.v" :label="s.t" />
          </el-select>
        </div>
        <div class="bug-row">
          <el-text>优先级</el-text>
          <el-select v-model="bugForm.priority" style="width: 100%">
            <el-option v-for="p in bugPriorityOptions" :key="p.v" :value="p.v" :label="p.t" />
          </el-select>
        </div>
        <div class="bug-row">
          <el-text>受理人</el-text>
          <el-select v-model="bugForm.assignee" placeholder="请选择受理人" style="width: 100%" clearable>
            <el-option v-for="u in userOptions" :key="u" :label="u" :value="u" />
          </el-select>
        </div>
        <div class="bug-row bug-full">
          <el-text>描述</el-text>
          <el-input v-model="bugForm.desc" type="textarea" maxlength="300" :rows="3" placeholder="缺陷现象、复现步骤等（选填）" />
        </div>
      </div>
      <template #footer>
        <div class="bug-modal-foot">
          <el-button @click="bugVisible = false">取消</el-button>
          <el-button type="primary" :loading="bugSaving" :disabled="bugSaving" @click="onSaveBug">
            {{ bugSaving ? "创建中…" : "创建" }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Edit, Plus, Check, Close, Minus } from "@element-plus/icons-vue";
import {
  fetchPlanCases,
  submitCaseResult,
  fetchCaseExecuteHistory,
} from "@/api/testPlan";
import { fetchCase, updateCase } from "@/api/testCase";
import { createBug } from "@/api/bug";
import type {
  TestCase,
  ExecuteResult,
  PlanCaseResult,
  Bug,
  BugSeverity,
  BugStatus,
  CaseExecuteHistory,
} from "@/types/models";

interface CaseRow extends TestCase {
  result: ExecuteResult | null;
}

const route = useRoute();
const router = useRouter();
const planId = computed(() => String(route.params.planId));
const caseId = computed(() => String(route.params.caseId));
const planName = computed(() => String(route.query.name ?? ""));

const loading = ref(false);
const saving = ref(false);
const rows = ref<CaseRow[]>([]);
const activeTab = ref("detail");
const autoNext = ref(false);

const executeForm = reactive<{ result: ExecuteResult | ""; actual: string }>({
  result: "PASS",
  actual: "",
});
const stepForm = reactive<
  Record<string, { actual: string; result: ExecuteResult | "" }>
>({});

const currentCase = computed(
  () => rows.value.find((r) => r.id === caseId.value) ?? null,
);

const caseStatusLabel = computed(() => {
  const r = currentCase.value?.result;
  return r
    ? ({ PASS: "成功", FAIL: "失败", BLOCK: "阻塞", SKIP: "跳过" }[r] ??
      "未执行")
    : "未执行";
});
const caseStatusType = computed(() => {
  const r = currentCase.value?.result;
  if (!r) return "info";
  return (
    { PASS: "success", FAIL: "danger", BLOCK: "warning", SKIP: "info" }[r] ||
    "info"
  );
});

const stepStates: { value: ExecuteResult; label: string }[] = [
  { value: "PASS", label: "成功" },
  { value: "FAIL", label: "失败" },
  { value: "BLOCK", label: "阻塞" },
  { value: "SKIP", label: "跳过" },
];

// 用例编辑
const caseEditVisible = ref(false);
const caseEditSaving = ref(false);
const caseEditForm = reactive({
  name: "",
  testPoint: "",
  precondition: "",
  level: "P2" as "P0" | "P1" | "P2" | "P3",
  status: "DRAFT" as "DRAFT" | "REVIEW" | "READY",
  tags: "",
  remark: "",
  attachments: [] as string[],
});
const caseEditErr = reactive({ name: "" });
const attachmentFiles = computed(() =>
  caseEditForm.attachments.map((url, idx) => ({
    name: url.split("/").pop() || `附件${idx + 1}`,
    url,
    status: "success" as const,
    uid: idx,
  })),
);
function onAttachmentSuccess(res: any, file: any) {
  const url = res?.url || res?.data?.url || file.url;
  if (url && !caseEditForm.attachments.includes(url)) {
    caseEditForm.attachments.push(url);
  }
}
function onAttachmentRemove(file: any) {
  caseEditForm.attachments = caseEditForm.attachments.filter(
    (u) => u !== file.url,
  );
}
const LEVELS = [
  { v: "P0", t: "P0" },
  { v: "P1", t: "P1" },
  { v: "P2", t: "P2" },
  { v: "P3", t: "P3" },
];
const STATUSES = [
  { v: "DRAFT", t: "草稿" },
  { v: "REVIEW", t: "评审中" },
  { v: "READY", t: "已通过" },
];

// 执行历史
const historyList = ref<CaseExecuteHistory[]>([]);
const historyLoading = ref(false);

// 缺陷
const bugList = ref<Partial<Bug>[]>([]);
const bugVisible = ref(false);
const bugSaving = ref(false);
const bugForm = reactive({
  title: "",
  status: "新建",
  priority: "次要",
  assignee: "",
  desc: "",
});
const bugErr = reactive({ title: "" });
const bugStatusOptions = [
  { v: "新建", t: "新建" },
  { v: "已指派", t: "已指派" },
  { v: "修复中", t: "修复中" },
  { v: "已解决", t: "已解决" },
  { v: "重新打开", t: "重新打开" },
  { v: "已关闭", t: "已关闭" },
];
const bugPriorityOptions = [
  { v: "阻塞", t: "阻塞" },
  { v: "严重", t: "严重" },
  { v: "主要", t: "主要" },
  { v: "次要", t: "次要" },
  { v: "轻微", t: "轻微" },
];
const userOptions = [
  "张伟",
  "李娜",
  "王强",
  "赵敏",
  "刘洋",
  "陈晨",
  "杨帆",
  "周杰",
  "Administrator",
];

const statusLabelMap: Record<string, string> = {
  NEW: "新建",
  ASSIGNED: "已指派",
  FIXING: "修复中",
  FIXED: "已解决",
  REOPEN: "重新打开",
  CLOSED: "已关闭",
};
type TagType = "primary" | "success" | "warning" | "danger" | "info";
const statusTypeMap: Record<string, TagType> = {
  新建: "info",
  已指派: "primary",
  修复中: "warning",
  已解决: "success",
  重新打开: "danger",
  已关闭: "info",
};
function bugStatusLabel(s: BugStatus) {
  return statusLabelMap[s] ?? s;
}
function bugStatusType(s: BugStatus): TagType {
  return statusTypeMap[bugStatusLabel(s)] ?? "info";
}

const prioLabelMap: Record<string, string> = {
  BLOCKER: "阻塞",
  CRITICAL: "严重",
  MAJOR: "主要",
  MINOR: "次要",
  TRIVIAL: "轻微",
};
const prioTypeMap: Record<string, TagType> = {
  阻塞: "danger",
  严重: "danger",
  主要: "warning",
  次要: "primary",
  轻微: "info",
};
function bugPrioLabel(s: BugSeverity) {
  return prioLabelMap[s] ?? s;
}
function bugPrioType(s: BugSeverity): TagType {
  return prioTypeMap[bugPrioLabel(s)] ?? "info";
}

const resultLabelMap: Record<string, string> = {
  PASS: "成功",
  FAIL: "失败",
  BLOCK: "阻塞",
  SKIP: "跳过",
};
const resultTypeMap: Record<string, TagType> = {
  PASS: "success",
  FAIL: "danger",
  BLOCK: "warning",
  SKIP: "info",
};
function resultLabel(r: ExecuteResult) {
  return resultLabelMap[r] ?? r;
}
function resultType(r: ExecuteResult): TagType {
  return resultTypeMap[r] ?? "info";
}

function goBack() {
  router.push({
    path: `/test-plan/execute/${planId.value}`,
    query: { name: planName.value },
  });
}

async function loadCases() {
  loading.value = true;
  try {
    rows.value = await fetchPlanCases(planId.value);
    initStepForm();
  } finally {
    loading.value = false;
  }
}

async function loadHistory() {
  historyLoading.value = true;
  try {
    historyList.value = await fetchCaseExecuteHistory(
      planId.value,
      caseId.value,
    );
  } catch {
    historyList.value = [];
  } finally {
    historyLoading.value = false;
  }
}

function initStepForm() {
  Object.keys(stepForm).forEach((k) => delete stepForm[k]);
  const c = currentCase.value;
  executeForm.result = c?.result ?? "PASS";
  executeForm.actual = "";
  if (!c) return;
  for (const step of c.steps) {
    stepForm[step.id] = { actual: "", result: "" };
  }
}

async function openCaseEdit() {
  if (!currentCase.value) return;
  caseEditErr.name = "";
  try {
    const detail = await fetchCase(currentCase.value.id);
    caseEditForm.name = detail.name ?? "";
    caseEditForm.testPoint = detail.testPoint ?? "";
    caseEditForm.precondition = detail.precondition ?? "";
    caseEditForm.level = detail.level ?? "P2";
    caseEditForm.status = detail.status ?? "DRAFT";
    caseEditForm.tags = (detail.tags || []).join(",");
    caseEditForm.remark = detail.remark ?? "";
    caseEditForm.attachments = detail.attachments
      ? [...detail.attachments]
      : [];
  } catch {
    caseEditForm.name = currentCase.value.name ?? "";
    caseEditForm.testPoint = currentCase.value.testPoint ?? "";
    caseEditForm.precondition = currentCase.value.precondition ?? "";
    caseEditForm.level = currentCase.value.level ?? "P2";
    caseEditForm.status = currentCase.value.status ?? "DRAFT";
    caseEditForm.tags = (currentCase.value.tags || []).join(",");
    caseEditForm.remark = currentCase.value.remark ?? "";
    caseEditForm.attachments = currentCase.value.attachments
      ? [...currentCase.value.attachments]
      : [];
  }
  caseEditVisible.value = true;
}

async function saveCaseEdit() {
  if (!currentCase.value) return;
  caseEditErr.name = caseEditForm.name.trim() ? "" : "请输入用例名称";
  if (!caseEditForm.name.trim()) return;
  caseEditSaving.value = true;
  try {
    await updateCase(currentCase.value.id, {
      name: caseEditForm.name.trim(),
      testPoint: caseEditForm.testPoint.trim(),
      precondition: caseEditForm.precondition.trim(),
      level: caseEditForm.level,
      status: caseEditForm.status,
      tags: caseEditForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      remark: caseEditForm.remark.trim(),
      attachments: caseEditForm.attachments,
    });
    currentCase.value.name = caseEditForm.name.trim();
    currentCase.value.testPoint = caseEditForm.testPoint.trim();
    currentCase.value.precondition = caseEditForm.precondition.trim();
    currentCase.value.level = caseEditForm.level;
    currentCase.value.status = caseEditForm.status;
    currentCase.value.tags = caseEditForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    currentCase.value.remark = caseEditForm.remark.trim();
    currentCase.value.attachments = [...caseEditForm.attachments];
    ElMessage.success("已保存");
    caseEditVisible.value = false;
  } finally {
    caseEditSaving.value = false;
  }
}

function openBugModal() {
  bugForm.title = "";
  bugForm.status = "新建";
  bugForm.priority = "次要";
  bugForm.assignee = "";
  bugForm.desc = "";
  bugErr.title = "";
  bugVisible.value = true;
}

async function onSaveBug() {
  bugErr.title = bugForm.title.trim() ? "" : "请输入缺陷名称";
  if (!bugForm.title.trim()) return;

  const chineseToEnglish: Record<string, BugStatus> = {
    新建: "NEW",
    已指派: "ASSIGNED",
    修复中: "FIXING",
    已解决: "FIXED",
    重新打开: "REOPEN",
    已关闭: "CLOSED",
  };
  const chineseToSeverity: Record<string, BugSeverity> = {
    阻塞: "BLOCKER",
    严重: "CRITICAL",
    主要: "MAJOR",
    次要: "MINOR",
    轻微: "TRIVIAL",
  };

  bugSaving.value = true;
  try {
    const bug = await createBug({
      title: bugForm.title.trim(),
      status: chineseToEnglish[bugForm.status] ?? "NEW",
      severity: chineseToSeverity[bugForm.priority] ?? "MINOR",
      assignee: bugForm.assignee || "",
      description: bugForm.desc,
      planId: planId.value,
      projectId: "p-1",
    } as Partial<Bug>);
    bugList.value.unshift({
      id: bug.id,
      title: bug.title,
      status: bug.status,
      severity: bug.severity,
    });
    ElMessage.success("缺陷已创建");
    bugVisible.value = false;
  } finally {
    bugSaving.value = false;
  }
}

async function onSubmit() {
  if (!currentCase.value || !executeForm.result) return;
  saving.value = true;
  try {
    const stepResults = currentCase.value.steps.map((s) => ({
      stepId: s.id,
      result: stepForm[s.id]?.result ?? ("" as ExecuteResult | ""),
      actual: stepForm[s.id]?.actual ?? "",
    }));
    const existing = rows.value
      .filter((r) => r.result && r.id !== currentCase.value!.id)
      .map(
        (r) =>
          ({ caseId: r.id, result: r.result!, actual: "" }) as PlanCaseResult,
      );
    await submitCaseResult(planId.value, [
      ...existing,
      {
        caseId: currentCase.value.id,
        result: executeForm.result,
        actual: executeForm.actual,
        stepResults,
      },
    ]);
    currentCase.value.result = executeForm.result;
    const submittedId = currentCase.value.id;
    ElMessage.success("已保存执行结果");
    await loadHistory();

    if (autoNext.value) {
      const idx = rows.value.findIndex((r) => r.id === submittedId);
      if (idx >= 0 && idx < rows.value.length - 1) {
        const next = rows.value[idx + 1];
        await nextTick();
        router.replace({
          path: `/test-plan/case-execute/${planId.value}/${next.id}`,
          query: { name: planName.value },
        });
        initStepForm();
      }
    }
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadCases();
  loadHistory();
});
</script>

<style scoped>
.case-execute-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color-page, #f5f7fa);
}

.ce-header {
  padding: 16px 24px 0;
  background: var(--el-bg-color, #fff);
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  flex-shrink: 0;
}

.breadcrumb {
  font-size: 13px;
  color: var(--text-3, #8c8c8c);
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
  margin-bottom: 16px;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-tag {
  font-weight: 600;
}

.case-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-1, #1f2937);
}

.title-actions {
  display: flex;
  gap: 8px;
}

.ce-tabs {
  padding: 0 24px;
  background: var(--el-bg-color, #fff);
  flex-shrink: 0;
}

:deep(.ce-tabs .el-tabs__header) {
  margin-bottom: 0;
}

.tab-count {
  margin-left: 6px;
  font-size: 11px;
  padding: 0 6px;
  height: 18px;
  line-height: 16px;
}

.ce-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px 24px;
}

.ce-panel {
  background: var(--el-bg-color, #fff);
  border-radius: 10px;
  padding: 20px 24px;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
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
  color: var(--text-1, #1f2937);
  margin-bottom: 12px;
}

.section-content {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-2, #4b5563);
  white-space: pre-wrap;
}

.section-content.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: var(--text-3, #8c8c8c);
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
  color: var(--text-3, #8c8c8c);
}

.info-value {
  font-size: 13px;
  color: var(--text-1, #1f2937);
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
  color: var(--text-3, #8c8c8c);
  font-size: 13px;
  border: 1px dashed var(--el-border-color, #dcdfe6);
  border-radius: 6px;
}

.ce-footer {
  flex-shrink: 0;
  background: var(--el-bg-color, #fff);
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
  padding: 12px 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 12px;
}

.footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
  color: var(--text-2, #4b5563);
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

.result-radio .radio-dot.block {
  color: #d97706;
  border-color: #d97706;
}

.result-radio .radio-dot.fail {
  color: #dc2626;
  border-color: #dc2626;
}

.result-radio.active .radio-dot.pass {
  background: #16a34a;
  color: #fff;
}

.result-radio.active .radio-dot.block {
  background: #d97706;
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

.case-edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.case-edit-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.case-edit-row .el-text {
  font-size: 13px;
  color: var(--text-2, #4b5563);
  align-self: auto;
}

.case-edit-row .el-text em {
  color: #ef4444;
  margin-left: 2px;
}

.case-edit-row .err {
  font-size: 12px;
  color: #ef4444;
}

.case-edit-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.case-edit-upload {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: var(--text-3, #8c8c8c);
  margin-top: 6px;
}

.attachment-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--el-color-primary);
  margin-right: 12px;
  font-size: 13px;
}

.attachment-link:hover {
  text-decoration: underline;
}

.bug-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.bug-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bug-row.bug-full {
  grid-column: 1 / -1;
}

.bug-row .el-text {
  font-size: 13px;
  color: var(--text-2, #4b5563);
  align-self: auto;
}

.bug-row .el-text em {
  color: #ef4444;
  margin-left: 2px;
}

.bug-row .err {
  font-size: 12px;
  color: #ef4444;
}

.bug-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

</style>

<style>
/* class 由 el-dialog 透传到弹窗根节点（teleport 到 body），scoped 选择器匹配不到，需用全局样式 */
.fixed-dialog.el-dialog {
  display: flex;
  flex-direction: column;
  height: 600px;
  overflow: hidden;
}

.fixed-dialog .el-dialog__header {
  flex-shrink: 0;
}

.fixed-dialog .el-dialog__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.fixed-dialog .el-dialog__footer {
  flex-shrink: 0;
}
</style>
