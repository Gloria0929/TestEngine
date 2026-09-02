<template>
  <div class="sc-page">
    <!-- 搜索栏 -->
    <div class="bg-bar">
      <div class="bg-field">
        <label class="bg-lab">关键词</label>
        <input class="bg-in" style="width: 220px" v-model="filter.keyword" placeholder="搜索场景名称 / ID" @keydown.enter="search" />
      </div>
      <div class="bg-field">
        <label class="bg-lab">状态</label>
        <select class="bg-sel" style="width: 110px" v-model="filter.status" @change="search">
          <option value="">全部</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
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

    <!-- 表格 -->
    <div class="bg-card" :class="{ 'bg-loading': loading }">
      <div class="bg-scroll">
        <div v-if="loading && !list.length" class="bg-state">加载中…</div>
        <div v-else-if="!list.length" class="bg-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>
          <div>暂无符合条件的场景</div>
        </div>
        <table v-else class="bg-tb">
          <thead>
            <tr>
              <th style="width: 110px">ID</th>
              <th style="min-width: 200px">场景名称</th>
              <th style="width: 90px">接口数</th>
              <th style="width: 100px">状态</th>
              <th style="width: 130px">责任人</th>
              <th style="width: 130px">创建人</th>
              <th style="width: 160px">创建时间</th>
              <th style="width: 160px">更新时间</th>
              <th style="width: 160px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in list" :key="row.id">
              <td class="bg-id">{{ row.id }}</td>
              <td><span class="bg-cname" :title="row.name">{{ row.name }}</span></td>
              <td>
                <span class="bg-cases">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/><circle cx="20" cy="18" r="2"/></svg>
                  <b>{{ row.apiCount }}</b>
                </span>
              </td>
              <td><span class="bg-pill" :class="statusCls(row.status)">{{ row.status }}</span></td>
              <td>
                <div v-if="row.responsible" class="bg-user">
                  <span class="bg-avatar" :style="{ background: avatarColor(row.responsible) }">{{ row.responsible.slice(0, 1) }}</span>
                  <span>{{ row.responsible }}</span>
                </div>
                <span v-else style="color: var(--el-text-color-placeholder, #a8abb2)">—</span>
              </td>
              <td>
                <div v-if="row.creator" class="bg-user">
                  <span class="bg-avatar" :style="{ background: avatarColor(row.creator) }">{{ row.creator.slice(0, 1) }}</span>
                  <span>{{ row.creator }}</span>
                </div>
                <span v-else style="color: var(--el-text-color-placeholder, #a8abb2)">—</span>
              </td>
              <td class="bg-time">{{ row.createTime }}</td>
              <td class="bg-time">{{ row.updateTime }}</td>
              <td>
                <div class="bg-ops">
                  <button class="bg-op" @click="openModal(row)">编辑</button>
                  <button class="bg-op bg-op-run" @click="onExecute(row)">执行</button>
                  <button class="bg-op bg-op-del" @click="onDelete(row)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="bg-foot">
        <div class="bg-total">共 {{ total }} 个场景，第 {{ pageNum }} / {{ pages }} 页</div>
        <div class="bg-pager">
          <span class="bg-size">每页</span>
          <select class="bg-sel" style="width: 74px" v-model.number="pageSize" @change="goPage(1)">
            <option v-for="n in [10, 20, 50]" :key="n" :value="n">{{ n }}</option>
          </select>
          <span class="bg-size">条</span>
          <span style="width: 8px"></span>
          <button class="bg-pg" :disabled="pageNum <= 1" @click="goPage(pageNum - 1)">上一页</button>
          <template v-for="(p, i) in pageNums" :key="i">
            <button v-if="p === '...'" class="bg-pg" disabled>…</button>
            <button v-else class="bg-pg" :class="{ on: p === pageNum }" @click="goPage(p)">{{ p }}</button>
          </template>
          <button class="bg-pg" :disabled="pageNum >= pages" @click="goPage(pageNum + 1)">下一页</button>
        </div>
      </div>
    </div>

    <!-- 新建/编辑弹窗 -->
    <div v-if="modalVisible" class="bg-mask" @click.self="modalVisible = false">
      <div class="bg-modal">
        <h3>{{ editingId ? '编辑场景' : '新建场景' }}</h3>
        <div class="bg-form">
          <div class="bg-row bg-full">
            <label>场景名称<em>*</em></label>
            <input v-model="form.name" maxlength="80" placeholder="如：下单支付主流程" />
            <div v-if="err.name" class="err">{{ err.name }}</div>
          </div>
          <div class="bg-row">
            <label>接口数</label>
            <input v-model.number="form.apiCount" type="number" min="1" max="999" />
          </div>
          <div class="bg-row">
            <label>责任人</label>
            <input v-model="form.responsible" maxlength="20" list="at-users" placeholder="选择或输入责任人" />
          </div>
        </div>
        <datalist id="at-users">
          <option v-for="u in users" :key="u" :value="u" />
        </datalist>
        <div class="bg-modal-foot">
          <button class="bg-btn" @click="modalVisible = false">取消</button>
          <button class="bg-btn bg-btn-pri" :disabled="saving" @click="saveModal">{{ saving ? '保存中…' : (editingId ? '保存' : '创建') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { fetchScenarioPage, createScenario, updateScenario, deleteScenario, executeScenario } from '@/api/apiTest';
import type { Scenario, ScenarioStatus } from '@/types/models';

const statuses: ScenarioStatus[] = ['未执行', '执行中', '通过', '失败'];
const users = ['张伟', '李娜', '王强', '赵敏', '刘洋', '陈晨', '杨帆', '周杰', 'Administrator'];
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

const pageNums = computed(() => {
  const cur = pageNum.value, tot = pages.value;
  const out: (number | '...')[] = [];
  for (let i = 1; i <= tot; i++) {
    if (i === 1 || i === tot || Math.abs(i - cur) <= 1) out.push(i);
    else if (out[out.length - 1] !== '...') out.push('...');
  }
  return out;
});

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
.sc-page { height: 100%; display: flex; flex-direction: column; }
.bg-bar {
  display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap;
  padding: 14px 16px; border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px; background: var(--el-bg-color, #fff); margin-bottom: 14px;
}
.bg-field { display: flex; flex-direction: column; gap: 5px; }
.bg-lab { font-size: 12px; color: var(--el-text-color-secondary, #909399); line-height: 1.4; }
.bg-in, .bg-sel {
  height: 32px; box-sizing: border-box; border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px; background: var(--el-bg-color, #fff); color: var(--el-text-color-primary, #303133);
  font-size: 13px; font-family: inherit; padding: 0 10px; outline: none; transition: border-color 0.18s ease;
}
.bg-in:focus, .bg-sel:focus { border-color: var(--el-color-primary, #409eff); }
.bg-in::placeholder { color: var(--el-text-color-placeholder, #a8abb2); }
.bg-btn {
  display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 14px;
  box-sizing: border-box; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 6px;
  background: var(--el-bg-color, #fff); color: var(--el-text-color-regular, #606266);
  font-size: 13px; font-family: inherit; cursor: pointer; transition: all 0.18s ease; white-space: nowrap;
}
.bg-btn:hover { color: var(--el-color-primary, #409eff); border-color: var(--el-color-primary, #409eff); }
.bg-btn-pri { background: var(--el-color-primary, #409eff); border-color: var(--el-color-primary, #409eff); color: #fff; }
.bg-btn-pri:hover { background: var(--el-color-primary-light-3, #79bbff); border-color: var(--el-color-primary-light-3, #79bbff); color: #fff; }
.bg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.bg-spacer { flex: 1; }
.bg-card { border: 1px solid var(--el-border-color-lighter, #ebeef5); border-radius: 10px; background: var(--el-bg-color, #fff); overflow: hidden; }
.bg-loading { opacity: 0.5; pointer-events: none; }
.bg-scroll { overflow-x: auto; }
.bg-tb { width: 100%; border-collapse: collapse; font-size: 13px; }
.bg-tb th {
  text-align: left; font-weight: 500; font-size: 12px; color: var(--el-text-color-secondary, #909399);
  background: var(--el-fill-color-lighter, #f5f7fa); padding: 10px 14px; white-space: nowrap;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}
.bg-tb td {
  padding: 12px 14px; border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  color: var(--el-text-color-regular, #606266); vertical-align: middle; white-space: nowrap;
}
.bg-tb tbody tr { transition: background 0.15s ease; }
.bg-tb tbody tr:hover { background: var(--el-fill-color-light, #f5f7fa); }
.bg-tb tbody tr:last-child td { border-bottom: none; }
.bg-id { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; color: var(--el-text-color-secondary, #909399); }
.bg-cname { font-weight: 500; color: var(--el-text-color-primary, #303133); }
.bg-pill {
  display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 10px;
  border-radius: 12px; font-size: 12px; line-height: 1; white-space: nowrap;
}
.st-wait { background: var(--el-fill-color, #f0f2f5); color: var(--el-text-color-regular, #606266); }
.st-doing { background: #e8f3ff; color: #1d7afb; }
.st-pass { background: #e8f7ee; color: #18a058; }
.st-fail { background: #fdecec; color: #d93838; }
.bg-user { display: flex; align-items: center; gap: 8px; }
.bg-avatar {
  width: 24px; height: 24px; border-radius: 50%; flex: none;
  display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 600;
}
.bg-time { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; color: var(--el-text-color-secondary, #909399); }
.bg-cases {
  display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 8px; border-radius: 5px;
  background: var(--el-fill-color, #f0f2f5); color: var(--el-text-color-regular, #606266);
  font-size: 12px; border: 1px solid var(--el-border-color-lighter, #ebeef5);
}
.bg-cases b { color: var(--el-color-primary, #409eff); font-weight: 600; }
.bg-ops { display: flex; align-items: center; gap: 10px; }
.bg-op { background: none; border: none; padding: 0; font-size: 13px; font-family: inherit; cursor: pointer; color: var(--el-color-primary, #409eff); }
.bg-op:hover { opacity: 0.75; }
.bg-op-del { color: var(--el-color-danger, #f56c6c); }
.bg-op-run { color: #18a058; }
.bg-state { padding: 52px 16px; text-align: center; color: var(--el-text-color-secondary, #909399); font-size: 13.5px; }
.bg-state svg { width: 34px; height: 34px; margin-bottom: 10px; color: var(--el-border-color, #dcdfe6); }
.bg-foot {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 12px 16px; border-top: 1px solid var(--el-border-color-lighter, #ebeef5); flex-wrap: wrap;
}
.bg-total { font-size: 12.5px; color: var(--el-text-color-secondary, #909399); }
.bg-pager { display: flex; align-items: center; gap: 6px; }
.bg-pg {
  min-width: 30px; height: 30px; padding: 0 8px; box-sizing: border-box;
  border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 6px; background: var(--el-bg-color, #fff);
  color: var(--el-text-color-regular, #606266); font-size: 13px; font-family: inherit; cursor: pointer; transition: all 0.18s ease;
}
.bg-pg:hover:not(:disabled) { color: var(--el-color-primary, #409eff); border-color: var(--el-color-primary, #409eff); }
.bg-pg:disabled { opacity: 0.45; cursor: not-allowed; }
.bg-pg.on { background: var(--el-color-primary, #409eff); border-color: var(--el-color-primary, #409eff); color: #fff; }
.bg-size { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--el-text-color-secondary, #909399); }
.bg-mask {
  position: fixed; inset: 0; z-index: 1900; background: rgba(0, 0, 0, 0.45);
  display: flex; align-items: center; justify-content: center; animation: bg-fade 0.16s ease;
}
@keyframes bg-fade { from { opacity: 0; } to { opacity: 1; } }
.bg-modal {
  width: 560px; max-width: calc(100vw - 32px); max-height: calc(100vh - 64px); overflow: auto;
  background: var(--el-bg-color, #fff); border-radius: 12px; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18); padding: 22px 24px;
}
.bg-modal h3 { margin: 0 0 16px; font-size: 16px; font-weight: 600; color: var(--el-text-color-primary, #303133); }
.bg-form { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.bg-row { display: flex; flex-direction: column; gap: 6px; }
.bg-row label { font-size: 13px; color: var(--el-text-color-regular, #606266); }
.bg-row label em { color: var(--el-color-danger, #f56c6c); font-style: normal; margin-left: 2px; }
.bg-row input, .bg-row select {
  height: 34px; box-sizing: border-box; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 6px;
  background: var(--el-bg-color, #fff); color: var(--el-text-color-primary, #303133);
  font-size: 13px; font-family: inherit; padding: 0 10px; outline: none; width: 100%; transition: border-color 0.18s ease;
}
.bg-row input:focus, .bg-row select:focus { border-color: var(--el-color-primary, #409eff); }
.bg-row .err { font-size: 12px; color: var(--el-color-danger, #f56c6c); }
.bg-full { grid-column: 1 / -1; }
.bg-modal-foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
</style>