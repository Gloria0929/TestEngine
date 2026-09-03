<template>
  <div class="report" v-loading="loading">
    <div class="header">
      <div class="title">{{ planName }}</div>
      <div class="actions">
        <el-button @click="onExport">导出 HTML</el-button>
        <el-button @click="onExportExcel">导出 Excel</el-button>
        <el-button type="primary" @click="onShare">复制分享链接</el-button>
      </div>
    </div>

    <div class="share-bar">
      <template v-if="report && report.expireAt">分享链接有效期至 {{ report.expireAt }}</template>
      <template v-else>未分享</template>
    </div>

    <div class="stat-grid">
      <el-card shadow="never" class="stat-card">
        <div class="stat-label">进度</div>
        <el-progress :percentage="report?.progress ?? 0" :stroke-width="10" />
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-label">通过率</div>
        <div class="stat-value">{{ report?.passRate ?? 0 }}%</div>
      </el-card>
      <el-card v-for="s in stats" :key="s.label" shadow="never" class="stat-card">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value" :style="{ color: s.color }">{{ s.value }}</div>
      </el-card>
    </div>

    <el-card shadow="never" class="chart-card">
      <div class="section-title">失败分布</div>
      <div ref="chartRef" class="chart"></div>
    </el-card>

    <el-card shadow="never">
      <div class="section-title">执行结果</div>
      <el-table :data="report?.results ?? []">
        <el-table-column prop="caseName" label="用例名称" min-width="220" />
        <el-table-column label="类型" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'manual' ? 'primary' : 'success'" size="small">
              {{ row.type === "manual" ? "手工" : "自动" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="结果" min-width="100">
          <template #default="{ row }">
            <el-tag :type="resultTag(row.result).type" size="small">{{
              resultTag(row.result).label
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="90">
          <template #default="{ row }">
            <el-button v-if="row.result === 'FAIL' || row.result === 'BLOCK'" type="primary" link
              @click="openBugDialog(row)">
              转缺陷
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="bugDialogVisible" title="转缺陷" width="480px">
      <el-form label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="bugTitle" />
        </el-form-item>
        <el-form-item label="严重程度">
          <el-select v-model="bugSeverity" style="width: 100%">
            <el-option v-for="s in severityOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理人">
          <el-input v-model="bugAssignee" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bugDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmitBug">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import * as echarts from "echarts";
import * as XLSX from "xlsx";
import {
  fetchPlanReport,
  exportPlanReport,
  sharePlanReport,
} from "@/api/testPlan";
import { createBug } from "@/api/bug";
import type { PlanReport, ExecuteResult, BugSeverity } from "@/types/models";

type ResultRow = PlanReport["results"][number];

const route = useRoute();
const router = useRouter();
const report = ref<PlanReport | null>(null);
const bugDialogVisible = ref(false);
const currentRow = ref<ResultRow | null>(null);
const bugTitle = ref("");
const bugSeverity = ref<BugSeverity>("MAJOR");
const bugAssignee = ref("");

const severityOptions: Array<{ value: BugSeverity; label: string }> = [
  { value: "BLOCKER", label: "阻塞" },
  { value: "CRITICAL", label: "严重" },
  { value: "MAJOR", label: "主要" },
  { value: "MINOR", label: "次要" },
  { value: "TRIVIAL", label: "轻微" },
];
const loading = ref(false);
const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;

const planId = computed(() => String(route.params.id));
const planName = computed(
  () => String(route.query.name ?? "") || report.value?.name || "",
);

const stats = computed(() => [
  { label: "总数", value: report.value?.total ?? 0, color: "" },
  { label: "通过", value: report.value?.passed ?? 0, color: "#16a34a" },
  { label: "失败", value: report.value?.failed ?? 0, color: "#ef4444" },
  { label: "阻塞", value: report.value?.blocked ?? 0, color: "#f59e0b" },
  { label: "跳过", value: report.value?.skipped ?? 0, color: "#94a3b8" },
]);

function resultTag(r: ExecuteResult) {
  return {
    PASS: { label: "通过", type: "success" },
    FAIL: { label: "失败", type: "danger" },
    BLOCK: { label: "阻塞", type: "warning" },
    SKIP: { label: "跳过", type: "info" },
  }[r] as { label: string; type: "success" | "danger" | "warning" | "info" };
}

function renderChart() {
  if (!chartRef.value) return;
  if (!chart) chart = echarts.init(chartRef.value);
  const data = report.value?.failDistribution ?? [];
  chart.setOption({
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: "category", data: data.map((d) => d.module) },
    yAxis: { type: "value", minInterval: 1 },
    series: [
      {
        name: "失败数",
        type: "bar",
        barMaxWidth: 48,
        data: data.map((d) => d.count),
        itemStyle: { color: "#ef4444" },
      },
    ],
  });
}

async function load() {
  loading.value = true;
  try {
    report.value = await fetchPlanReport(planId.value);
  } finally {
    loading.value = false;
  }
  await nextTick();
  renderChart();
}

async function onExport() {
  const res = await exportPlanReport(planId.value);
  ElMessage.success("已导出：" + res.url);
}

const RESULT_LABEL: Record<ExecuteResult, string> = {
  PASS: "通过",
  FAIL: "失败",
  BLOCK: "阻塞",
  SKIP: "跳过",
};

function onExportExcel() {
  const r = report.value;
  if (!r) return;
  const overview: Array<Array<string | number>> = [
    ["测试计划报告"],
    ["计划名称", planName.value || r.name],
    ["进度", `${r.progress}%`],
    ["通过率", `${r.passRate}%`],
    ["总数", r.total],
    ["通过", r.passed],
    ["失败", r.failed],
    ["阻塞", r.blocked],
    ["跳过", r.skipped],
    ["导出时间", new Date().toLocaleString()],
    [],
    ["失败分布"],
    ["模块", "失败数"],
    ...r.failDistribution.map((d) => [d.module, d.count]),
  ];
  const detail = [
    ["用例ID", "用例名称", "测试点", "优先级", "类型", "结果"],
    ...r.results.map((row) => [
      row.caseId,
      row.caseName,
      row.testPoint,
      row.level,
      row.type === "manual" ? "手工" : "自动",
      RESULT_LABEL[row.result],
    ]),
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overview), "报告概览");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(detail), "执行结果");
  XLSX.writeFile(wb, `测试计划报告-${planName.value || r.name || planId.value}.xlsx`);
  ElMessage.success("Excel 已导出");
}

async function onShare() {
  const res = await sharePlanReport(planId.value);
  if (report.value) {
    report.value.shareUrl = res.shareUrl;
    report.value.expireAt = res.expireAt;
  }
  try {
    await navigator.clipboard.writeText(res.shareUrl);
    ElMessage.success("分享链接已复制");
  } catch {
    ElMessage.error("复制失败，请手动复制：" + res.shareUrl);
  }
}

function openBugDialog(row: ResultRow) {
  currentRow.value = row;
  bugTitle.value = `[${planName.value}] 失败用例：${row.caseName}`;
  bugSeverity.value = "MAJOR";
  bugAssignee.value = "";
  bugDialogVisible.value = true;
}

async function onSubmitBug() {
  if (!currentRow.value) return;
  await createBug({
    projectId: "p-1",
    title: bugTitle.value,
    severity: bugSeverity.value,
    status: "NEW",
    assignee: bugAssignee.value,
    reporter: "Administrator",
    description: "",
    moduleId: "",
  });
  ElMessage.success("已转缺陷");
  bugDialogVisible.value = false;
  router.push("/bug/list");
}

onMounted(load);
onBeforeUnmount(() => chart?.dispose());
</script>

<style scoped>
.report {
  padding: 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
}

.share-bar {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.stat-card {
  text-align: center;
}

.stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
}

.chart-card {
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.chart {
  height: 300px;
}
</style>
