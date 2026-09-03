<template>
  <div class="sc-page">
    <!-- 头部 -->
    <div class="bg-head">
      <div></div>
      <el-button type="primary" @click="openModal(null)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        新建场景
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="bg-bar">
      <div class="bg-field">
        <el-text class="bg-lab">关键词</el-text>
        <el-input v-model="filter.keyword" style="width:220px" placeholder="搜索场景名称 / ID" clearable
          @keydown.enter="search" @clear="search" />
      </div>
      <div class="bg-field">
        <el-text class="bg-lab">状态</el-text>
        <el-select v-model="filter.status" style="width:110px" placeholder="全部" clearable @change="search">
          <el-option v-for="s in statuses" :key="s" :label="s" :value="s" />
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

    <!-- 表格 -->
    <div class="bg-card" :class="{ 'bg-loading': loading }">
      <div class="bg-scroll">
        <div v-if="loading && !list.length" class="bg-state">加载中…</div>
        <div v-else-if="!list.length" class="bg-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M8 6h13M8 12h13M8 18h13" />
            <path d="M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          <div>暂无符合条件的场景</div>
        </div>
        <el-table v-else :data="list">
          <el-table-column prop="id" label="ID" min-width="110" class-name="bg-id" />
          <el-table-column label="场景名称" min-width="200">
            <template #default="{ row }">
              <span class="bg-cname" :title="row.name">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="接口数" min-width="90">
            <template #default="{ row }">
              <span class="bg-cases">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round">
                  <path d="M4 6h16M4 12h16M4 18h10" />
                  <circle cx="20" cy="18" r="2" />
                </svg>
                <b>{{ row.apiCount }}</b>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              <span class="bg-pill" :class="statusCls(row.status)">{{ row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column label="责任人" min-width="130">
            <template #default="{ row }">
              <div v-if="row.responsible" class="bg-user">
                <span class="bg-avatar" :style="{ background: avatarColor(row.responsible) }">{{
                  row.responsible.slice(0, 1) }}</span>
                <span>{{ row.responsible }}</span>
              </div>
              <span v-else style="color: var(--el-text-color-placeholder, #a8abb2)">—</span>
            </template>
          </el-table-column>
          <el-table-column label="创建人" min-width="130">
            <template #default="{ row }">
              <div v-if="row.creator" class="bg-user">
                <span class="bg-avatar" :style="{ background: avatarColor(row.creator) }">{{ row.creator.slice(0, 1)
                  }}</span>
                <span>{{ row.creator }}</span>
              </div>
              <span v-else style="color: var(--el-text-color-placeholder, #a8abb2)">—</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" min-width="160" class-name="bg-time" />
          <el-table-column prop="updateTime" label="更新时间" min-width="160" class-name="bg-time" />
          <el-table-column label="操作" min-width="160">
            <template #default="{ row }">
              <div class="bg-ops">
                <el-button link type="primary" @click="openModal(row)">编辑</el-button>
                <el-button link style="color:#18a058" @click="onExecute(row)">执行</el-button>
                <el-button link type="danger" @click="onDelete(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="bg-foot">
        <div class="bg-total">共 {{ total }} 个场景，第 {{ pageNum }} / {{ pages }} 页</div>
        <el-pagination :current-page="pageNum" :page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total"
          layout="sizes, prev, pager, next" @current-change="goPage"
          @size-change="(n: number) => { pageSize = n; goPage(1); }" />
      </div>
    </div>

    <!-- 新建/编辑弹窗 -->
    <el-dialog v-model="modalVisible" :title="editingId ? '编辑场景' : '新建场景'" width="560px" destroy-on-close>
      <div class="bg-form">
        <div class="bg-row bg-full">
          <el-text>场景名称<em>*</em></el-text>
          <el-input v-model="form.name" maxlength="80" placeholder="如：下单支付主流程" />
          <div v-if="err.name" class="err">{{ err.name }}</div>
        </div>
        <div class="bg-row">
          <el-text>接口数</el-text>
          <el-input v-model.number="form.apiCount" type="number" :min="1" :max="999" />
        </div>
        <div class="bg-row">
          <el-text>责任人</el-text>
          <el-input v-model="form.responsible" maxlength="20" placeholder="选择或输入责任人" />
        </div>
      </div>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :disabled="saving" @click="saveModal">{{ saving ? '保存中…' : (editingId ?
          '保存' : '创建') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { fetchScenarioPage, createScenario, updateScenario, deleteScenario, executeScenario } from '@/api/apiTest';
import type { Scenario, ScenarioStatus } from '@/types/models';

const statuses: ScenarioStatus[] = ['未执行', '执行中', '通过', '失败'];
const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#6366f1', '#ec4899'];

const list = ref<Scenario[]>([]);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const filter = reactive({ keyword: '', status: '' });

const modalVisible = ref(false);
const saving = ref(false);
const editingId = ref('');
const form = reactive({ name: '', apiCount: 1, responsible: '' });
const err = reactive({ name: '' });

const pages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

function statusCls(s: ScenarioStatus): string {
  const map: Record<ScenarioStatus, string> = { '未执行': 'st-wait', '执行中': 'st-doing', '通过': 'st-pass', '失败': 'st-fail' };
  return map[s] || 'st-wait';
}
function avatarColor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % 8];
}

async function load() {
  loading.value = true;
  try {
    const res = await fetchScenarioPage({
      pageNum: pageNum.value, pageSize: pageSize.value,
      keyword: filter.keyword.trim(), status: filter.status,
    });
    list.value = res.list ?? [];
    total.value = res.total ?? 0;
  } catch {
    list.value = []; total.value = 0;
  } finally {
    loading.value = false;
  }
}

function search() { pageNum.value = 1; load(); }
function reset() {
  filter.keyword = ''; filter.status = '';
  pageNum.value = 1; pageSize.value = 10;
  load();
}
function goPage(p: number) {
  if (!p || p < 1 || p > pages.value || p === pageNum.value) return;
  pageNum.value = p; load();
}

let timer: ReturnType<typeof setTimeout> | null = null;
watch(() => filter.keyword, () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => search(), 320);
});
onUnmounted(() => { if (timer) clearTimeout(timer); });

function openModal(row: Scenario | null) {
  editingId.value = row?.id ?? '';
  form.name = row?.name ?? '';
  form.apiCount = row?.apiCount ?? 1;
  form.responsible = row?.responsible ?? '';
  err.name = '';
  modalVisible.value = true;
}

async function saveModal() {
  err.name = form.name.trim() ? '' : '请输入场景名称';
  if (!form.name.trim()) return;
  saving.value = true;
  const payload = { name: form.name.trim(), apiCount: form.apiCount, responsible: form.responsible.trim() };
  try {
    if (editingId.value) await updateScenario(editingId.value, payload);
    else await createScenario(payload);
    ElMessage.success(editingId.value ? '已保存' : '场景已创建');
    modalVisible.value = false;
    load();
  } finally {
    saving.value = false;
  }
}

async function onExecute(row: Scenario) {
  try { await ElMessageBox.confirm(`确认执行场景「${row.name}」？`, '执行场景', { type: 'info' }); } catch { return; }
  try {
    const r = await executeScenario(row.id);
    ElMessageBox.alert(`执行完成：${r.result || ''}，通过率 ${r.passRate ?? 0}%`, `执行结果：${row.name}`, { type: 'info' });
  } catch (e: any) {
    ElMessage.error('执行失败：' + (e.message || ''));
  }
  load();
}

async function onDelete(row: Scenario) {
  try { await ElMessageBox.confirm(`确认删除场景「${row.name}」？删除后不可恢复`, '删除场景', { type: 'warning' }); } catch { return; }
  await deleteScenario(row.id);
  ElMessage.success('已删除');
  load();
}

onMounted(load);
</script>

<style>
.sc-page {
  display: flex;
  flex-direction: column;
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

.bg-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}

.st-wait {
  background: var(--el-fill-color, #f0f2f5);
  color: var(--el-text-color-regular, #606266);
}

.st-doing {
  background: #e8f3ff;
  color: #1d7afb;
}

.st-pass {
  background: #e8f7ee;
  color: #18a058;
}

.st-fail {
  background: #fdecec;
  color: #d93838;
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
</style>