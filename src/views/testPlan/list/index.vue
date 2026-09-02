<template>
  <div class="plan-page">
    <div class="tp">
      <!-- 头部 -->
      <div class="tp-head">
        <div></div>
        <button class="tp-btn tp-btn-pri" @click="openModal(null)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          新建计划
        </button>
      </div>

      <!-- 标签页 -->
      <div class="tp-tabs">
        <button class="tp-tab" :class="{ on: tab === 'plan' }" @click="switchTab('plan')">测试计划</button>
        <button class="tp-tab" :class="{ on: tab === 'report' }" @click="switchTab('report')">报告</button>
      </div>

      <!-- 测试计划面板 -->
      <div v-show="tab === 'plan'">
        <div class="tp-bar">
          <div class="tp-field"><label class="tp-lab">关键词</label><input class="tp-in" style="width:240px" v-model="flt.keyword" placeholder="搜索 ID 或计划名称" @keyup.enter="search" /></div>
          <div class="tp-field"><label class="tp-lab">状态</label><select class="tp-sel" style="width:130px" v-model="flt.status" @change="search"><option value="">全部</option><option v-for="s in STATUSES" :key="s.v" :value="s.v">{{ s.t }}</option></select></div>
          <div class="tp-field"><label class="tp-lab">所属模块</label><select class="tp-sel" style="width:140px" v-model="flt.group" @change="search"><option value="">全部</option><option v-for="m in MODULES" :key="m" :value="m">{{ m }}</option></select></div>
          <div class="tp-spacer" />
          <div class="tp-field"><label class="tp-lab">&nbsp;</label><button class="tp-btn tp-btn-pri" @click="search">查询</button></div>
          <div class="tp-field"><label class="tp-lab">&nbsp;</label><button class="tp-btn" @click="reset">重置</button></div>
        </div>

        <div class="tp-card" :class="{ 'tp-loading': st.loading }" data-card>
          <div class="tp-scroll">
            <div v-if="st.loading && !st.list.length" class="tp-state">加载中…</div>
            <div v-else-if="!st.list.length" class="tp-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>
              <div>暂无符合条件的测试计划</div>
            </div>
            <table v-else class="tp-tb">
              <thead>
                <tr>
                  <th style="width:90px">ID</th>
                  <th style="min-width:200px">测试计划名称</th>
                  <th style="width:100px">状态</th>
                  <th style="width:130px">创建人</th>
                  <th style="width:130px">通过率</th>
                  <th style="width:100px">执行结果</th>
                  <th style="width:110px">所属模块</th>
                  <th style="width:160px">创建时间</th>
                  <th style="width:150px">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in st.list" :key="p.id">
                  <td class="tp-id">{{ p.id }}</td>
                  <td><span class="tp-name" @click="onExecute(p)">{{ p.name }}</span></td>
                  <td>
                    <span class="tp-pill" :class="statusCls(p.status)">
                      <i v-if="p.status === 'RUNNING'" class="tp-dot" />
                      {{ statusLabel(p.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="tp-user">
                      <span class="tp-avatar" :style="{ background: avatarColor(p.owner || '?') }">{{ (p.owner || '?').slice(0, 1) }}</span>
                      <span>{{ p.owner }}</span>
                    </div>
                  </td>
                  <td>
                    <template v-if="p.status === 'DRAFT'">
                      <span style="color:var(--el-text-color-placeholder,#a8abb2)">—</span>
                    </template>
                    <div v-else class="tp-rate" :class="rateClass(p.passRate)">
                      <div class="tp-ratebar"><i :style="{ width: Math.max(0, Math.min(100, p.passRate || 0)) + '%' }" /></div>
                      <span>{{ p.passRate || 0 }}%</span>
                    </div>
                  </td>
                  <td><span class="tp-pill" :class="resultCls((p as any).result)">{{ (p as any).result || '未执行' }}</span></td>
                  <td><span class="tp-mod">{{ p.group }}</span></td>
                  <td class="tp-time">{{ p.createTime }}</td>
                  <td>
                    <div class="tp-ops">
                      <button class="tp-op" @click="onExecute(p)">执行</button>
                      <button class="tp-op" @click="openModal(p)">编辑</button>
                      <button class="tp-op-more" @click.stop="toggleMenu($event, p)" title="更多操作">···</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="tp-foot">
            <div class="tp-total">共 {{ st.total }} 个计划，第 {{ st.pageNum }} / {{ st.pages }} 页</div>
            <div class="tp-pager">
              <span class="tp-size">每页</span>
              <select class="tp-sel" style="width:74px" :value="st.pageSize" @change="onPageSize">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span class="tp-size">条</span>
              <span style="width:8px" />
              <button class="tp-pg" :disabled="st.pageNum <= 1" @click="goPage(st.pageNum - 1)">上一页</button>
              <template v-for="p in pageNumbers" :key="p">
                <button v-if="p === '...'" class="tp-pg" disabled>…</button>
                <button v-else class="tp-pg" :class="{ on: p === st.pageNum }" @click="goPage(p as number)">{{ p }}</button>
              </template>
              <button class="tp-pg" :disabled="st.pageNum >= st.pages" @click="goPage(st.pageNum + 1)">下一页</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 报告面板 -->
      <div v-show="tab === 'report'">
        <div class="tp-card" :class="{ 'tp-loading': rst.loading }">
          <div class="tp-scroll">
            <div v-if="rst.loading && !rst.list.length" class="tp-state">加载中…</div>
            <div v-else-if="!rst.list.length" class="tp-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>
              <div>暂无测试报告</div>
            </div>
            <table v-else class="tp-tb">
              <thead>
                <tr>
                  <th style="min-width:240px">报告名称</th>
                  <th style="width:120px">报告类型</th>
                  <th style="min-width:180px">计划名称</th>
                  <th style="width:100px">执行结果</th>
                  <th style="width:130px">通过率</th>
                  <th style="width:100px">触发方式</th>
                  <th style="width:130px">创建人</th>
                  <th style="width:160px">创建时间</th>
                  <th style="width:80px">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in rst.list" :key="r.id">
                  <td><span class="tp-rname" :title="r.name">{{ r.name }}</span></td>
                  <td><span class="tp-pill" :class="typeCls(r.type)">{{ r.type || '-' }}</span></td>
                  <td><span class="tp-rplan" :title="r.planName">{{ r.planName || '-' }}</span></td>
                  <td><span class="tp-pill" :class="resultCls(r.result)">{{ r.result || '未执行' }}</span></td>
                  <td>
                    <div class="tp-rate" :class="rateClass(r.passRate)">
                      <div class="tp-ratebar"><i :style="{ width: Math.max(0, Math.min(100, r.passRate || 0)) + '%' }" /></div>
                      <span>{{ r.passRate || 0 }}%</span>
                    </div>
                  </td>
                  <td><span class="tp-pill" :class="trgCls(r.trigger)">{{ r.trigger || '-' }}</span></td>
                  <td>
                    <div class="tp-user">
                      <span class="tp-avatar" :style="{ background: avatarColor(r.owner || '?') }">{{ (r.owner || '?').slice(0, 1) }}</span>
                      <span>{{ r.owner }}</span>
                    </div>
                  </td>
                  <td class="tp-time">{{ r.createTime }}</td>
                  <td>
                    <div class="tp-ops">
                      <button class="tp-op tp-op-del" @click="onDeleteReport(r)">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="tp-foot">
            <div class="tp-total">共 {{ rst.total }} 份报告，第 {{ rst.pageNum }} / {{ rst.pages }} 页</div>
            <div class="tp-pager">
              <span class="tp-size">每页</span>
              <select class="tp-sel" style="width:74px" :value="rst.pageSize" @change="onRPageSize">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span class="tp-size">条</span>
              <span style="width:8px" />
              <button class="tp-pg" :disabled="rst.pageNum <= 1" @click="goRPage(rst.pageNum - 1)">上一页</button>
              <template v-for="p in rPageNumbers" :key="p">
                <button v-if="p === '...'" class="tp-pg" disabled>…</button>
                <button v-else class="tp-pg" :class="{ on: p === rst.pageNum }" @click="goRPage(p as number)">{{ p }}</button>
              </template>
              <button class="tp-pg" :disabled="rst.pageNum >= rst.pages" @click="goRPage(rst.pageNum + 1)">下一页</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 更多菜单 -->
    <div v-if="menuVisible" class="tp-menu" :style="menuStyle" @click.stop>
      <button @click="onCopy"><svg class="m-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>复制</button>
      <button @click="onArchive"><svg class="m-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/></svg>归档</button>
      <button @click="onCreateTimer"><svg class="m-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>创建定时任务</button>
      <button class="danger" @click="onDelete"><svg class="m-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>删除</button>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="modalVisible" class="tp-mask" @click.self="modalVisible = false">
      <div class="tp-modal">
        <h3>{{ editingId ? '编辑测试计划' : '新建测试计划' }}</h3>
        <div class="tp-form">
          <div class="tp-row"><label>计划名称<em>*</em></label><input v-model="form.name" maxlength="60" placeholder="请输入计划名称" /><div v-if="err.name" class="err">{{ err.name }}</div></div>
          <div class="tp-row"><label>所属模块</label><select v-model="form.group"><option v-for="m in MODULES" :key="m" :value="m">{{ m }}</option></select></div>
          <div class="tp-row"><label>创建人<em>*</em></label><input v-model="form.owner" maxlength="20" placeholder="请输入创建人" /><div v-if="err.owner" class="err">{{ err.owner }}</div></div>
          <div class="tp-row"><label>开始时间</label><input v-model="form.startTime" placeholder="如 2026-09-01" /></div>
          <div class="tp-row"><label>结束时间</label><input v-model="form.endTime" placeholder="如 2026-09-08" /></div>
          <div class="tp-row"><label>状态</label><select v-model="form.status"><option v-for="s in STATUSES" :key="s.v" :value="s.v">{{ s.t }}</option></select></div>
        </div>
        <div class="tp-modal-foot">
          <button class="tp-btn" @click="modalVisible = false">取消</button>
          <button class="tp-btn tp-btn-pri" :disabled="saving" @click="saveModal">{{ saving ? '保存中…' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { fetchPlans, createPlan, updatePlan, deletePlan, copyPlan } from "@/api/testPlan";
import { rptList, rptDel } from "@/api/testPlan";
import type { TestPlan } from "@/types/models";

const router = useRouter();

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

// 标签页
const tab = ref("plan");
const reportLoaded = ref(false);
function switchTab(t: string) {
  tab.value = t;
  if (t === "report" && !reportLoaded.value) {
    reportLoaded.value = true;
    loadReports();
  }
}

// 计划列表状态
const st = reactive({ pageNum: 1, pageSize: 10, total: 0, list: [] as any[], loading: false, pages: 1 });
const flt = reactive({ keyword: "", status: "", group: "" });

// 报告列表状态
const rst = reactive({ pageNum: 1, pageSize: 10, total: 0, list: [] as any[], loading: false, pages: 1 });

function pageNums(cur: number, tot: number) {
  const list: (number | string)[] = [];
  for (let i = 1; i <= tot; i++) {
    if (i === 1 || i === tot || Math.abs(i - cur) <= 1) list.push(i);
    else if (list[list.length - 1] !== "...") list.push("...");
  }
  return list;
}
const pageNumbers = computed(() => pageNums(st.pageNum, st.pages));
const rPageNumbers = computed(() => pageNums(rst.pageNum, rst.pages));

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
function goPage(p: number) { if (p >= 1 && p <= st.pages && p !== st.pageNum) { st.pageNum = p; load(); } }
function onPageSize(e: Event) { st.pageSize = parseInt((e.target as HTMLSelectElement).value, 10) || 10; st.pageNum = 1; load(); }
function goRPage(p: number) { if (p >= 1 && p <= rst.pages && p !== rst.pageNum) { rst.pageNum = p; loadReports(); } }
function onRPageSize(e: Event) { rst.pageSize = parseInt((e.target as HTMLSelectElement).value, 10) || 10; rst.pageNum = 1; loadReports(); }

function onExecute(row: TestPlan) {
  router.push({ path: "/test-plan/execute/" + row.id, query: { name: row.name } });
}

// 更多菜单
const menuVisible = ref(false);
const menuStyle = ref({ top: "0px", left: "0px" });
let menuPlan: any = null;

function toggleMenu(e: MouseEvent, plan: any) {
  if (menuVisible.value && menuPlan?.id === plan.id) { menuVisible.value = false; return; }
  menuPlan = plan;
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  const mw = 150, mh = 4 * 32 + 10;
  let top = rect.bottom + 4, left = rect.right - mw;
  if (top + mh > window.innerHeight) top = Math.max(8, rect.top - mh - 4);
  if (left < 8) left = 8;
  menuStyle.value = { top: top + "px", left: left + "px" };
  menuVisible.value = true;
}

function closeMenu() { menuVisible.value = false; menuPlan = null; }

async function onCopy() {
  closeMenu();
  if (!menuPlan) return;
  await copyPlan(menuPlan.id);
  ElMessage.success("已复制");
  load();
}

async function onArchive() {
  closeMenu();
  if (!menuPlan) return;
  await updatePlan(menuPlan.id, { archived: true } as any);
  ElMessage.success("已归档");
  load();
}

function onCreateTimer() {
  closeMenu();
  ElMessage.success("已创建定时任务：每日 02:00 自动执行");
}

async function onDelete() {
  closeMenu();
  if (!menuPlan) return;
  try {
    await ElMessageBox.confirm(`确认删除「${menuPlan.name}」？删除后可在回收站恢复`, "确认", { type: "warning" });
    await deletePlan(menuPlan.id);
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

function onDocClick(e: MouseEvent) {
  if (menuVisible.value) {
    const menu = document.querySelector(".tp-menu");
    if (menu && !menu.contains(e.target as Node)) closeMenu();
  }
}

onMounted(() => {
  document.addEventListener("mousedown", onDocClick);
  load();
});
onUnmounted(() => {
  document.removeEventListener("mousedown", onDocClick);
});
</script>

<style>
.tp {
  max-width: 1280px;
}
.tp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.tp-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-regular, #606266);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}
.tp-btn:hover {
  color: var(--el-color-primary, #409eff);
  border-color: var(--el-color-primary, #409eff);
}
.tp-btn-pri {
  background: var(--el-color-primary, #409eff);
  border-color: var(--el-color-primary, #409eff);
  color: #fff;
}
.tp-btn-pri:hover {
  background: var(--el-color-primary-light-3, #79bbff);
  border-color: var(--el-color-primary-light-3, #79bbff);
  color: #fff;
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
}
.tp-in, .tp-sel {
  height: 32px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-primary, #303133);
  font-size: 13px;
  font-family: inherit;
  padding: 0 10px;
  outline: none;
  transition: border-color 0.18s ease;
}
.tp-in:focus, .tp-sel:focus {
  border-color: var(--el-color-primary, #409eff);
}
.tp-in::placeholder {
  color: var(--el-text-color-placeholder, #a8abb2);
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
.tp-tb {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.tp-tb th {
  text-align: left;
  font-weight: 500;
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  background: var(--el-fill-color-lighter, #f5f7fa);
  padding: 10px 14px;
  white-space: nowrap;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}
.tp-tb td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  color: var(--el-text-color-regular, #606266);
  vertical-align: middle;
  white-space: nowrap;
}
.tp-tb tbody tr {
  transition: background 0.15s ease;
}
.tp-tb tbody tr:hover {
  background: var(--el-fill-color-light, #f5f7fa);
}
.tp-tb tbody tr:last-child td {
  border-bottom: none;
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.rs-pass { background: #e8f7ee; color: #18a058; }
.rs-part { background: #fdf3e7; color: #d67f1b; }
.rs-fail { background: #fdecec; color: #d93838; }
.rs-none { background: var(--el-fill-color, #f0f2f5); color: var(--el-text-color-secondary, #909399); }
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
.rt-hi i { background: #18a058; }
.rt-mid i { background: #d67f1b; }
.rt-low i { background: #d93838; }
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
.tp-op {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  color: var(--el-color-primary, #409eff);
}
.tp-op:hover {
  opacity: 0.75;
}
.tp-op-more {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: none;
  background: none;
  color: var(--el-text-color-secondary, #909399);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  font-family: inherit;
}
.tp-op-more:hover {
  background: var(--el-fill-color, #f0f2f5);
  color: var(--el-text-color-primary, #303133);
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
.tp-pager {
  display: flex;
  align-items: center;
  gap: 6px;
}
.tp-pg {
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-regular, #606266);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.18s ease;
}
.tp-pg:hover:not(:disabled) {
  color: var(--el-color-primary, #409eff);
  border-color: var(--el-color-primary, #409eff);
}
.tp-pg:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.tp-pg.on {
  background: var(--el-color-primary, #409eff);
  border-color: var(--el-color-primary, #409eff);
  color: #fff;
}
.tp-size {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
}
.tp-menu {
  position: fixed;
  z-index: 2000;
  min-width: 140px;
  background: var(--el-bg-color, #fff);
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 5px;
  animation: tp-pop 0.12s ease;
}
@keyframes tp-pop {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: none; }
}
.tp-menu button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: none;
  background: none;
  color: var(--el-text-color-regular, #606266);
  font-size: 13px;
  font-family: inherit;
  border-radius: 5px;
  cursor: pointer;
  text-align: left;
}
.tp-menu button:hover {
  background: var(--el-fill-color-light, #f5f7fa);
}
.tp-menu button.danger {
  color: var(--el-color-danger, #f56c6c);
}
.tp-menu button.danger:hover {
  background: #fdecec;
}
.tp-menu .m-ico {
  width: 14px;
  height: 14px;
  flex: none;
  opacity: 0.75;
}
.tp-mask {
  position: fixed;
  inset: 0;
  z-index: 1900;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: tp-fade 0.16s ease;
}
@keyframes tp-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
.tp-modal {
  width: 520px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 64px);
  overflow: auto;
  background: var(--el-bg-color, #fff);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
  padding: 22px 24px;
}
.tp-modal h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
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
.tp-row label {
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
}
.tp-row label em {
  color: var(--el-color-danger, #f56c6c);
  font-style: normal;
  margin-left: 2px;
}
.tp-row input, .tp-row select {
  height: 34px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-primary, #303133);
  font-size: 13px;
  font-family: inherit;
  padding: 0 10px;
  outline: none;
  width: 100%;
  transition: border-color 0.18s ease;
}
.tp-row input:focus, .tp-row select:focus {
  border-color: var(--el-color-primary, #409eff);
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
.tp-tabs {
  display: flex;
  gap: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  margin-bottom: 16px;
}
.tp-tab {
  height: 38px;
  padding: 0 4px;
  margin-bottom: -1px;
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  font-size: 14px;
  font-family: inherit;
  color: var(--el-text-color-regular, #606266);
  cursor: pointer;
  transition: color 0.18s ease;
}
.tp-tab:hover {
  color: var(--el-color-primary, #409eff);
}
.tp-tab.on {
  color: var(--el-color-primary, #409eff);
  border-bottom-color: var(--el-color-primary, #409eff);
  font-weight: 600;
}
.tp-rname {
  font-weight: 500;
  color: var(--el-text-color-primary, #303133);
}
.tp-rplan {
  color: var(--el-text-color-regular, #606266);
}
.ty-plan { background: #e8f3ff; color: #1d7afb; }
.ty-api { background: #f0ebff; color: #7c3aed; }
.ty-task { background: #e6f7f1; color: #0e9f6e; }
.trg-manual { background: var(--el-fill-color, #f0f2f5); color: var(--el-text-color-regular, #606266); }
.trg-timer { background: #fdf3e7; color: #d67f1b; }
.trg-api { background: #e0f2fe; color: #0284c7; }
.tp-op-del {
  color: var(--el-color-danger, #f56c6c);
}
.tp-op-del:hover {
  opacity: 0.75;
}
@media (max-width: 720px) {
  .tp-head {
    flex-direction: column;
  }
}
</style>