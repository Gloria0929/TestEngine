<template>
  <div class="case-page">
    <div class="tc">
      <!-- 头部 -->
      <div class="tc-head">
        <div></div>
        <div style="display: flex; gap: 10px">
          <el-button @click="importVisible = true">导入用例</el-button>
          <el-button type="primary" @click="openCaseModal()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
              stroke-linecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            新建用例
          </el-button>
        </div>
      </div>

      <div class="tc-pane">
        <div class="tc-bar">
          <div class="tc-field">
            <el-text class="tc-lab">关键词</el-text>
            <el-input style="width: 220px" v-model="flt.keyword" placeholder="搜索 ID 或用例名称" @keyup.enter="searchCases" />
          </div>
          <div class="tc-field">
            <el-text class="tc-lab">用例等级</el-text>
            <el-select style="width: 110px" v-model="flt.level" @change="searchCases">
              <el-option value="" label="全部" />
              <el-option v-for="l in levels" :key="l.v" :value="l.v" :label="l.t" />
            </el-select>
          </div>
          <div class="tc-field">
            <el-text class="tc-lab">评审结果</el-text>
            <el-select style="width: 120px" v-model="flt.review" @change="searchCases">
              <el-option value="" label="全部" />
              <el-option v-for="r in reviewLabels" :key="r.v" :value="r.v" :label="r.t" />
            </el-select>
          </div>
          <div class="tc-field">
            <el-text class="tc-lab">执行结果</el-text>
            <el-select style="width: 120px" v-model="flt.result" @change="searchCases">
              <el-option value="" label="全部" />
              <el-option v-for="r in resultLabels" :key="r.v" :value="r.v" :label="r.t" />
            </el-select>
          </div>
          <div class="tc-field">
            <el-text class="tc-lab">所属模块</el-text>
            <el-select style="width: 130px" v-model="flt.module" @change="searchCases">
              <el-option value="" label="全部" />
              <el-option v-for="m in modules" :key="m" :value="m" :label="m" />
            </el-select>
          </div>
          <div class="tc-spacer" />
          <div class="tc-field">
            <el-text class="tc-lab">&nbsp;</el-text>
            <el-button type="primary" @click="searchCases">
              查询
            </el-button>
          </div>
          <div class="tc-field">
            <el-text class="tc-lab">&nbsp;</el-text>
            <el-button @click="resetCases">重置</el-button>
          </div>
        </div>

        <div class="tc-card" :class="{ 'tc-loading': st.loading }">
          <div class="tc-scroll">
            <div v-if="st.loading && !st.list.length" class="tc-state">
              加载中…
            </div>
            <div v-else-if="!st.list.length" class="tc-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
              <div>暂无符合条件的测试用例</div>
            </div>
            <el-table v-else :data="st.list" style="width:100%">
              <el-table-column label="ID" min-width="90">
                <template #default="{ row }">
                  <span class="tc-id">{{ row.id }}</span>
                </template>
              </el-table-column>
              <el-table-column label="用例名称" min-width="220">
                <template #default="{ row }">
                  <span class="tc-cname tc-clink" :title="row.name"
                    @click="router.push('/test-case/detail/' + row.id)">{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="用例等级" min-width="90">
                <template #default="{ row }">
                  <el-tag :type="levelType(row.level)" round>{{ row.level || "-" }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="评审结果" min-width="100">
                <template #default="{ row }">
                  <el-tag :type="reviewType(row.review)" round>{{ row.review || "未评审" }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="执行结果" min-width="100">
                <template #default="{ row }">
                  <el-tag :type="resultType(row.result)" round>{{ row.result || "未执行" }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="所属模块" min-width="120">
                <template #default="{ row }">
                  <span class="tc-mod">{{ row.module || "-" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="更新人" min-width="130">
                <template #default="{ row }">
                  <div class="tc-user">
                    <span class="tc-avatar" :style="{
                      background: avatarColor(row.updater || '?'),
                    }">{{ (row.updater || "?").slice(0, 1) }}</span>
                    <span>{{ row.updater || "-" }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="更新时间" min-width="160">
                <template #default="{ row }">
                  <span class="tc-time">{{ row.updateTime || "-" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="创建人" min-width="160">
                <template #default="{ row }">
                  <div class="tc-user">
                    <span class="tc-avatar" :style="{
                      background: avatarColor(row.creator || '?'),
                    }">{{ (row.creator || "?").slice(0, 1) }}</span>
                    <span>{{ row.creator || "-" }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="创建时间" min-width="160">
                <template #default="{ row }">
                  <span class="tc-time">{{ row.createTime || "-" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="180">
                <template #default="{ row }">
                  <div class="tc-ops">
                    <el-button type="primary" link @click="router.push('/test-case/detail/' + row.id)">
                      编辑
                    </el-button>
                    <el-button type="primary" link @click="onMoveCase(row)">
                      移动
                    </el-button>
                    <el-button type="danger" link @click="onDeleteCase(row)">
                      删除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="tc-foot">
            <div class="tc-total">
              共 {{ st.total }} 条用例，第 {{ st.pageNum }} / {{ st.pages }} 页
            </div>
            <div class="tc-pager">
              <el-pagination v-model:current-page="st.pageNum" v-model:page-size="st.pageSize"
                :page-sizes="[10, 20, 50]" :total="st.total" layout="sizes, prev, pager, next"
                @current-change="loadCases" @size-change="onCaseSizeChange" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用例编辑弹窗 -->
    <el-dialog v-model="caseModalVisible" title="新建用例" width="520px">
      <div class="tc-form">
        <div class="tc-row">
          <el-text>用例名称<em>*</em></el-text>
          <el-input v-model="caseForm.name" maxlength="60" placeholder="请输入用例名称" />
          <div v-if="caseErr.name" class="err">{{ caseErr.name }}</div>
        </div>
        <div class="tc-row">
          <el-text>所在目录</el-text>
          <el-select v-model="caseForm.folderId" clearable placeholder="未分类">
            <el-option v-for="f in folders" :key="f.id" :label="f.name" :value="f.id" />
          </el-select>
        </div>
        <div class="tc-row">
          <el-text>用例等级</el-text>
          <el-select v-model="caseForm.level">
            <el-option v-for="l in levels" :key="l.v" :value="l.v" :label="l.t" />
          </el-select>
        </div>
        <div class="tc-row">
          <el-text>所属模块</el-text>
          <el-select v-model="caseForm.module">
            <el-option v-for="m in modules" :key="m" :value="m" :label="m" />
          </el-select>
        </div>
        <div class="tc-row">
          <el-text>创建人<em>*</em></el-text>
          <el-input v-model="caseForm.creator" maxlength="20" placeholder="请输入负责人" />
          <div v-if="caseErr.creator" class="err">{{ caseErr.creator }}</div>
        </div>
      </div>
      <template #footer>
        <div class="tc-modal-foot">
          <el-button @click="caseModalVisible = false">取消</el-button>
          <el-button type="primary" :disabled="caseSaving" @click="saveCase">
            {{ caseSaving ? "保存中…" : "保存" }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 移动到目录弹窗 -->
    <MoveFolderDialog v-model="moveVisible" :folders="folders" :current="movingCase?.folderId"
      @confirm="confirmCaseMove" />

    <!-- 导入用例弹窗 -->
    <ImportDialog v-model="importVisible" @imported="loadCases" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { fetchCaseList, deleteCase, createCase, updateCase } from "@/api/testCase";
import { useFolders } from "@/composables/useFolders";
import { useCollectionsStore } from "@/stores/collections";
import MoveFolderDialog from "@/layouts/components/MoveFolderDialog.vue";
import ImportDialog from "./components/ImportDialog.vue";

const router = useRouter();
const collectionsStore = useCollectionsStore();
const { folders, loadFolders, folderFilter } = useFolders("test-case");
watch(folderFilter, loadCases);

// 常量
const levels = [
  { v: "P0", t: "P0" },
  { v: "P1", t: "P1" },
  { v: "P2", t: "P2" },
  { v: "P3", t: "P3" },
];
type TagType = "primary" | "success" | "warning" | "danger" | "info";
const levelTypeMap: Record<string, TagType> = {
  P0: "danger",
  P1: "warning",
  P2: "primary",
  P3: "info",
};
function levelType(l: string): TagType {
  return levelTypeMap[l] || "primary";
}

const reviewLabels = [
  { v: "已通过", t: "已通过" },
  { v: "未通过", t: "未通过" },
  { v: "未评审", t: "未评审" },
  { v: "免评审", t: "免评审" },
];
const reviewTypeMap: Record<string, TagType> = {
  已通过: "success",
  未通过: "danger",
  未评审: "info",
  免评审: "primary",
};
function reviewType(r: string): TagType {
  return reviewTypeMap[r] || "info";
}

const resultLabels = [
  { v: "通过", t: "通过" },
  { v: "失败", t: "失败" },
  { v: "阻塞", t: "阻塞" },
  { v: "未执行", t: "未执行" },
];
const resultTypeMap: Record<string, TagType> = {
  通过: "success",
  失败: "danger",
  阻塞: "warning",
  未执行: "info",
};
function resultType(r: string): TagType {
  return resultTypeMap[r] || "info";
}

const modules = [
  "登录鉴权",
  "订单中心",
  "支付中台",
  "用户中心",
  "商品模块",
  "营销活动",
  "权限中心",
  "消息中心",
];


const avatarColors = [
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#06b6d4",
  "#6366f1",
  "#ec4899",
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return avatarColors[h % avatarColors.length];
}

// 用例列表状态
const st = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  list: [] as any[],
  loading: false,
  pages: 1,
});
const flt = reactive({
  keyword: "",
  level: "",
  review: "",
  result: "",
  module: "",
});
async function loadCases() {
  st.loading = true;
  try {
    const res = await fetchCaseList({
      pageNum: st.pageNum,
      pageSize: st.pageSize,
      keyword: flt.keyword || undefined,
      level: flt.level || undefined,
    } as any);
    st.list = (res as any).list ?? [];
    st.total = (res as any).total ?? 0;
    st.pages = Math.max(1, Math.ceil(st.total / st.pageSize));
  } catch {
    st.list = [];
    st.total = 0;
    st.pages = 1;
  } finally {
    st.loading = false;
  }
}

function searchCases() {
  st.pageNum = 1;
  loadCases();
}
function resetCases() {
  flt.keyword = "";
  flt.level = "";
  flt.review = "";
  flt.result = "";
  flt.module = "";
  st.pageNum = 1;
  st.pageSize = 10;
  loadCases();
}
function onCaseSizeChange() {
  st.pageNum = 1;
  loadCases();
}
// 用例弹窗
const caseModalVisible = ref(false);
const caseSaving = ref(false);
const importVisible = ref(false);
const caseForm = reactive({
  name: "",
  folderId: "",
  level: "P2",
  module: modules[0],
  creator: "",
});
const caseErr = reactive({ name: "", creator: "" });

function openCaseModal() {
  caseForm.name = "";
  caseForm.folderId = folderFilter.value;
  caseForm.level = "P2";
  caseForm.module = modules[0];
  caseForm.creator = "";
  caseErr.name = "";
  caseErr.creator = "";
  caseModalVisible.value = true;
}

async function saveCase() {
  caseErr.name = caseForm.name.trim() ? "" : "请输入用例名称";
  caseErr.creator = caseForm.creator.trim() ? "" : "请输入负责人";
  if (!caseForm.name.trim() || !caseForm.creator.trim()) return;
  caseSaving.value = true;
  try {
    await createCase({ ...caseForm, projectId: "p-1", status: "DRAFT" } as any);
    ElMessage.success("已创建");
    caseModalVisible.value = false;
    collectionsStore.notifyChange();
    loadCases();
  } finally {
    caseSaving.value = false;
  }
}

// 移动到目录
const moveVisible = ref(false);
const movingCase = ref<any>(null);
function onMoveCase(row: any) {
  movingCase.value = row;
  moveVisible.value = true;
}
async function confirmCaseMove(folderId: string) {
  if (!movingCase.value) return;
  await updateCase(movingCase.value.id, { folderId: folderId || undefined } as any);
  ElMessage.success("已移动");
  collectionsStore.notifyChange();
  loadCases();
}

async function onDeleteCase(row: any) {
  try {
    await ElMessageBox.confirm(
      `确认删除用例「${row.name}」？删除后可在回收站恢复`,
      "删除用例",
      { type: "warning" },
    );
    await deleteCase(row.id);
    ElMessage.success("已删除");
    loadCases();
  } catch {
    /* 取消 */
  }
}
onMounted(() => {
  loadFolders();
  loadCases();
});
</script>

<style scoped>
.case-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tc {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
}

.tc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  /* 拉满整行宽度：向左扩展到目录侧边栏左缘（侧栏 200 + 间距 16） */
  margin-left: -216px;
}

.tc-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tc-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  margin-bottom: 14px;
}

.tc-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tc-lab {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  line-height: 1.4;
  align-self: auto;
}

.tc-spacer {
  flex: 1;
}

.tc-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  overflow: hidden;
}

.tc-scroll {
  flex: 1;
  overflow: auto;
}

.tc-state {
  padding: 52px 16px;
  text-align: center;
  color: var(--el-text-color-secondary, #909399);
  font-size: 13.5px;
}

.tc-state svg {
  width: 34px;
  height: 34px;
  margin-bottom: 10px;
  color: var(--el-border-color, #dcdfe6);
}

.tc-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
}

.tc-cname {
  font-weight: 500;
}

/* 可点击标题的超链接样式，与测试计划列表 .tp-name 对齐 */
.tc-clink {
  color: var(--el-color-primary, #409eff);
  cursor: pointer;
}

.tc-clink:hover {
  text-decoration: underline;
}

.tc-mod {
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

.tc-time {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
  white-space: nowrap;
}

.tc-user {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.tc-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.tc-cases {
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

.tc-cases b {
  color: var(--el-color-primary, #409eff);
  font-weight: 600;
}

.tc-ops {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tc-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.tc-total {
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
}

.tc-pager {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tc-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tc-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tc-row .el-text {
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  font-weight: 500;
  align-self: auto;
}

.tc-row .el-text em {
  color: var(--el-color-danger, #f56c6c);
  font-style: normal;
  margin-left: 2px;
}

.tc-row .err {
  font-size: 12px;
  color: var(--el-color-danger, #f56c6c);
}

.tc-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
}
</style>