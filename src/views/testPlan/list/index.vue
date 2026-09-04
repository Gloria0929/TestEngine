<template>
  <div class="plan-page">
    <div class="tp">
      <!-- 头部 -->
      <div class="tp-head">
        <div></div>
        <el-button v-if="!isReport" type="primary" @click="openModal(null)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          新建计划
        </el-button>
      </div>

      <template v-if="!isReport">
        <div class="tp-bar">
          <div class="tp-field"><el-text class="tp-lab">关键词</el-text>
            <el-input style="width:240px" v-model="flt.keyword" placeholder="搜索 ID 或计划名称" @keyup.enter="search" />
          </div>
          <div class="tp-field"><el-text class="tp-lab">状态</el-text>
            <el-select style="width:130px" v-model="flt.status" @change="search">
              <el-option label="全部" value="" />
              <el-option v-for="s in STATUSES" :key="s.v" :label="s.t" :value="s.v" />
            </el-select>
          </div>
          <div class="tp-field"><el-text class="tp-lab">所属模块</el-text>
            <el-select style="width:140px" v-model="flt.group" @change="search">
              <el-option label="全部" value="" />
              <el-option v-for="m in MODULES" :key="m" :label="m" :value="m" />
            </el-select>
          </div>
          <div class="tp-spacer" />
          <div class="tp-field"><el-text class="tp-lab">&nbsp;</el-text>
            <el-button type="primary" @click="search">查询</el-button>
          </div>
          <div class="tp-field"><el-text class="tp-lab">&nbsp;</el-text>
            <el-button @click="reset">重置</el-button>
          </div>
        </div>

        <div class="tp-card" :class="{ 'tp-loading': st.loading }" data-card>
          <div class="tp-scroll">
            <div v-if="st.loading && !st.list.length" class="tp-state">加载中…</div>
            <div v-else-if="!st.list.length" class="tp-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M8 2v4M16 2v4M3 10h18" />
              </svg>
              <div>暂无符合条件的测试计划</div>
            </div>
            <el-table v-else :data="st.list" style="width:100%">
              <el-table-column label="ID" min-width="180">
                <template #default="{ row }">
                  <span class="tp-id">{{ row.id }}</span>
                </template>
              </el-table-column>
              <el-table-column label="测试计划名称" min-width="180">
                <template #default="{ row }">
                  <span class="tp-name" @click="onExecute(row)">{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" min-width="100">
                <template #default="{ row }">
                  <span class="tp-pill" :class="statusCls(row.status)">
                    <i v-if="row.status === 'RUNNING'" class="tp-dot" />
                    {{ statusLabel(row.status) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="创建人" min-width="180">
                <template #default="{ row }">
                  <div class="tp-user">
                    <span class="tp-avatar" :style="{ background: avatarColor(row.owner || '?') }">{{ (row.owner ||
                      '?').slice(0, 1) }}</span>
                    <span>{{ row.owner }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="通过率" min-width="220">
                <template #default="{ row }">
                  <template v-if="row.status === 'DRAFT'">
                    <span style="color:var(--el-text-color-placeholder,#a8abb2)">—</span>
                  </template>
                  <div v-else class="tp-rate" :class="rateClass(row.passRate)">
                    <div class="tp-ratebar"><i
                        :style="{ width: Math.max(0, Math.min(100, row.passRate || 0)) + '%' }" /></div>
                    <span>{{ row.passRate || 0 }}%</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="执行结果" min-width="120">
                <template #default="{ row }">
                  <span class="tp-pill" :class="resultCls((row as any).result)">{{ (row as any).result || '未执行'
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column label="所属模块" min-width="110">
                <template #default="{ row }">
                  <span class="tp-mod">{{ row.group }}</span>
                </template>
              </el-table-column>
              <el-table-column label="创建时间" min-width="220">
                <template #default="{ row }">
                  <span class="tp-time">{{ row.createTime }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="180">
                <template #default="{ row }">
                  <div class="tp-ops">
                    <el-button type="success" link @click="onExecute(row)">执行</el-button>
                    <el-button type="primary" link @click="openModal(row)">编辑</el-button>
                    <el-dropdown @command="handleCommand($event, row)">
                      <el-button link class="tp-more">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <circle cx="5" cy="12" r="1.6" />
                          <circle cx="12" cy="12" r="1.6" />
                          <circle cx="19" cy="12" r="1.6" />
                        </svg>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="copy">
                            <svg class="m-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                              stroke-linecap="round" stroke-linejoin="round">
                              <rect x="9" y="9" width="12" height="12" rx="2" />
                              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                            </svg>复制
                          </el-dropdown-item>
                          <el-dropdown-item command="timer">
                            <svg class="m-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                              stroke-linecap="round" stroke-linejoin="round">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M12 7v5l3 3" />
                            </svg>创建定时任务
                          </el-dropdown-item>
                          <el-dropdown-item command="delete">
                            <svg class="m-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                              stroke-linecap="round" stroke-linejoin="round">
                              <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                            </svg>删除
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="tp-foot">
            <div class="tp-total">共 {{ st.total }} 个计划，第 {{ st.pageNum }} / {{ st.pages }} 页</div>
            <el-pagination v-model:current-page="st.pageNum" v-model:page-size="st.pageSize" :total="st.total"
              :page-sizes="[10, 20, 50]" layout="sizes, prev, pager, next" @current-change="goPage"
              @size-change="onPageSize" />
          </div>
        </div>
      </template>

      <template v-else>
        <div class="tp-card" :class="{ 'tp-loading': rst.loading }">
          <div class="tp-scroll">
            <div v-if="rst.loading && !rst.list.length" class="tp-state">加载中…</div>
            <div v-else-if="!rst.list.length" class="tp-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M8 7h8M8 11h8M8 15h5" />
              </svg>
              <div>暂无测试报告</div>
            </div>
            <el-table v-else :data="rst.list" style="width:100%">
              <el-table-column label="报告名称" min-width="240">
                <template #default="{ row }">
                  <span class="tp-rname" :title="row.name">{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="报告类型" min-width="120">
                <template #default="{ row }">
                  <span class="tp-pill" :class="typeCls(row.type)">{{ row.type || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="计划名称" min-width="180">
                <template #default="{ row }">
                  <span class="tp-rplan" :title="row.planName">{{ row.planName || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="执行结果" min-width="100">
                <template #default="{ row }">
                  <span class="tp-pill" :class="resultCls(row.result)">{{ row.result || '未执行' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="通过率" min-width="130">
                <template #default="{ row }">
                  <div class="tp-rate" :class="rateClass(row.passRate)">
                    <div class="tp-ratebar"><i
                        :style="{ width: Math.max(0, Math.min(100, row.passRate || 0)) + '%' }" />
                    </div>
                    <span>{{ row.passRate || 0 }}%</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="触发方式" min-width="140">
                <template #default="{ row }">
                  <span class="tp-pill" :class="trgCls(row.trigger)">{{ row.trigger || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="创建人" min-width="150">
                <template #default="{ row }">
                  <div class="tp-user">
                    <span class="tp-avatar" :style="{ background: avatarColor(row.owner || '?') }">{{ (row.owner ||
                      '?').slice(0, 1) }}</span>
                    <span>{{ row.owner }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="创建时间" min-width="160">
                <template #default="{ row }">
                  <span class="tp-time">{{ row.createTime }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="110">
                <template #default="{ row }">
                  <div class="tp-ops">
                    <el-button type="primary" link @click="onExportReport(row)">导出</el-button>
                    <el-button type="danger" link @click="onDeleteReport(row)">删除</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="tp-foot">
            <div class="tp-total">共 {{ rst.total }} 份报告，第 {{ rst.pageNum }} / {{ rst.pages }} 页</div>
            <el-pagination v-model:current-page="rst.pageNum" v-model:page-size="rst.pageSize" :total="rst.total"
              :page-sizes="[10, 20, 50]" layout="sizes, prev, pager, next" @current-change="goRPage"
              @size-change="onRPageSize" />
          </div>
        </div>
      </template>
      <!-- 编辑弹窗 -->
      <el-dialog v-model="modalVisible" width="520px" :close-on-click-modal="false">
        <template #header>
          <h3>{{ editingId ? '编辑测试计划' : '新建测试计划' }}</h3>
        </template>
        <div class="tp-form">
          <div class="tp-row"><el-text>计划名称<em>*</em></el-text>
            <el-input v-model="form.name" maxlength="60" placeholder="请输入计划名称" style="width:100%" />
            <div v-if="err.name" class="err">{{ err.name }}</div>
          </div>
          <div class="tp-row"><el-text>所属模块</el-text>
            <el-select v-model="form.group" style="width:100%">
              <el-option v-for="m in MODULES" :key="m" :label="m" :value="m" />
            </el-select>
          </div>
          <div class="tp-row"><el-text>创建人<em>*</em></el-text>
            <el-input v-model="form.owner" maxlength="20" placeholder="请输入创建人" style="width:100%" />
            <div v-if="err.owner" class="err">{{ err.owner }}</div>
          </div>
          <div class="tp-row"><el-text>开始时间</el-text>
            <el-date-picker v-model="form.startTime" type="date" value-format="YYYY-MM-DD" placeholder="选择开始日期"
              style="width:100%" />
          </div>
          <div class="tp-row"><el-text>结束时间</el-text>
            <el-date-picker v-model="form.endTime" type="date" value-format="YYYY-MM-DD" placeholder="选择结束日期"
              style="width:100%" />
          </div>
          <div class="tp-row"><el-text>状态</el-text>
            <el-select v-model="form.status" style="width:100%">
              <el-option v-for="s in STATUSES" :key="s.v" :label="s.t" :value="s.v" />
            </el-select>
          </div>
        </div>
        <template #footer>
          <div class="tp-modal-foot">
            <el-button @click="modalVisible = false">取消</el-button>
            <el-button type="primary" :disabled="saving" @click="saveModal">{{ saving ? '保存中…' : '保存'
              }}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import * as XLSX from "xlsx";
import { fetchPlans, createPlan, updatePlan, deletePlan, copyPlan } from "@/api/testPlan";
import { rptList, rptDel } from "@/api/testPlan";
import type { TestPlan } from "@/types/models";

const router = useRouter();
const route = useRoute();

// 常量
const STATUSES = [{ v: "DRAFT", t: "未开始" }, { v: "RUNNING", t: "进行中" }, { v: "DONE", t: "已完成" }];
const STATUS_CLS: Record<string, string> = { DRAFT: "st-draft", RUNNING: "st-run", DONE: "st-done" };
function statusLabel(s: string) { return STATUSES.find(x => x.v === s)?.t ?? "未开始"; }
function statusCls(s: string) { return STATUS_CLS[s] || "st-draft"; }

const MODULES = ["订单中心", "支付中台", "用户中心", "商品模块", "营销活动", "权限中心"];
const RESULT_CLS: Record<string, string> = { "通过": "rs-pass", "部分通过": "rs-part", "失败": "rs-fail", "未执行": "rs-none" };
function resultCls(r: string) { return RESULT_CLS[r] || "rs-none"; }

const TYPE_CLS: Record<string, string> = { "测试计划报告": "ty-plan", "接口测试报告": "ty-api", "任务报告": "ty-task" };
function typeCls(t: string) { return TYPE_CLS[t] || "rs-none"; }

const TRG_CLS: Record<string, string> = { "手动执行": "trg-manual", "定时任务": "trg-timer", "API 触发": "trg-api" };
function trgCls(t: string) { return TRG_CLS[t] || "rs-none"; }

function rateClass(v: number) {
  const n = Math.max(0, Math.min(100, v || 0));
  return n >= 80 ? "rt-hi" : n >= 60 ? "rt-mid" : "rt-low";
}

const AVATAR_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#6366f1", "#ec4899"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// 按路由区分：/test-plan/list 计划列表，/test-plan/reports 测试报告
const isReport = computed(() => route.path.endsWith("/reports"));
const reportLoaded = ref(false);
// 通过二级菜单切换时按需加载报告数据
watch(isReport, (v) => {
  if (v && !reportLoaded.value) {
    reportLoaded.value = true;
    loadReports();
  }
});

// 计划列表状态
const st = reactive({ pageNum: 1, pageSize: 10, total: 0, list: [] as any[], loading: false, pages: 1 });
const flt = reactive({ keyword: "", status: "", group: "" });

// 报告列表状态
const rst = reactive({ pageNum: 1, pageSize: 10, total: 0, list: [] as any[], loading: false, pages: 1 });

async function load() {
  st.loading = true;
  try {
    const res = await fetchPlans({
      pageNum: st.pageNum, pageSize: st.pageSize,
      keyword: flt.keyword || undefined, status: flt.status || undefined,
      group: flt.group || undefined,
    } as any);
    st.list = (res as any).list ?? [];
    st.total = (res as any).total ?? 0;
    st.pages = Math.max(1, Math.ceil(st.total / st.pageSize));
  } catch { st.list = []; st.total = 0; st.pages = 1; }
  finally { st.loading = false; }
}

async function loadReports() {
  rst.loading = true;
  try {
    const res = await rptList({ pageNum: rst.pageNum, pageSize: rst.pageSize }) as any;
    rst.list = res?.list ?? [];
    rst.total = res?.total ?? 0;
    rst.pages = Math.max(1, Math.ceil(rst.total / rst.pageSize));
  } catch { rst.list = []; rst.total = 0; rst.pages = 1; }
  finally { rst.loading = false; }
}

function search() { st.pageNum = 1; load(); }
function reset() {
  flt.keyword = ""; flt.status = ""; flt.group = "";
  st.pageNum = 1; st.pageSize = 10; load();
}
function goPage(p: number) { if (p >= 1 && p <= st.pages) { st.pageNum = p; load(); } }
function onPageSize(size: number) { st.pageSize = size; st.pageNum = 1; load(); }
function goRPage(p: number) { if (p >= 1 && p <= rst.pages) { rst.pageNum = p; loadReports(); } }
function onRPageSize(size: number) { rst.pageSize = size; rst.pageNum = 1; loadReports(); }

function onExecute(row: TestPlan) {
  router.push({ path: "/test-plan/execute/" + row.id, query: { name: row.name } });
}

// 更多菜单
function handleCommand(cmd: string, plan: any) {
  if (cmd === "copy") onCopy(plan);
  else if (cmd === "timer") onCreateTimer();
  else if (cmd === "delete") onDelete(plan);
}

async function onCopy(plan: any) {
  await copyPlan(plan.id);
  ElMessage.success("已复制");
  load();
}

function onCreateTimer() {
  ElMessage.success("已创建定时任务：每日 02:00 自动执行");
}

async function onDelete(plan: any) {
  try {
    await ElMessageBox.confirm(`确认删除「${plan.name}」？删除后可在回收站恢复`, "确认", { type: "warning" });
    await deletePlan(plan.id);
    ElMessage.success("已删除");
    load();
  } catch { /* 取消 */ }
}

async function onDeleteReport(r: any) {
  try {
    await ElMessageBox.confirm(`确认删除报告「${r.name}」？删除后不可恢复`, "删除报告", { type: "warning" });
    await rptDel(r.id);
    ElMessage.success("已删除");
    loadReports();
  } catch { /* 取消 */ }
}

function onExportReport(r: any) {
  const rows: Array<Array<string | number>> = [
    ["测试报告"],
    ["报告名称", r.name ?? "-"],
    ["报告类型", r.type ?? "-"],
    ["计划名称", r.planName ?? "-"],
    ["执行结果", r.result ?? "未执行"],
    ["通过率", `${r.passRate ?? 0}%`],
    ["触发方式", r.trigger ?? "-"],
    ["创建人", r.owner ?? "-"],
    ["创建时间", r.createTime ?? "-"],
    ["导出时间", new Date().toLocaleString()],
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "报告摘要");
  XLSX.writeFile(wb, `测试报告-${r.name ?? r.id}.xlsx`);
  ElMessage.success("已导出");
}

// 弹窗
const modalVisible = ref(false);
const editingId = ref("");
const saving = ref(false);
const form = reactive({ name: "", group: MODULES[0], owner: "", startTime: "", endTime: "", status: "DRAFT" });
const err = reactive({ name: "", owner: "" });

function openModal(plan: any) {
  if (plan) {
    editingId.value = plan.id;
    form.name = plan.name;
    form.group = plan.group || MODULES[0];
    form.owner = plan.owner || "";
    form.startTime = plan.startTime || "";
    form.endTime = plan.endTime || "";
    form.status = plan.status || "DRAFT";
  } else {
    editingId.value = "";
    form.name = "";
    form.group = MODULES[0];
    form.owner = "";
    form.startTime = "";
    form.endTime = "";
    form.status = "DRAFT";
  }
  err.name = ""; err.owner = "";
  modalVisible.value = true;
}

async function saveModal() {
  err.name = form.name.trim() ? "" : "请输入计划名称";
  err.owner = form.owner.trim() ? "" : "请输入创建人";
  if (!form.name.trim() || !form.owner.trim()) return;
  saving.value = true;
  try {
    if (editingId.value) {
      await updatePlan(editingId.value, { ...form } as any);
    } else {
      await createPlan({ ...form } as any);
    }
    ElMessage.success(editingId.value ? "已保存" : "已创建");
    modalVisible.value = false;
    load();
  } finally { saving.value = false; }
}

onMounted(() => {
  if (isReport.value) {
    reportLoaded.value = true;
    loadReports();
  } else {
    load();
  }
});
</script>

<style scoped>
.tp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.tp-bar {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  margin-bottom: 14px;
}

.tp-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tp-lab {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  line-height: 1.4;
  align-self: auto;
}

.tp-spacer {
  flex: 1;
}

.tp-card {
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  overflow: hidden;
}

.tp-loading {
  opacity: 0.5;
  pointer-events: none;
}

.tp-scroll {
  overflow-x: auto;
}

.tp-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
}

.tp-name {
  color: var(--el-color-primary, #409eff);
  cursor: pointer;
  font-weight: 500;
}

.tp-name:hover {
  text-decoration: underline;
}

.tp-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1;
}

.tp-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex: none;
}

.st-draft {
  background: var(--el-fill-color, #f0f2f5);
  color: var(--el-text-color-regular, #606266);
}

.st-run {
  background: #e8f3ff;
  color: #1d7afb;
}

.st-run .tp-dot {
  background: #1d7afb;
  animation: tp-pulse 1.6s infinite;
}

.st-done {
  background: #e8f7ee;
  color: #18a058;
}

@keyframes tp-pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

.rs-pass {
  background: #e8f7ee;
  color: #18a058;
}

.rs-part {
  background: #fdf3e7;
  color: #d67f1b;
}

.rs-fail {
  background: #fdecec;
  color: #d93838;
}

.rs-none {
  background: var(--el-fill-color, #f0f2f5);
  color: var(--el-text-color-secondary, #909399);
}

.tp-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tp-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.tp-rate {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tp-ratebar {
  width: 64px;
  height: 5px;
  border-radius: 3px;
  background: var(--el-fill-color-dark, #e5e7eb);
  overflow: hidden;
  flex: none;
}

.tp-ratebar i {
  display: block;
  height: 100%;
  border-radius: 3px;
}

.rt-hi i {
  background: #18a058;
}

.rt-mid i {
  background: #d67f1b;
}

.rt-low i {
  background: #d93838;
}

.tp-rate span {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--el-text-color-regular, #606266);
}

.tp-time {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
}

.tp-mod {
  display: inline-flex;
  height: 22px;
  align-items: center;
  padding: 0 8px;
  border-radius: 5px;
  background: var(--el-fill-color, #f0f2f5);
  color: var(--el-text-color-regular, #606266);
  font-size: 12px;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.tp-ops {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tp-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  color: var(--el-text-color-regular, #606266);
}

.tp-more:hover {
  color: var(--el-color-primary, #409eff);
}

.m-ico {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  flex: none;
  vertical-align: middle;
}

.tp-state {
  padding: 52px 16px;
  text-align: center;
  color: var(--el-text-color-secondary, #909399);
  font-size: 13.5px;
}

.tp-state svg {
  width: 34px;
  height: 34px;
  margin-bottom: 10px;
  color: var(--el-border-color, #dcdfe6);
}

.tp-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
  flex-wrap: wrap;
}

.tp-total {
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
}

.tp-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tp-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tp-row .el-text {
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  align-self: auto;
}

.tp-row .el-text em {
  color: var(--el-color-danger, #f56c6c);
  font-style: normal;
  margin-left: 2px;
}

.tp-row .err {
  font-size: 12px;
  color: var(--el-color-danger, #f56c6c);
}

.tp-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.tp-rname {
  font-weight: 500;
  color: var(--el-text-color-primary, #303133);
}

.tp-rplan {
  color: var(--el-text-color-regular, #606266);
}

.ty-plan {
  background: #e8f3ff;
  color: #1d7afb;
}

.ty-api {
  background: #f0ebff;
  color: #7c3aed;
}

.ty-task {
  background: #e6f7f1;
  color: #0e9f6e;
}

.trg-manual {
  background: var(--el-fill-color, #f0f2f5);
  color: var(--el-text-color-regular, #606266);
}

.trg-timer {
  background: #fdf3e7;
  color: #d67f1b;
}

.trg-api {
  background: #e0f2fe;
  color: #0284c7;
}

@media (max-width: 720px) {
  .tp-head {
    flex-direction: column;
  }
}
</style>
