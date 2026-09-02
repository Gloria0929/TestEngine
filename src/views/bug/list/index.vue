<template>
  <div class="bug-page">
    <div class="bg">
      <!-- 头部 -->
      <div class="bg-head">
        <div></div>
        <button class="bg-btn bg-btn-pri" @click="openModal(null)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          新建缺陷
        </button>
      </div>

      <!-- 筛选栏 -->
      <div class="bg-bar">
        <div class="bg-field">
          <label class="bg-lab">关键词</label>
          <input class="bg-in" style="width:220px" v-model="flt.keyword" placeholder="搜索 ID 或缺陷名称" @keyup.enter="search" />
        </div>
        <div class="bg-field">
          <label class="bg-lab">状态</label>
          <select class="bg-sel" style="width:110px" v-model="flt.status" @change="search">
            <option value="">全部</option>
            <option v-for="s in statusOptions" :key="s.v" :value="s.v">{{ s.t }}</option>
          </select>
        </div>
        <div class="bg-field">
          <label class="bg-lab">优先级</label>
          <select class="bg-sel" style="width:110px" v-model="flt.priority" @change="search">
            <option value="">全部</option>
            <option v-for="p in priorityOptions" :key="p.v" :value="p.v">{{ p.t }}</option>
          </select>
        </div>
        <div class="bg-spacer" />
        <div class="bg-field">
          <label class="bg-lab">&nbsp;</label>
          <button class="bg-btn bg-btn-pri" @click="search">查询</button>
        </div>
        <div class="bg-field">
          <label class="bg-lab">&nbsp;</label>
          <button class="bg-btn" @click="reset">重置</button>
        </div>
      </div>

      <!-- 表格卡片 -->
      <div class="bg-card" :class="{ 'bg-loading': st.loading }">
        <div class="bg-scroll">
          <!-- 加载中 / 空状态 -->
          <div v-if="st.loading && !st.list.length" class="bg-state">加载中…</div>
          <div v-else-if="!st.list.length" class="bg-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
            <div>暂无符合条件的缺陷</div>
          </div>
          <!-- 数据表格 -->
          <table v-else class="bg-tb">
            <thead>
              <tr>
                <th style="width:110px">ID</th>
                <th style="min-width:240px">缺陷名称</th>
                <th style="width:100px">状态</th>
                <th style="width:130px">受理人</th>
                <th style="width:90px">用例数</th>
                <th style="width:130px">创建人</th>
                <th style="width:160px">创建时间</th>
                <th style="width:130px">更新人</th>
                <th style="width:160px">更新时间</th>
                <th style="width:100px">优先级</th>
                <th style="width:110px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in st.list" :key="row.id">
                <td class="bg-id">{{ row.id }}</td>
                <td><span class="bg-cname" :title="row.title">{{ row.title }}</span></td>
                <td><span class="bg-pill" :class="statusCls(row.status)">{{ statusLabel(row.status) }}</span></td>
                <td><span v-if="row.assignee" class="bg-user"><span class="bg-avatar" :style="{ background: avatarColor(row.assignee) }">{{ row.assignee.slice(0, 1) }}</span><span>{{ row.assignee }}</span></span><span v-else style="color:var(--el-text-color-placeholder,#a8abb2)">—</span></td>
                <td><span class="bg-cases"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg><b>{{ (row as any).caseCount ?? 0 }}</b></span></td>
                <td><span v-if="row.reporter" class="bg-user"><span class="bg-avatar" :style="{ background: avatarColor(row.reporter) }">{{ row.reporter.slice(0, 1) }}</span><span>{{ row.reporter }}</span></span><span v-else style="color:var(--el-text-color-placeholder,#a8abb2)">—</span></td>
                <td class="bg-time">{{ row.createTime }}</td>
                <td><span v-if="(row as any).updater" class="bg-user"><span class="bg-avatar" :style="{ background: avatarColor((row as any).updater) }">{{ (row as any).updater.slice(0, 1) }}</span><span>{{ (row as any).updater }}</span></span><span v-else style="color:var(--el-text-color-placeholder,#a8abb2)">—</span></td>
                <td class="bg-time">{{ (row as any).updateTime || '-' }}</td>
                <td><span class="bg-pill" :class="prioCls(row.severity)">{{ prioLabel(row.severity) }}</span></td>
                <td>
                  <div class="bg-ops">
                    <button class="bg-op" @click="openModal(row)">编辑</button>
                    <button class="bg-op bg-op-del" @click="onDelete(row)">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="bg-foot">
          <div class="bg-total">共 {{ st.total }} 条缺陷，第 {{ st.pageNum }} / {{ st.pages }} 页</div>
          <div class="bg-pager">
            <span class="bg-size">每页</span>
            <select class="bg-sel" style="width:74px" :value="st.pageSize" @change="onPageSize">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span class="bg-size">条</span>
            <span style="width:8px"></span>
            <button class="bg-pg" :disabled="st.pageNum <= 1" @click="goPage(st.pageNum - 1)">上一页</button>
            <template v-for="p in pageNumbers" :key="p">
              <button v-if="p === '...'" class="bg-pg" disabled>…</button>
              <button v-else class="bg-pg" :class="{ on: p === st.pageNum }" @click="goPage(p as number)">{{ p }}</button>
            </template>
            <button class="bg-pg" :disabled="st.pageNum >= st.pages" @click="goPage(st.pageNum + 1)">下一页</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="modalVisible" class="bg-mask" @click.self="closeModal">
      <div class="bg-modal">
        <h3>{{ editingId ? '编辑缺陷' : '新建缺陷' }}</h3>
        <div class="bg-form">
          <div class="bg-row bg-full">
            <label>缺陷名称<em>*</em></label>
            <input v-model="form.title" maxlength="80" placeholder="请输入缺陷名称" />
            <div v-if="formErr.title" class="err">{{ formErr.title }}</div>
          </div>
          <div class="bg-row">
            <label>状态</label>
            <select v-model="form.status">
              <option v-for="s in statusOptions" :key="s.v" :value="s.v">{{ s.t }}</option>
            </select>
          </div>
          <div class="bg-row">
            <label>优先级</label>
            <select v-model="form.priority">
              <option v-for="p in priorityOptions" :key="p.v" :value="p.v">{{ p.t }}</option>
            </select>
          </div>
          <div class="bg-row">
            <label>受理人</label>
            <input v-model="form.assignee" maxlength="20" list="bg-users" placeholder="选择或输入受理人" />
          </div>
          <div class="bg-row">
            <label>用例数</label>
            <input v-model.number="form.caseCount" type="number" min="0" max="999" />
          </div>
          <div class="bg-row bg-full">
            <label>描述</label>
            <textarea v-model="form.desc" maxlength="300" placeholder="缺陷现象、复现步骤等（选填）"></textarea>
          </div>
        </div>
        <datalist id="bg-users">
          <option v-for="u in userOptions" :key="u" :value="u" />
        </datalist>
        <div class="bg-modal-foot">
          <button class="bg-btn" @click="closeModal">取消</button>
          <button class="bg-btn bg-btn-pri" :disabled="saving" @click="onSave">
            {{ saving ? (editingId ? '保存中…' : '创建中…') : (editingId ? '保存' : '创建') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { fetchBugs, createBug, updateBug, deleteBug } from "@/api/bug";
import type { Bug, BugSeverity, BugStatus } from "@/types/models";

// 状态映射
const statusOptions = [
  { v: "新建", t: "新建" }, { v: "已指派", t: "已指派" },
  { v: "修复中", t: "修复中" }, { v: "已解决", t: "已解决" },
  { v: "重新打开", t: "重新打开" }, { v: "已关闭", t: "已关闭" },
];
const statusClsMap: Record<string, string> = {
  "新建": "st-new", "已指派": "st-assigned", "修复中": "st-fixing",
  "已解决": "st-resolved", "重新打开": "st-reopen", "已关闭": "st-closed",
};
const statusLabelMap: Record<string, string> = {
  NEW: "新建", ASSIGNED: "已指派", FIXING: "修复中",
  FIXED: "已解决", REOPEN: "重新打开", CLOSED: "已关闭",
};
function statusLabel(s: BugStatus) { return statusLabelMap[s] ?? s; }
function statusCls(s: BugStatus) { return statusClsMap[statusLabel(s)] ?? "st-new"; }

// 优先级映射
const priorityOptions = [
  { v: "阻塞", t: "阻塞" }, { v: "严重", t: "严重" },
  { v: "主要", t: "主要" }, { v: "次要", t: "次要" }, { v: "轻微", t: "轻微" },
];
const prioClsMap: Record<string, string> = {
  "阻塞": "pv-block", "严重": "pv-crit", "主要": "pv-major",
  "次要": "pv-minor", "轻微": "pv-trivial",
};
const prioLabelMap: Record<string, string> = {
  BLOCKER: "阻塞", CRITICAL: "严重", MAJOR: "主要",
  MINOR: "次要", TRIVIAL: "轻微",
};
function prioLabel(s: BugSeverity) { return prioLabelMap[s] ?? s; }
function prioCls(s: BugSeverity) { return prioClsMap[prioLabel(s)] ?? "pv-minor"; }

// 用户列表
const userOptions = ["张伟", "李娜", "王强", "赵敏", "刘洋", "陈晨", "杨帆", "周杰", "Administrator"];
const avatarColors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#6366f1", "#ec4899"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return avatarColors[h % avatarColors.length];
}

// 状态
const st = reactive({ pageNum: 1, pageSize: 10, total: 0, list: [] as Bug[], loading: false, pages: 1 });
const flt = reactive({ keyword: "", status: "", priority: "" });

const pageNumbers = computed(() => {
  const cur = st.pageNum, tot = st.pages;
  const list: (number | string)[] = [];
  for (let i = 1; i <= tot; i++) {
    if (i === 1 || i === tot || Math.abs(i - cur) <= 1) list.push(i);
    else if (list[list.length - 1] !== "...") list.push("...");
  }
  return list;
});

async function load() {
  st.loading = true;
  try {
    // 将中文状态映射回英文
    const chineseToEnglish: Record<string, BugStatus> = {
      "新建": "NEW", "已指派": "ASSIGNED", "修复中": "FIXING",
      "已解决": "FIXED", "重新打开": "REOPEN", "已关闭": "CLOSED",
    };
    const chineseToSeverity: Record<string, BugSeverity> = {
      "阻塞": "BLOCKER", "严重": "CRITICAL", "主要": "MAJOR",
      "次要": "MINOR", "轻微": "TRIVIAL",
    };
    const res = await fetchBugs({
      pageNum: st.pageNum,
      pageSize: st.pageSize,
      keyword: flt.keyword || undefined,
      status: flt.status ? chineseToEnglish[flt.status] : undefined,
      severity: flt.priority ? chineseToSeverity[flt.priority] : undefined,
    } as any);
    st.list = res.list ?? [];
    st.total = res.total ?? 0;
    st.pages = Math.max(1, Math.ceil(st.total / st.pageSize));
  } catch {
    st.list = [];
    st.total = 0;
    st.pages = 1;
  } finally {
    st.loading = false;
  }
}

function search() { st.pageNum = 1; load(); }
function reset() {
  flt.keyword = ""; flt.status = ""; flt.priority = "";
  st.pageNum = 1; st.pageSize = 10; load();
}
function goPage(p: number) {
  if (p < 1 || p > st.pages || p === st.pageNum) return;
  st.pageNum = p; load();
}
function onPageSize(e: Event) {
  st.pageSize = parseInt((e.target as HTMLSelectElement).value, 10) || 10;
  st.pageNum = 1; load();
}

// 弹窗
const modalVisible = ref(false);
const editingId = ref("");
const saving = ref(false);
const formErr = reactive({ title: "" });
const form = reactive({ title: "", status: "新建", priority: "次要", assignee: "", caseCount: 0, desc: "" });

function openModal(row: Bug | null) {
  if (row) {
    editingId.value = row.id;
    form.title = row.title;
    form.status = statusLabel(row.status);
    form.priority = prioLabel(row.severity);
    form.assignee = row.assignee || "";
    form.caseCount = (row as any).caseCount ?? 0;
    form.desc = row.description || "";
  } else {
    editingId.value = "";
    form.title = "";
    form.status = "新建";
    form.priority = "次要";
    form.assignee = "";
    form.caseCount = 0;
    form.desc = "";
  }
  formErr.title = "";
  modalVisible.value = true;
}

function closeModal() { modalVisible.value = false; }

async function onSave() {
  formErr.title = form.title.trim() ? "" : "请输入缺陷名称";
  if (!form.title.trim()) return;

  const chineseToEnglish: Record<string, BugStatus> = {
    "新建": "NEW", "已指派": "ASSIGNED", "修复中": "FIXING",
    "已解决": "FIXED", "重新打开": "REOPEN", "已关闭": "CLOSED",
  };
  const chineseToSeverity: Record<string, BugSeverity> = {
    "阻塞": "BLOCKER", "严重": "CRITICAL", "主要": "MAJOR",
    "次要": "MINOR", "轻微": "TRIVIAL",
  };

  saving.value = true;
  try {
    const payload = {
      title: form.title.trim(),
      status: chineseToEnglish[form.status] ?? "NEW",
      severity: chineseToSeverity[form.priority] ?? "MINOR",
      assignee: form.assignee || "",
      description: form.desc,
    };
    if (editingId.value) {
      await updateBug(editingId.value, payload as any);
      ElMessage.success("已保存");
    } else {
      await createBug(payload as any);
      ElMessage.success("缺陷已创建");
    }
    closeModal();
    load();
  } finally {
    saving.value = false;
  }
}

async function onDelete(row: Bug) {
  try {
    await ElMessageBox.confirm(`确认删除缺陷「${row.title}」？删除后不可恢复`, "删除缺陷", { type: "warning" });
    await deleteBug(row.id);
    ElMessage.success("已删除");
    load();
  } catch { /* 取消 */ }
}

onMounted(load);
</script>

<style scoped>
.bg { max-width: 1400px; }
.bg-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.bg-btn { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 14px; box-sizing: border-box; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 6px; background: var(--el-bg-color, #fff); color: var(--el-text-color-regular, #606266); font-size: 13px; font-family: inherit; cursor: pointer; transition: all 0.18s ease; white-space: nowrap; }
.bg-btn:hover { color: var(--el-color-primary, #409eff); border-color: var(--el-color-primary, #409eff); }
.bg-btn-pri { background: var(--el-color-primary, #409eff); border-color: var(--el-color-primary, #409eff); color: #fff; }
.bg-btn-pri:hover { background: var(--el-color-primary-light-3, #79bbff); border-color: var(--el-color-primary-light-3, #79bbff); color: #fff; }
.bg-bar { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; padding: 14px 16px; border: 1px solid var(--el-border-color-lighter, #ebeef5); border-radius: 10px; background: var(--el-bg-color, #fff); margin-bottom: 14px; }
.bg-field { display: flex; flex-direction: column; gap: 5px; }
.bg-lab { font-size: 12px; color: var(--el-text-color-secondary, #909399); line-height: 1.4; }
.bg-in, .bg-sel { height: 32px; box-sizing: border-box; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 6px; background: var(--el-bg-color, #fff); color: var(--el-text-color-primary, #303133); font-size: 13px; font-family: inherit; padding: 0 10px; outline: none; transition: border-color 0.18s ease; }
.bg-in:focus, .bg-sel:focus { border-color: var(--el-color-primary, #409eff); }
.bg-in::placeholder { color: var(--el-text-color-placeholder, #a8abb2); }
.bg-spacer { flex: 1; }
.bg-card { border: 1px solid var(--el-border-color-lighter, #ebeef5); border-radius: 10px; background: var(--el-bg-color, #fff); overflow: hidden; }
.bg-loading { opacity: 0.5; pointer-events: none; }
.bg-scroll { overflow-x: auto; }
.bg-tb { width: 100%; border-collapse: collapse; font-size: 13px; }
.bg-tb th { text-align: left; font-weight: 500; font-size: 12px; color: var(--el-text-color-secondary, #909399); background: var(--el-fill-color-lighter, #f5f7fa); padding: 10px 14px; white-space: nowrap; border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5); }
.bg-tb td { padding: 12px 14px; border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5); color: var(--el-text-color-regular, #606266); vertical-align: middle; white-space: nowrap; }
.bg-tb tbody tr { transition: background 0.15s ease; }
.bg-tb tbody tr:hover { background: var(--el-fill-color-light, #f5f7fa); }
.bg-tb tbody tr:last-child td { border-bottom: none; }
.bg-id { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; color: var(--el-text-color-secondary, #909399); }
.bg-cname { font-weight: 500; color: var(--el-text-color-primary, #303133); }
.bg-pill { display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 10px; border-radius: 12px; font-size: 12px; line-height: 1; }
.st-new { background: var(--el-fill-color, #f0f2f5); color: var(--el-text-color-regular, #606266); }
.st-assigned { background: #e8f3ff; color: #1d7afb; }
.st-fixing { background: #fdf3e7; color: #d67f1b; }
.st-resolved { background: #e8f7ee; color: #18a058; }
.st-reopen { background: #fdecec; color: #d93838; }
.st-closed { background: #e4e7ed; color: #606266; }
.pv-block { background: #fdecec; color: #d93838; }
.pv-crit { background: #fdf3e7; color: #d67f1b; }
.pv-major { background: #fef7e0; color: #b8860b; }
.pv-minor { background: #e8f3ff; color: #1d7afb; }
.pv-trivial { background: var(--el-fill-color, #f0f2f5); color: var(--el-text-color-secondary, #909399); }
.bg-user { display: flex; align-items: center; gap: 8px; }
.bg-avatar { width: 24px; height: 24px; border-radius: 50%; flex: none; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 600; }
.bg-time { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; color: var(--el-text-color-secondary, #909399); }
.bg-cases { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 8px; border-radius: 5px; background: var(--el-fill-color, #f0f2f5); color: var(--el-text-color-regular, #606266); font-size: 12px; border: 1px solid var(--el-border-color-lighter, #ebeef5); }
.bg-cases b { color: var(--el-color-primary, #409eff); font-weight: 600; }
.bg-ops { display: flex; align-items: center; gap: 10px; }
.bg-op { background: none; border: none; padding: 0; font-size: 13px; font-family: inherit; cursor: pointer; color: var(--el-color-primary, #409eff); }
.bg-op:hover { opacity: 0.75; }
.bg-op-del { color: var(--el-color-danger, #f56c6c); }
.bg-state { padding: 52px 16px; text-align: center; color: var(--el-text-color-secondary, #909399); font-size: 13.5px; }
.bg-state svg { width: 34px; height: 34px; margin-bottom: 10px; color: var(--el-border-color, #dcdfe6); }
.bg-foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px; border-top: 1px solid var(--el-border-color-lighter, #ebeef5); flex-wrap: wrap; }
.bg-total { font-size: 12.5px; color: var(--el-text-color-secondary, #909399); }
.bg-pager { display: flex; align-items: center; gap: 6px; }
.bg-pg { min-width: 30px; height: 30px; padding: 0 8px; box-sizing: border-box; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 6px; background: var(--el-bg-color, #fff); color: var(--el-text-color-regular, #606266); font-size: 13px; font-family: inherit; cursor: pointer; transition: all 0.18s ease; }
.bg-pg:hover:not(:disabled) { color: var(--el-color-primary, #409eff); border-color: var(--el-color-primary, #409eff); }
.bg-pg:disabled { opacity: 0.45; cursor: not-allowed; }
.bg-pg.on { background: var(--el-color-primary, #409eff); border-color: var(--el-color-primary, #409eff); color: #fff; }
.bg-size { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--el-text-color-secondary, #909399); }
.bg-mask { position: fixed; inset: 0; z-index: 1900; background: rgba(0, 0, 0, 0.45); display: flex; align-items: center; justify-content: center; animation: bg-fade 0.16s ease; }
@keyframes bg-fade { from { opacity: 0; } to { opacity: 1; } }
.bg-modal { width: 540px; max-width: calc(100vw - 32px); max-height: calc(100vh - 64px); overflow: auto; background: var(--el-bg-color, #fff); border-radius: 12px; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18); padding: 22px 24px; }
.bg-modal h3 { margin: 0 0 16px; font-size: 16px; font-weight: 600; color: var(--el-text-color-primary, #303133); }
.bg-form { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.bg-row { display: flex; flex-direction: column; gap: 6px; }
.bg-row label { font-size: 13px; color: var(--el-text-color-regular, #606266); }
.bg-row label em { color: var(--el-color-danger, #f56c6c); font-style: normal; margin-left: 2px; }
.bg-row input, .bg-row select { height: 34px; box-sizing: border-box; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 6px; background: var(--el-bg-color, #fff); color: var(--el-text-color-primary, #303133); font-size: 13px; font-family: inherit; padding: 0 10px; outline: none; width: 100%; transition: border-color 0.18s ease; }
.bg-row input:focus, .bg-row select:focus { border-color: var(--el-color-primary, #409eff); }
.bg-row .err { font-size: 12px; color: var(--el-color-danger, #f56c6c); }
.bg-full { grid-column: 1 / -1; }
.bg-row textarea { width: 100%; box-sizing: border-box; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 6px; background: var(--el-bg-color, #fff); color: var(--el-text-color-primary, #303133); font-size: 13px; font-family: inherit; padding: 8px 10px; outline: none; min-height: 64px; resize: vertical; transition: border-color 0.18s ease; }
.bg-row textarea:focus { border-color: var(--el-color-primary, #409eff); }
.bg-modal-foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
@media (max-width: 720px) { .bg-head { flex-direction: column; } }
</style>