<template>
  <div class="def-page">
    <!-- 搜索栏 -->
    <div class="bg-bar">
      <div class="bg-field">
        <label class="bg-lab">关键词</label>
        <input class="bg-in" style="width: 220px" v-model="filter.keyword" placeholder="搜索接口名称 / 路径 / ID" @keydown.enter="search" />
      </div>
      <div class="bg-field">
        <label class="bg-lab">请求方式</label>
        <select class="bg-sel" style="width: 120px" v-model="filter.method" @change="search">
          <option value="">全部</option>
          <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
        </select>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M4 12h16M4 18h10"/><circle cx="20" cy="18" r="2"/></svg>
          <div>暂无符合条件的接口</div>
        </div>
        <table v-else class="bg-tb">
          <thead>
            <tr>
              <th style="width: 130px">接口名称</th>
              <th style="min-width: 200px">路径</th>
              <th style="width: 80px">协议</th>
              <th style="width: 100px">状态</th>
              <th style="width: 130px">责任人</th>
              <th style="width: 90px">用例数</th>
              <th style="min-width: 140px">标签</th>
              <th style="width: 160px">更新时间</th>
              <th style="width: 110px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in list" :key="row.id">
              <td>
                <div style="display: flex; align-items: center; gap: 8px">
                  <span class="m-badge" :class="methodCls(row.method)">{{ row.method }}</span>
                  <span class="bg-cname" :title="row.name">{{ row.name }}</span>
                </div>
              </td>
              <td class="at-path" :title="row.path">{{ row.path }}</td>
              <td>{{ row.protocol }}</td>
              <td><span class="bg-pill" :class="statusCls(row.status)">{{ row.status }}</span></td>
              <td>
                <div v-if="row.responsible" class="bg-user">
                  <span class="bg-avatar" :style="{ background: avatarColor(row.responsible) }">{{ row.responsible.slice(0, 1) }}</span>
                  <span>{{ row.responsible }}</span>
                </div>
                <span v-else style="color: var(--el-text-color-placeholder, #a8abb2)">—</span>
              </td>
              <td>
                <span class="bg-cases">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                  <b>{{ row.caseCount }}</b>
                </span>
              </td>
              <td>
                <div v-if="row.tags && row.tags.length" class="bg-tags">
                  <span v-for="t in row.tags.slice(0, 3)" :key="t" class="bg-tag">{{ t }}</span>
                </div>
                <span v-else style="color: var(--el-text-color-placeholder, #a8abb2)">—</span>
              </td>
              <td class="bg-time">{{ row.updateTime }}</td>
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
        <div class="bg-total">共 {{ total }} 个接口，第 {{ pageNum }} / {{ pages }} 页</div>
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
        <h3>{{ editingId ? '编辑接口' : '新建接口' }}</h3>
        <div class="bg-form">
          <div class="bg-row bg-full">
            <label>接口名称<em>*</em></label>
            <input v-model="form.name" maxlength="80" placeholder="如：查询用户列表" />
            <div v-if="err.name" class="err">{{ err.name }}</div>
          </div>
          <div class="bg-row">
            <label>请求方式<em>*</em></label>
            <select v-model="form.method">
              <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div class="bg-row">
            <label>协议</label>
            <select v-model="form.protocol">
              <option value="HTTP">HTTP</option>
              <option value="HTTPS">HTTPS</option>
            </select>
          </div>
          <div class="bg-row bg-full">
            <label>请求路径<em>*</em></label>
            <input v-model="form.path" maxlength="160" placeholder="如：/api/v1/users" />
            <div v-if="err.path" class="err">{{ err.path }}</div>
          </div>
          <div class="bg-row">
            <label>状态</label>
            <select v-model="form.status">
              <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="bg-row">
            <label>责任人</label>
            <input v-model="form.responsible" maxlength="20" list="at-users" placeholder="选择或输入责任人" />
          </div>
          <div class="bg-row">
            <label>用例数</label>
            <input v-model.number="form.caseCount" type="number" min="0" max="999" />
          </div>
          <div class="bg-row">
            <label>标签</label>
            <input v-model="form.tags" maxlength="60" placeholder="多个用逗号分隔" />
          </div>
          <div class="bg-row bg-full">
            <label>描述</label>
            <textarea v-model="form.desc" maxlength="300" placeholder="接口用途、依赖等（选填）"></textarea>
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
import { fetchApiDefinitionPage, createApiDefinition, updateApiDefinition, deleteApiDefinition } from '@/api/apiTest';
import type { ApiDefinition, HttpMethod, DefinitionStatus } from '@/types/models';

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'CONNECT'];
const statuses: DefinitionStatus[] = ['未规划', '进行中', '已完成', '已归档'];
const users = ['张伟', '李娜', '王强', '赵敏', '刘洋', '陈晨', '杨帆', '周杰', 'Administrator'];
const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#6366f1', '#ec4899'];

const list = ref<ApiDefinition[]>([]);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const filter = reactive({ keyword: '', method: '', status: '' });

const modalVisible = ref(false);
const saving = ref(false);
const editingId = ref('');
const form = reactive({ name: '', method: 'GET' as HttpMethod, protocol: 'HTTPS' as 'HTTP' | 'HTTPS', path: '', status: '未规划' as DefinitionStatus, responsible: '', caseCount: 0, tags: '', desc: '' });
const err = reactive({ name: '', path: '' });

const pages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

const pageNums = computed(() => {
  const cur = pageNum.value;
  const tot = pages.value;
  const out: (number | '...')[] = [];
  for (let i = 1; i <= tot; i++) {
    if (i === 1 || i === tot || Math.abs(i - cur) <= 1) out.push(i);
    else if (out[out.length - 1] !== '...') out.push('...');
  }
  return out;
});

function methodCls(m: HttpMethod): string {
  const map: Record<string, string> = { GET: 'm-get', POST: 'm-post', PUT: 'm-put', DELETE: 'm-del', PATCH: 'm-patch', HEAD: 'm-head' };
  return map[m] || 'm-opt';
}
function statusCls(s: DefinitionStatus): string {
  const map: Record<DefinitionStatus, string> = { '未规划': 'st-new', '进行中': 'st-doing', '已完成': 'st-done', '已归档': 'st-archived' };
  return map[s] || 'st-new';
}
function avatarColor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % 8];
}

async function load() {
  loading.value = true;
  try {
    const res = await fetchApiDefinitionPage({
      pageNum: pageNum.value, pageSize: pageSize.value,
      keyword: filter.keyword.trim(), method: filter.method, status: filter.status,
    });
    list.value = res.list ?? [];
    total.value = res.total ?? 0;
  } catch {
    list.value = []; total.value = 0;
  } finally {
    loading.value = false;
  }
}

function search() {
  pageNum.value = 1;
  load();
}
function reset() {
  filter.keyword = ''; filter.method = ''; filter.status = '';
  pageNum.value = 1; pageSize.value = 10;
  load();
}
function goPage(p: number) {
  if (!p || p < 1 || p > pages.value || p === pageNum.value) return;
  pageNum.value = p;
  load();
}

// 关键词输入防抖
let timer: ReturnType<typeof setTimeout> | null = null;
watch(() => filter.keyword, () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => search(), 320);
});
onUnmounted(() => { if (timer) clearTimeout(timer); });

function openModal(row: ApiDefinition | null) {
  editingId.value = row?.id ?? '';
  form.name = row?.name ?? '';
  form.method = row?.method ?? 'GET';
  form.protocol = row?.protocol ?? 'HTTPS';
  form.path = row?.path ?? '';
  form.status = row?.status ?? '未规划';
  form.responsible = row?.responsible ?? '';
  form.caseCount = row?.caseCount ?? 0;
  form.tags = (row?.tags ?? []).join(',');
  form.desc = row?.desc ?? '';
  err.name = ''; err.path = '';
  modalVisible.value = true;
}

async function saveModal() {
  err.name = form.name.trim() ? '' : '请输入接口名称';
  err.path = form.path.trim() ? '' : '请输入请求路径';
  if (!form.name.trim() || !form.path.trim()) return;
  saving.value = true;
  const payload = {
    name: form.name.trim(), method: form.method, protocol: form.protocol, path: form.path.trim(),
    status: form.status, responsible: form.responsible.trim(), caseCount: form.caseCount,
    tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean), desc: form.desc.trim(),
  };
  try {
    if (editingId.value) await updateApiDefinition(editingId.value, payload);
    else await createApiDefinition(payload);
    ElMessage.success(editingId.value ? '已保存' : '接口已创建');
    modalVisible.value = false;
    load();
  } finally {
    saving.value = false;
  }
}

async function onDelete(row: ApiDefinition) {
  try { await ElMessageBox.confirm(`确认删除接口「${row.name}」？删除后不可恢复`, '删除接口', { type: 'warning' }); } catch { return; }
  await deleteApiDefinition(row.id);
  ElMessage.success('已删除');
  load();
}

onMounted(load);
</script>

<style>
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
.bg-cname { font-weight: 500; color: var(--el-text-color-primary, #303133); }
.bg-pill {
  display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 10px;
  border-radius: 12px; font-size: 12px; line-height: 1; white-space: nowrap;
}
.m-badge {
  display: inline-flex; align-items: center; justify-content: center; height: 22px; min-width: 52px; padding: 0 8px;
  border-radius: 5px; font-size: 11.5px; font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; flex: none;
}
.m-get { background: #e8f7ee; color: #18a058; }
.m-post { background: #fdf3e7; color: #d67f1b; }
.m-put { background: #e8f3ff; color: #1d7afb; }
.m-del { background: #fdecec; color: #d93838; }
.m-patch { background: #f3e8fd; color: #8b5cf6; }
.m-head { background: #fef7e0; color: #b8860b; }
.m-opt { background: #e4e7ed; color: #606266; }
.st-new { background: var(--el-fill-color, #f0f2f5); color: var(--el-text-color-regular, #606266); }
.st-doing { background: #e8f3ff; color: #1d7afb; }
.st-done { background: #e8f7ee; color: #18a058; }
.st-archived { background: #e4e7ed; color: #606266; }
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
.bg-tags { display: inline-flex; gap: 6px; flex-wrap: nowrap; }
.bg-tag {
  display: inline-flex; align-items: center; height: 20px; padding: 0 8px; border-radius: 4px;
  background: var(--el-fill-color-lighter, #f5f7fa); color: var(--el-text-color-regular, #606266);
  font-size: 11.5px; border: 1px solid var(--el-border-color-lighter, #ebeef5); white-space: nowrap;
}
.bg-ops { display: flex; align-items: center; gap: 10px; }
.bg-op { background: none; border: none; padding: 0; font-size: 13px; font-family: inherit; cursor: pointer; color: var(--el-color-primary, #409eff); }
.bg-op:hover { opacity: 0.75; }
.bg-op-del { color: var(--el-color-danger, #f56c6c); }
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
.bg-row textarea {
  width: 100%; box-sizing: border-box; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 6px;
  background: var(--el-bg-color, #fff); color: var(--el-text-color-primary, #303133);
  font-size: 13px; font-family: inherit; padding: 8px 10px; outline: none; min-height: 64px; resize: vertical; transition: border-color 0.18s ease;
}
.bg-row textarea:focus { border-color: var(--el-color-primary, #409eff); }
.bg-modal-foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.at-path { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; color: var(--el-text-color-secondary, #909399); }
</style>