<template>
  <div class="bug-page">
    <div class="bg">
      <!-- 头部 -->
      <div class="bg-head">
        <div></div>
        <el-button type="primary" @click="openModal(null)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          新建缺陷
        </el-button>
      </div>

      <!-- 筛选栏 -->
      <div class="bg-bar">
        <div class="bg-field">
          <el-text class="bg-lab">关键词</el-text>
          <el-input style="width:220px" v-model="flt.keyword" placeholder="搜索 ID 或缺陷名称" @keyup.enter="search" />
        </div>
        <div class="bg-field">
          <el-text class="bg-lab">状态</el-text>
          <el-select style="width:110px" v-model="flt.status" @change="search">
            <el-option value="" label="全部" />
            <el-option v-for="s in statusOptions" :key="s.v" :value="s.v" :label="s.t" />
          </el-select>
        </div>
        <div class="bg-field">
          <el-text class="bg-lab">优先级</el-text>
          <el-select style="width:110px" v-model="flt.priority" @change="search">
            <el-option value="" label="全部" />
            <el-option v-for="p in priorityOptions" :key="p.v" :value="p.v" :label="p.t" />
          </el-select>
        </div>
        <div class="bg-spacer" />
        <div class="bg-field">
          <el-text class="bg-lab">&nbsp;</el-text>
          <el-button type="primary" @click="search">查询</el-button>
        </div>
        <div class="bg-field">
          <el-text class="bg-lab">&nbsp;</el-text>
          <el-button @click="reset">重置</el-button>
        </div>
      </div>

      <!-- 表格卡片 -->
      <div class="bg-card" :class="{ 'bg-loading': st.loading }">
        <div class="bg-scroll">
          <!-- 加载中 / 空状态 -->
          <div v-if="st.loading && !st.list.length" class="bg-state">加载中…</div>
          <div v-else-if="!st.list.length" class="bg-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
            <div>暂无符合条件的缺陷</div>
          </div>
          <!-- 数据表格 -->
          <el-table v-else :data="st.list" style="width:100%">
            <el-table-column label="ID" min-width="110">
              <template #default="{ row }"><span class="bg-id">{{ row.id }}</span></template>
            </el-table-column>
            <el-table-column label="缺陷名称" min-width="240">
              <template #default="{ row }"><span class="bg-cname" :title="row.title">{{ row.title }}</span></template>
            </el-table-column>
            <el-table-column label="状态" min-width="100">
              <template #default="{ row }"><el-tag :type="statusType(row.status)" round>{{
                statusLabel(row.status) }}</el-tag></template>
            </el-table-column>
            <el-table-column label="受理人" min-width="130">
              <template #default="{ row }">
                <span v-if="row.assignee" class="bg-user"><span class="bg-avatar"
                    :style="{ background: avatarColor(row.assignee) }">{{ row.assignee.slice(0, 1) }}</span><span>{{
                      row.assignee }}</span></span>
                <span v-else style="color:var(--el-text-color-placeholder,#a8abb2)">—</span>
              </template>
            </el-table-column>
            <el-table-column label="用例数" min-width="90">
              <template #default="{ row }">
                <span class="bg-cases"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                  </svg><b>{{ (row as any).caseCount ?? 0 }}</b></span>
              </template>
            </el-table-column>
            <el-table-column label="创建人" min-width="160">
              <template #default="{ row }">
                <span v-if="row.reporter" class="bg-user"><span class="bg-avatar"
                    :style="{ background: avatarColor(row.reporter) }">{{ row.reporter.slice(0, 1) }}</span><span>{{
                      row.reporter }}</span></span>
                <span v-else style="color:var(--el-text-color-placeholder,#a8abb2)">—</span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" min-width="160">
              <template #default="{ row }"><span class="bg-time">{{ row.createTime }}</span></template>
            </el-table-column>
            <el-table-column label="更新人" min-width="130">
              <template #default="{ row }">
                <span v-if="(row as any).updater" class="bg-user"><span class="bg-avatar"
                    :style="{ background: avatarColor((row as any).updater) }">{{ (row as any).updater.slice(0, 1)
                    }}</span><span>{{ (row as any).updater }}</span></span>
                <span v-else style="color:var(--el-text-color-placeholder,#a8abb2)">—</span>
              </template>
            </el-table-column>
            <el-table-column label="更新时间" min-width="160">
              <template #default="{ row }"><span class="bg-time">{{ (row as any).updateTime || '-' }}</span></template>
            </el-table-column>
            <el-table-column label="优先级" min-width="100">
              <template #default="{ row }"><el-tag :type="prioType(row.severity)" round>{{
                prioLabel(row.severity) }}</el-tag></template>
            </el-table-column>
            <el-table-column label="操作" min-width="160">
              <template #default="{ row }">
                <div class="bg-ops">
                  <el-button link type="primary" @click="openModal(row)">编辑</el-button>
                  <el-button link type="primary" @click="onMoveBug(row)">移动</el-button>
                  <el-button link type="danger" @click="onDelete(row)">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="bg-foot">
          <div class="bg-total">共 {{ st.total }} 条缺陷，第 {{ st.pageNum }} / {{ st.pages }} 页</div>
          <el-pagination :page-sizes="[10, 20, 50]" :page-size="st.pageSize" :current-page="st.pageNum"
            :total="st.total" layout="sizes, prev, pager, next" @size-change="onPageSize" @current-change="goPage" />
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="modalVisible" width="540px" :show-close="false" align-center>
      <template #header>
        <h3>{{ editingId ? '编辑缺陷' : '新建缺陷' }}</h3>
      </template>
      <div class="bg-form">
        <div class="bg-row bg-full">
          <el-text>缺陷名称<em>*</em></el-text>
          <el-input v-model="form.title" maxlength="80" placeholder="请输入缺陷名称" />
          <div v-if="formErr.title" class="err">{{ formErr.title }}</div>
        </div>
        <div class="bg-row">
          <el-text>状态</el-text>
          <el-select v-model="form.status">
            <el-option v-for="s in statusOptions" :key="s.v" :value="s.v" :label="s.t" />
          </el-select>
        </div>
        <div class="bg-row">
          <el-text>优先级</el-text>
          <el-select v-model="form.priority">
            <el-option v-for="p in priorityOptions" :key="p.v" :value="p.v" :label="p.t" />
          </el-select>
        </div>
        <div class="bg-row">
          <el-text>受理人</el-text>
          <el-input v-model="form.assignee" maxlength="20" list="bg-users" placeholder="选择或输入受理人" />
        </div>
        <div class="bg-row">
          <el-text>用例数</el-text>
          <el-input v-model.number="form.caseCount" type="number" min="0" max="999" />
        </div>
        <div class="bg-row bg-full">
          <el-text>描述</el-text>
          <el-input v-model="form.desc" type="textarea" maxlength="300" :rows="3" placeholder="缺陷现象、复现步骤等（选填）" />
        </div>
      </div>
      <datalist id="bg-users">
        <option v-for="u in userOptions" :key="u" :value="u" />
      </datalist>
      <template #footer>
        <div class="bg-modal-foot">
          <el-button @click="closeModal">取消</el-button>
          <el-button type="primary" :loading="saving" :disabled="saving" @click="onSave">
            {{ saving ? (editingId ? '保存中…' : '创建中…') : (editingId ? '保存' : '创建') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 移动到目录弹窗 -->
    <MoveFolderDialog v-model="moveVisible" :folders="folders" :current="movingBug?.folderId"
      @confirm="confirmBugMove" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { fetchBugs, createBug, updateBug, deleteBug } from "@/api/bug";
import { useFolders } from "@/composables/useFolders";
import { useCollectionsStore } from "@/stores/collections";
import MoveFolderDialog from "@/layouts/components/MoveFolderDialog.vue";
import type { Bug, BugSeverity, BugStatus } from "@/types/models";

const collectionsStore = useCollectionsStore();
const { folders, loadFolders, folderFilter } = useFolders("bug");
watch(folderFilter, load);

// 状态映射
const statusOptions = [
  { v: "新建", t: "新建" }, { v: "已指派", t: "已指派" },
  { v: "修复中", t: "修复中" }, { v: "已解决", t: "已解决" },
  { v: "重新打开", t: "重新打开" }, { v: "已关闭", t: "已关闭" },
];
type TagType = "primary" | "success" | "warning" | "danger" | "info";
const statusTypeMap: Record<string, TagType> = {
  "新建": "info", "已指派": "primary", "修复中": "warning",
  "已解决": "success", "重新打开": "danger", "已关闭": "info",
};
const statusLabelMap: Record<string, string> = {
  NEW: "新建", ASSIGNED: "已指派", FIXING: "修复中",
  FIXED: "已解决", REOPEN: "重新打开", CLOSED: "已关闭",
};
function statusLabel(s: BugStatus) { return statusLabelMap[s] ?? s; }
function statusType(s: BugStatus): TagType { return statusTypeMap[statusLabel(s)] ?? "info"; }

// 优先级映射
const priorityOptions = [
  { v: "阻塞", t: "阻塞" }, { v: "严重", t: "严重" },
  { v: "主要", t: "主要" }, { v: "次要", t: "次要" }, { v: "轻微", t: "轻微" },
];
const prioTypeMap: Record<string, TagType> = {
  "阻塞": "danger", "严重": "danger", "主要": "warning",
  "次要": "primary", "轻微": "info",
};
const prioLabelMap: Record<string, string> = {
  BLOCKER: "阻塞", CRITICAL: "严重", MAJOR: "主要",
  MINOR: "次要", TRIVIAL: "轻微",
};
function prioLabel(s: BugSeverity) { return prioLabelMap[s] ?? s; }
function prioType(s: BugSeverity): TagType { return prioTypeMap[prioLabel(s)] ?? "info"; }

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
function onPageSize(size: number) {
  st.pageSize = size;
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

// 移动到目录
const moveVisible = ref(false);
const movingBug = ref<Bug | null>(null);
function onMoveBug(row: Bug) {
  movingBug.value = row;
  moveVisible.value = true;
}
async function confirmBugMove(folderId: string) {
  if (!movingBug.value) return;
  await updateBug(movingBug.value.id, { folderId: folderId || undefined } as any);
  ElMessage.success("已移动");
  collectionsStore.notifyChange();
  load();
}

onMounted(() => {
  loadFolders();
  load();
});
</script>

<style scoped>
.bg {
  max-width: 1400px;
}

.bg-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  /* 拉满整行宽度：向左扩展到目录侧边栏左缘（侧栏 200 + 间距 16） */
  margin-left: -216px;
}

.bg-bar {
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

.bg-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.bg-lab {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  line-height: 1.4;
}

.bg-spacer {
  flex: 1;
}

.bg-card {
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  overflow: hidden;
}

.bg-loading {
  opacity: 0.5;
  pointer-events: none;
}

.bg-scroll {
  overflow-x: auto;
}

.bg-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
}

.bg-cname {
  font-weight: 500;
  color: var(--el-text-color-primary, #303133);
}

.bg-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bg-avatar {
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

.bg-time {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
}

.bg-cases {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 8px;
  border-radius: 5px;
  background: var(--el-fill-color, #f0f2f5);
  color: var(--el-text-color-regular, #606266);
  font-size: 12px;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.bg-cases b {
  color: var(--el-color-primary, #409eff);
  font-weight: 600;
}

.bg-ops {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bg-state {
  padding: 52px 16px;
  text-align: center;
  color: var(--el-text-color-secondary, #909399);
  font-size: 13.5px;
}

.bg-state svg {
  width: 34px;
  height: 34px;
  margin-bottom: 10px;
  color: var(--el-border-color, #dcdfe6);
}

.bg-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
  flex-wrap: wrap;
}

.bg-total {
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
}

.bg-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.bg-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bg-row .el-text {
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  align-self: auto;
}

.bg-row .el-text em {
  color: var(--el-color-danger, #f56c6c);
  font-style: normal;
  margin-left: 2px;
}

.bg-row .err {
  font-size: 12px;
  color: var(--el-color-danger, #f56c6c);
}

.bg-full {
  grid-column: 1 / -1;
}

.bg-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 720px) {
  .bg-head {
    flex-direction: column;
  }
}
</style>
