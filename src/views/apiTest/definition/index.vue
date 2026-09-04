<template>
  <div class="def-page">
    <!-- 头部 -->
    <div class="bg-head">
      <div></div>
      <el-button type="primary" @click="openModal(null)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        新建接口
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="bg-bar">
      <div class="bg-field">
        <el-text class="bg-lab">关键词</el-text>
        <el-input v-model="filter.keyword" style="width:220px" placeholder="搜索接口名称 / 路径 / ID" clearable
          @keydown.enter="search" @clear="search" />
      </div>
      <div class="bg-field">
        <el-text class="bg-lab">请求方式</el-text>
        <el-select v-model="filter.method" style="width:120px" placeholder="全部" clearable @change="search">
          <el-option v-for="m in methods" :key="m" :label="m" :value="m" />
        </el-select>
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
            <path d="M4 6h16M4 12h16M4 18h10" />
            <circle cx="20" cy="18" r="2" />
          </svg>
          <div>暂无符合条件的接口</div>
        </div>
        <el-table v-else :data="list">
          <el-table-column label="接口名称" min-width="220">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 8px">
                <el-tag :type="methodType(row.method)" round>{{ row.method }}</el-tag>
                <span class="bg-cname" :title="row.name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="路径" min-width="200">
            <template #default="{ row }">
              <span class="at-path" :title="row.path">{{ row.path }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="protocol" label="协议" min-width="80" />
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" round>{{ row.status }}</el-tag>
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
          <el-table-column label="用例数" min-width="90">
            <template #default="{ row }">
              <span class="bg-cases">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
                <b>{{ row.caseCount }}</b>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="标签" min-width="140">
            <template #default="{ row }">
              <div v-if="row.tags && row.tags.length" class="bg-tags">
                <span v-for="t in row.tags.slice(0, 3)" :key="t" class="bg-tag">{{ t }}</span>
              </div>
              <span v-else style="color: var(--el-text-color-placeholder, #a8abb2)">—</span>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" min-width="160" class-name="bg-time" />
          <el-table-column label="操作" min-width="180">
            <template #default="{ row }">
              <div class="bg-ops">
                <el-button link type="success" @click="onExecute(row)">执行</el-button>
                <el-button link type="primary" @click="openModal(row)">编辑</el-button>
                <el-button link type="primary" @click="onMove(row)">移动</el-button>
                <el-button link type="danger" @click="onDelete(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="bg-foot">
        <div class="bg-total">共 {{ total }} 个接口，第 {{ pageNum }} / {{ pages }} 页</div>
        <el-pagination :current-page="pageNum" :page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total"
          layout="sizes, prev, pager, next" @current-change="goPage"
          @size-change="(n: number) => { pageSize = n; goPage(1); }" />
      </div>
    </div>

    <!-- 新建/编辑弹窗 -->
    <el-dialog v-model="modalVisible" :title="editingId ? '编辑接口' : '新建接口'" width="560px" destroy-on-close>
      <div class="bg-form">
        <div class="bg-row bg-full">
          <el-text>接口名称<em>*</em></el-text>
          <el-input v-model="form.name" maxlength="80" placeholder="如：查询用户列表" />
          <div v-if="err.name" class="err">{{ err.name }}</div>
        </div>
        <div class="bg-row">
          <el-text>请求方式<em>*</em></el-text>
          <el-select v-model="form.method">
            <el-option v-for="m in methods" :key="m" :label="m" :value="m" />
          </el-select>
        </div>
        <div class="bg-row">
          <el-text>协议</el-text>
          <el-select v-model="form.protocol">
            <el-option label="HTTP" value="HTTP" />
            <el-option label="HTTPS" value="HTTPS" />
          </el-select>
        </div>
        <div class="bg-row bg-full">
          <el-text>请求路径<em>*</em></el-text>
          <el-input v-model="form.path" maxlength="160" placeholder="如：/api/v1/users" />
          <div v-if="err.path" class="err">{{ err.path }}</div>
        </div>
        <div class="bg-row">
          <el-text>状态</el-text>
          <el-select v-model="form.status">
            <el-option v-for="s in statuses" :key="s" :label="s" :value="s" />
          </el-select>
        </div>
        <div class="bg-row">
          <el-text>责任人</el-text>
          <el-input v-model="form.responsible" maxlength="20" placeholder="选择或输入责任人" />
        </div>
        <div class="bg-row">
          <el-text>用例数</el-text>
          <el-input v-model.number="form.caseCount" type="number" :min="0" :max="999" />
        </div>
        <div class="bg-row">
          <el-text>标签</el-text>
          <el-input v-model="form.tags" maxlength="60" placeholder="多个用逗号分隔" />
        </div>
        <div class="bg-row bg-full">
          <el-text>描述</el-text>
          <el-input v-model="form.desc" type="textarea" :rows="3" maxlength="300" placeholder="接口用途、依赖等（选填）" />
        </div>
      </div>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :disabled="saving" @click="saveModal">{{ saving ? '保存中…' : (editingId ?
          '保存' : '创建') }}</el-button>
      </template>
    </el-dialog>
  </div>
  <MoveFolderDialog v-model="moveVisible" :folders="folders" :current="movingRow?.folderId" @confirm="confirmMove" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { fetchApiDefinitionPage, createApiDefinition, updateApiDefinition, deleteApiDefinition } from '@/api/apiTest';
import { useFolders } from '@/composables/useFolders';
import { useCollectionsStore } from '@/stores/collections';
import MoveFolderDialog from '@/layouts/components/MoveFolderDialog.vue';
import type { ApiDefinition, HttpMethod, DefinitionStatus } from '@/types/models';

const router = useRouter();
const collectionsStore = useCollectionsStore();

// 目录过滤与移动
const { folders, loadFolders, folderFilter } = useFolders('api-test');
watch(folderFilter, () => {
  pageNum.value = 1;
  load();
});

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'CONNECT'];
const statuses: DefinitionStatus[] = ['未规划', '进行中', '已完成', '已归档'];
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

function methodType(m: HttpMethod): TagType {
  const map: Record<string, TagType> = { GET: 'success', POST: 'primary', PUT: 'warning', DELETE: 'danger', PATCH: 'warning', HEAD: 'info' };
  return map[m] || 'info';
}
type TagType = "primary" | "success" | "warning" | "danger" | "info";
function statusType(s: DefinitionStatus): TagType {
  const map: Record<DefinitionStatus, TagType> = { '未规划': 'info', '进行中': 'primary', '已完成': 'success', '已归档': 'info' };
  return map[s] || 'info';
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
      folderId: folderFilter.value || undefined,
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

/** 执行：跳转接口调试页并预填该方法与地址 */
function onExecute(row: ApiDefinition) {
  router.push({
    path: '/api-test/debug',
    query: { definitionId: row.id, name: row.name, method: row.method, path: row.path },
  });
}

// 移动到目录
const moveVisible = ref(false);
const movingRow = ref<ApiDefinition | null>(null);
function onMove(row: ApiDefinition) {
  movingRow.value = row;
  moveVisible.value = true;
}
async function confirmMove(folderId: string) {
  if (!movingRow.value) return;
  await updateApiDefinition(movingRow.value.id, { folderId: folderId || undefined } as any);
  ElMessage.success('已移动');
  collectionsStore.notifyChange();
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

onMounted(() => {
  load();
  loadFolders();
});
</script>

<style>
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

.bg-tags {
  display: inline-flex;
  gap: 6px;
  flex-wrap: nowrap;
}

.bg-tag {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 4px;
  background: var(--el-fill-color-lighter, #f5f7fa);
  color: var(--el-text-color-regular, #606266);
  font-size: 11.5px;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  white-space: nowrap;
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

.at-path {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
}
</style>