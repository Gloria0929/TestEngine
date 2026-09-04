<template>
  <div class="pm-page">
    <div class="pm">
      <div class="pm-head">
      </div>
      <!-- 日志面板 -->
      <div>
        <div class="log-bar">
          <div class="log-field">
            <el-text class="log-lab">操作范围</el-text>
            <el-select style="width:140px" v-model="flt.scope" @change="onFilter">
              <el-option label="全部" value="" />
              <el-option v-for="s in SCOPES" :key="s" :label="s" :value="s" />
            </el-select>
          </div>
          <div class="log-field">
            <el-text class="log-lab">操作类型</el-text>
            <el-select style="width:100px" v-model="flt.action" @change="onFilter">
              <el-option label="全部" value="" />
              <el-option v-for="a in ACTIONS" :key="a" :label="a" :value="a" />
            </el-select>
          </div>
          <div class="log-field">
            <el-text class="log-lab">操作人</el-text>
            <el-input style="width:140px" v-model="flt.user" placeholder="输入操作人" @keyup.enter="onFilter" />
          </div>
          <div class="log-field">
            <el-text class="log-lab">对象 / 名称</el-text>
            <el-input v-model="flt.object" placeholder="搜索操作对象或名称" @keyup.enter="onFilter" @input="debouncedFilter" />
          </div>
          <div class="log-spacer" />
          <div class="log-field">
            <el-text class="log-lab">&nbsp;</el-text>
            <el-button type="primary" @click="onFilter">查询</el-button>
          </div>
        </div>

        <div class="log-card" :class="{ 'log-loading': st.loading }">
          <div class="log-scroll">
            <div v-if="st.loading && !st.list.length" class="log-state">加载中…</div>
            <div v-else-if="!st.list.length" class="log-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M4 4h16v16H4z" />
                <path d="M8 9h8M8 13h8M8 17h5" />
              </svg>
              <div>暂无符合条件的日志记录</div>
            </div>
            <el-table v-else :data="st.list">
              <el-table-column label="操作人" min-width="180">
                <template #default="{ row }">
                  <div class="log-user">
                    <span class="log-avatar" :style="{ background: avatarColor(row.user) }">{{ (row.user ||
                      '?').slice(0, 1) }}</span>
                    <span>{{ row.user }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作范围" min-width="160">
                <template #default="{ row }">
                  <el-tag type="info" round>{{ row.scope }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="object" label="操作对象" min-width="180" />
              <el-table-column label="操作类型" min-width="140">
                <template #default="{ row }">
                  <el-tag :type="actionType(row.action)" round>{{ row.action }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="名称" min-width="180">
                <template #default="{ row }">
                  <span class="log-name">{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作时间" min-width="140">
                <template #default="{ row }">
                  <span class="log-time">{{ row.time }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="90">
                <template #default="{ row }">
                  <el-button type="primary" link @click="onMoveLog(row)">移动</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="log-foot">
            <div class="log-total">共 {{ st.total }} 条记录，第 {{ st.pageNum }} / {{ st.pages }} 页</div>
            <el-pagination :current-page="st.pageNum" :page-size="st.pageSize" :page-sizes="[10, 20, 50]"
              :total="st.total" layout="sizes, prev, pager, next" @size-change="onPageSize" @current-change="goPage" />
          </div>
        </div>
      </div>
    </div>

    <!-- 移动到目录弹窗 -->
    <MoveFolderDialog v-model="moveVisible" :folders="folders" :current="movingLog?.folderId"
      @confirm="confirmLogMove" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { fetchOperationLogs, moveLog } from "@/api/project";
import { useFolders } from "@/composables/useFolders";
import { useCollectionsStore } from "@/stores/collections";
import MoveFolderDialog from "@/layouts/components/MoveFolderDialog.vue";

const collectionsStore = useCollectionsStore();
const { folders, loadFolders, folderFilter } = useFolders("project");

const SCOPES = ["用例", "场景", "接口", "缺陷", "项目", "环境"];
const ACTIONS = ["新增", "删除", "修改", "执行", "评审", "导出"];
type TagType = "primary" | "success" | "warning" | "danger" | "info";
const ACTION_TYPE: Record<string, TagType> = {
  "新增": "success", "修改": "primary", "删除": "danger",
  "执行": "warning", "评审": "warning", "导出": "info",
};
function actionType(a: string): TagType { return ACTION_TYPE[a] || "info"; }

const AVATAR_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#6366f1", "#ec4899"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const flt = reactive({ scope: "", action: "", user: "", object: "" });
const st = reactive({ pageNum: 1, pageSize: 10, total: 0, list: [] as any[], loading: false, pages: 1 });

let debounceTimer: any = null;
function debouncedFilter() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { st.pageNum = 1; load(); }, 320);
}

function onFilter() { st.pageNum = 1; load(); }
function goPage(p: number) { if (p >= 1 && p <= st.pages && p !== st.pageNum) { st.pageNum = p; load(); } }
function onPageSize(size: number) { st.pageSize = size; st.pageNum = 1; load(); }

async function load() {
  st.loading = true;
  try {
    const res = await fetchOperationLogs({
      pageNum: st.pageNum, pageSize: st.pageSize,
      scope: flt.scope || undefined, action: flt.action || undefined,
      user: flt.user || undefined, object: flt.object || undefined,
      folderId: folderFilter.value || undefined,
    } as any);
    st.list = (res as any)?.list ?? [];
    st.total = (res as any)?.total ?? 0;
    st.pages = Math.max(1, Math.ceil(st.total / st.pageSize));
  } catch { st.list = []; st.total = 0; st.pages = 1; }
  finally { st.loading = false; }
}

// 移动到目录
const moveVisible = ref(false);
const movingLog = ref<any>(null);
function onMoveLog(row: any) {
  movingLog.value = row;
  moveVisible.value = true;
}
async function confirmLogMove(folderId: string) {
  if (!movingLog.value) return;
  await moveLog(movingLog.value.id, folderId || undefined);
  ElMessage.success("已移动");
  collectionsStore.notifyChange();
  load();
}

onMounted(() => {
  loadFolders();
  load();
});
watch(folderFilter, load);
</script>

<style scoped>
.pm-page {
  height: 100%;
  padding-bottom: 20px;
}

.pm-head {
  margin-bottom: 20px;
}

.log-bar {
  display: flex;
  align-items: center;
  gap: 50px;
  flex-wrap: wrap;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  margin-bottom: 14px;
}

.log-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.log-lab {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  line-height: 1.4;
  align-self: auto;
}

.log-spacer {
  flex: 1 1 auto;
}

.log-card {
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  overflow: hidden;
}

.log-scroll {
  overflow-x: auto;
}

.log-name {
  color: var(--el-text-color-primary, #303133);
  font-weight: 500;
}

.log-time {
  color: var(--el-text-color-secondary, #909399);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  font-size: 13px;
}

.log-user {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.log-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex: 0 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: var(--el-color-primary, #409eff);
}

.log-state {
  padding: 52px 16px;
  text-align: center;
  color: var(--el-text-color-secondary, #909399);
  font-size: 13.5px;
}

.log-state svg {
  width: 34px;
  height: 34px;
  margin-bottom: 10px;
  color: var(--el-border-color, #dcdfe6);
}

.log-loading {
  opacity: 0.5;
  pointer-events: none;
}

.log-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
  flex-wrap: wrap;
}

.log-total {
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
}
</style>
