<template>
  <div class="pm-page">
    <div class="pm">
      <div class="pm-head">
        <p class="pm-sub">管理项目报告保留策略，追溯项目内各类资源的历史操作</p>
      </div>
      <div class="pm-tabs">
        <button class="pm-tab" @click="$router.push('/project/info')">应用设置</button>
        <button class="pm-tab on" @click="$router.push('/project/log')">日志</button>
      </div>

      <!-- 日志面板 -->
      <div>
        <div class="log-bar">
          <div class="log-field">
            <label class="log-lab">操作范围</label>
            <select class="log-sel" v-model="flt.scope" @change="onFilter">
              <option value="">全部</option>
              <option v-for="s in SCOPES" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="log-field">
            <label class="log-lab">操作类型</label>
            <select class="log-sel" v-model="flt.action" @change="onFilter">
              <option value="">全部</option>
              <option v-for="a in ACTIONS" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>
          <div class="log-field">
            <label class="log-lab">操作人</label>
            <input class="log-in" style="width:140px" v-model="flt.user" placeholder="输入操作人" @keyup.enter="onFilter" />
          </div>
          <div class="log-field">
            <label class="log-lab">对象 / 名称</label>
            <input class="log-in" v-model="flt.object" placeholder="搜索操作对象或名称" @keyup.enter="onFilter" @input="debouncedFilter" />
          </div>
          <div class="log-spacer" />
          <div class="log-field">
            <label class="log-lab">&nbsp;</label>
            <button class="log-btn log-btn-pri" @click="onFilter">查询</button>
          </div>
        </div>

        <div class="log-card" :class="{ 'log-loading': st.loading }">
          <div class="log-scroll">
            <div v-if="st.loading && !st.list.length" class="log-state">加载中…</div>
            <div v-else-if="!st.list.length" class="log-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>
              <div>暂无符合条件的日志记录</div>
            </div>
            <table v-else class="log-tb">
              <thead>
                <tr>
                  <th style="width:150px">操作人</th>
                  <th style="width:130px">操作范围</th>
                  <th style="width:150px">操作对象</th>
                  <th style="width:120px">操作类型</th>
                  <th style="min-width:220px">名称</th>
                  <th style="width:170px">操作时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in st.list" :key="r.id">
                  <td>
                    <div class="log-user">
                      <span class="log-avatar" :style="{ background: avatarColor(r.user) }">{{ (r.user || '?').slice(0, 1) }}</span>
                      <span>{{ r.user }}</span>
                    </div>
                  </td>
                  <td><span class="log-tag scope">{{ r.scope }}</span></td>
                  <td>{{ r.object }}</td>
                  <td><span class="log-tag" :class="actionCls(r.action)">{{ r.action }}</span></td>
                  <td class="log-name">{{ r.name }}</td>
                  <td class="log-time">{{ r.time }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="log-foot">
            <div class="log-total">共 {{ st.total }} 条记录，第 {{ st.pageNum }} / {{ st.pages }} 页</div>
            <div class="log-pager">
              <span class="log-size">每页</span>
              <select class="log-sel" style="width:74px" :value="st.pageSize" @change="onPageSize">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span class="log-size">条</span>
              <span style="width:8px"></span>
              <button class="log-pg" :disabled="st.pageNum <= 1" @click="goPage(st.pageNum - 1)">上一页</button>
              <template v-for="p in pageNumbers" :key="p">
                <button v-if="p === '...'" class="log-pg" disabled>…</button>
                <button v-else class="log-pg" :class="{ on: p === st.pageNum }" @click="goPage(p as number)">{{ p }}</button>
              </template>
              <button class="log-pg" :disabled="st.pageNum >= st.pages" @click="goPage(st.pageNum + 1)">下一页</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from "vue";
import { fetchOperationLogs } from "@/api/project";

const SCOPES = ["用例", "场景", "接口", "缺陷", "项目", "环境"];
const ACTIONS = ["新增", "删除", "修改", "执行", "评审", "导出"];
const ACTION_CLS: Record<string, string> = {
  "新增": "act-add", "修改": "act-edit", "删除": "act-del",
  "执行": "act-run", "评审": "act-review", "导出": "act-export",
};
function actionCls(a: string) { return ACTION_CLS[a] || "act-export"; }

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

function pageNums(cur: number, tot: number) {
  const list: (number | string)[] = [];
  for (let i = 1; i <= tot; i++) {
    if (i === 1 || i === tot || Math.abs(i - cur) <= 1) list.push(i);
    else if (list[list.length - 1] !== "...") list.push("...");
  }
  return list;
}
const pageNumbers = computed(() => pageNums(st.pageNum, st.pages));

function onFilter() { st.pageNum = 1; load(); }
function goPage(p: number) { if (p >= 1 && p <= st.pages && p !== st.pageNum) { st.pageNum = p; load(); } }
function onPageSize(e: Event) { st.pageSize = parseInt((e.target as HTMLSelectElement).value, 10) || 10; st.pageNum = 1; load(); }

async function load() {
  st.loading = true;
  try {
    const res = await fetchOperationLogs({
      pageNum: st.pageNum, pageSize: st.pageSize,
      scope: flt.scope || undefined, action: flt.action || undefined,
      user: flt.user || undefined, object: flt.object || undefined,
    } as any);
    st.list = (res as any)?.list ?? [];
    st.total = (res as any)?.total ?? 0;
    st.pages = Math.max(1, Math.ceil(st.total / st.pageSize));
  } catch { st.list = []; st.total = 0; st.pages = 1; }
  finally { st.loading = false; }
}

onMounted(load);
</script>

<style scoped>
.pm-page {
  height: 100%;
}
.pm {
  max-width: 1120px;
}
.pm-head {
  margin-bottom: 20px;
}
.pm-sub {
  font-size: 13px;
  color: var(--el-text-color-secondary, #909399);
  margin: 0;
  line-height: 1.6;
}
.pm-tabs {
  display: flex;
  gap: 2px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  margin-bottom: 20px;
}
.pm-tab {
  position: relative;
  padding: 10px 18px;
  font-size: 14px;
  color: var(--el-text-color-secondary, #909399);
  cursor: pointer;
  background: none;
  border: none;
  font-family: inherit;
  transition: color 0.18s ease;
}
.pm-tab:hover {
  color: var(--el-color-primary, #409eff);
}
.pm-tab.on {
  color: var(--el-color-primary, #409eff);
  font-weight: 600;
}
.pm-tab.on::after {
  content: "";
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: var(--el-color-primary, #409eff);
}
.log-bar {
  display: flex;
  align-items: center;
  gap: 10px;
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
}
.log-in, .log-sel {
  height: 32px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-primary, #303133);
  font-size: 13px;
  font-family: inherit;
  padding: 0 10px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.log-in {
  width: 190px;
}
.log-sel {
  width: 132px;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23909399' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 9px center;
  padding-right: 26px;
  cursor: pointer;
}
.log-in:hover, .log-sel:hover {
  border-color: var(--el-border-color-hover, #c0c4cc);
}
.log-in:focus, .log-sel:focus {
  outline: none;
  border-color: var(--el-color-primary, #409eff);
  box-shadow: 0 0 0 3px var(--el-color-primary-light-9, #ecf5ff);
}
.log-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--el-border-color, #dcdfe6);
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-regular, #606266);
  transition: all 0.18s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.log-btn:hover {
  color: var(--el-color-primary, #409eff);
  border-color: var(--el-color-primary, #409eff);
}
.log-btn-pri {
  background: var(--el-color-primary, #409eff);
  border-color: var(--el-color-primary, #409eff);
  color: #fff;
}
.log-btn-pri:hover {
  opacity: 0.88;
  color: #fff;
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
.log-tb {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}
.log-tb th {
  text-align: left;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--el-text-color-regular, #606266);
  background: var(--el-fill-color-lighter, #fafafa);
  padding: 11px 16px;
  white-space: nowrap;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  line-height: 1.5;
}
.log-tb td {
  padding: 13px 16px;
  color: var(--el-text-color-regular, #606266);
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  vertical-align: middle;
  line-height: 1.5;
}
.log-tb tbody tr:last-child td {
  border-bottom: none;
}
.log-tb tbody tr {
  transition: background-color 0.15s ease;
}
.log-tb tbody tr:hover {
  background: var(--el-fill-color-lighter, #fafafa);
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
.log-tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 9px;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1;
}
.log-tag.act-add { background: #ecfdf5; color: #059669; }
.log-tag.act-edit { background: #eff6ff; color: #2563eb; }
.log-tag.act-del { background: #fef2f2; color: #dc2626; }
.log-tag.act-run { background: #f5f3ff; color: #7c3aed; }
.log-tag.act-review { background: #fff7ed; color: #ea580c; }
.log-tag.act-export { background: #f4f4f5; color: #52525b; }
.log-tag.scope {
  background: var(--el-fill-color, #f0f2f5);
  color: var(--el-text-color-regular, #606266);
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
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
.log-pager {
  display: flex;
  align-items: center;
  gap: 6px;
}
.log-pg {
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
.log-pg:hover:not(:disabled) {
  color: var(--el-color-primary, #409eff);
  border-color: var(--el-color-primary, #409eff);
}
.log-pg:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.log-pg.on {
  background: var(--el-color-primary, #409eff);
  border-color: var(--el-color-primary, #409eff);
  color: #fff;
}
.log-size {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
}
@media (max-width: 720px) {
  .log-in {
    width: 100%;
  }
}
</style>