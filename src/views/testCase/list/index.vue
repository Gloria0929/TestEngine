<template>
  <div class="case-page">
    <div class="tc">
      <!-- 头部 -->
      <div class="tc-head">
        <div></div>
        <div style="display: flex; gap: 10px">
          <el-button v-if="tab === 'case'" @click="importVisible = true">导入用例</el-button>
          <el-button type="primary" @click="tab === 'case' ? openCaseModal(null) : openReviewModal(null)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
              stroke-linecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {{ tab === "case" ? "新建用例" : "新建评审" }}
          </el-button>
        </div>
      </div>

      <!-- 标签页 -->
      <el-tabs v-model="tab" @tab-change="onTabChange">
        <el-tab-pane label="用例列表" name="case">
          <div class="tc-pane">
            <div class="tc-bar">
              <div class="tc-field">
                <el-text class="tc-lab">关键词</el-text>
                <el-input style="width: 220px" v-model="flt.keyword" placeholder="搜索 ID 或用例名称"
                  @keyup.enter="searchCases" />
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
                      <span class="tc-cname" :title="row.name">{{ row.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="用例等级" min-width="90">
                    <template #default="{ row }">
                      <span class="tc-pill" :class="levelCls(row.level)">{{ row.level || "-" }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="评审结果" min-width="100">
                    <template #default="{ row }">
                      <span class="tc-pill" :class="reviewCls(row.review)">{{ row.review || "未评审" }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="执行结果" min-width="100">
                    <template #default="{ row }">
                      <span class="tc-pill" :class="resultCls(row.result)">{{ row.result || "未执行" }}</span>
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
                  <el-table-column label="操作" min-width="140">
                    <template #default="{ row }">
                      <div class="tc-ops">
                        <el-button type="primary" link @click="openCaseModal(row)">
                          编辑
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
        </el-tab-pane>

        <el-tab-pane label="用例评审" name="review">
          <div class="tc-pane">
            <div class="tc-bar">
              <div class="tc-field">
                <el-text class="tc-lab">关键词</el-text>
                <el-input style="width: 220px" v-model="rvFlt.keyword" placeholder="搜索评审 ID 或名称"
                  @keyup.enter="searchReviews" />
              </div>
              <div class="tc-field">
                <el-text class="tc-lab">评审状态</el-text>
                <el-select style="width: 120px" v-model="rvFlt.status" @change="searchReviews">
                  <el-option value="" label="全部" />
                  <el-option v-for="s in rvStatuses" :key="s.v" :value="s.v" :label="s.t" />
                </el-select>
              </div>
              <div class="tc-spacer" />
              <div class="tc-field">
                <el-text class="tc-lab">&nbsp;</el-text>
                <el-button type="primary" @click="searchReviews">
                  查询
                </el-button>
              </div>
              <div class="tc-field">
                <el-text class="tc-lab">&nbsp;</el-text>
                <el-button @click="resetReviews">重置</el-button>
              </div>
            </div>

            <div class="tc-card" :class="{ 'tc-loading': rvSt.loading }">
              <div class="tc-scroll">
                <div v-if="rvSt.loading && !rvSt.list.length" class="tc-state">
                  加载中…
                </div>
                <div v-else-if="!rvSt.list.length" class="tc-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                    <path d="M12 3a9 9 0 1 0 9 9" />
                    <path d="M12 8v4l3 2" />
                  </svg>
                  <div>暂无符合条件的用例评审</div>
                </div>
                <el-table v-else :data="rvSt.list" style="width:100%">
                  <el-table-column label="ID" min-width="120">
                    <template #default="{ row }">
                      <span class="tc-id">{{ row.id }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="评审名称" min-width="170">
                    <template #default="{ row }">
                      <span class="tc-cname" :title="row.name">{{ row.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="用例数量" min-width="92">
                    <template #default="{ row }">
                      <span class="tc-cases"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round">
                          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                          <rect x="9" y="3" width="6" height="4" rx="1" />
                        </svg><b>{{ row.caseCount }}</b></span>
                    </template>
                  </el-table-column>
                  <el-table-column label="评审状态" min-width="120">
                    <template #default="{ row }">
                      <span class="tc-pill" :class="rvStatusCls(row.status)">{{ row.status || "待评审" }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="通过率" min-width="160">
                    <template #default="{ row }">
                      <div class="rv-rate" :class="rvRateClass(row.passRate)">
                        <div class="rv-ratebar">
                          <i :style="{
                            width:
                              Math.max(0, Math.min(100, row.passRate || 0)) + '%',
                          }"></i>
                        </div>
                        <span>{{ row.passRate || 0 }}%</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="评审模式" min-width="120">
                    <template #default="{ row }">
                      <span class="tc-pill" :class="modeCls(row.mode)">{{ row.mode || "多人评审" }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="评审人" min-width="160">
                    <template #default="{ row }">
                      <div class="tc-stack">
                        <template v-if="row.reviewers?.length">
                          <span v-for="(u, i) in row.reviewers.slice(0, 4)" :key="i" class="tc-avatar"
                            :style="{ background: avatarColor(u) }" :title="u">{{ u.slice(0, 1) }}</span>
                          <span v-if="row.reviewers.length > 4" class="tc-more">+{{ row.reviewers.length - 4 }}</span>
                        </template>
                        <span v-else style="color: var(--el-text-color-placeholder, #a8abb2)">—</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="创建人" min-width="180">
                    <template #default="{ row }">
                      <div class="tc-user">
                        <span class="tc-avatar" :style="{
                          background: avatarColor(row.creator || '?'),
                        }">{{ (row.creator || "?").slice(0, 1) }}</span>
                        <span>{{ row.creator || "-" }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="所属模块" min-width="120">
                    <template #default="{ row }">
                      <span class="tc-mod">{{ row.module || "-" }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="描述" min-width="200">
                    <template #default="{ row }">
                      <span class="rv-desc" :title="row.desc">{{ row.desc || "—" }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="评审周期" min-width="300">
                    <template #default="{ row }">
                      <span class="rv-period">{{ row.period || "—" }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="创建时间" min-width="160">
                    <template #default="{ row }">
                      <span class="tc-time">{{ row.createTime || "-" }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" min-width="140">
                    <template #default="{ row }">
                      <div class="tc-ops">
                        <el-button type="primary" link @click="openReviewModal(row)">
                          编辑
                        </el-button>
                        <el-button type="danger" link @click="onDeleteReview(row)">
                          删除
                        </el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <div class="tc-foot">
                <div class="tc-total">
                  共 {{ rvSt.total }} 条评审，第 {{ rvSt.pageNum }} /
                  {{ rvSt.pages }} 页
                </div>
                <div class="tc-pager">
                  <el-pagination v-model:current-page="rvSt.pageNum" v-model:page-size="rvSt.pageSize"
                    :page-sizes="[10, 20, 50]" :total="rvSt.total" layout="sizes, prev, pager, next"
                    @current-change="loadReviews" @size-change="onRvSizeChange" />
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 用例编辑弹窗 -->
    <el-dialog v-model="caseModalVisible" :title="editingCaseId ? '编辑用例' : '新建用例'" width="520px">
      <div class="tc-form">
        <div class="tc-row">
          <el-text>用例名称<em>*</em></el-text>
          <el-input v-model="caseForm.name" maxlength="60" placeholder="请输入用例名称" />
          <div v-if="caseErr.name" class="err">{{ caseErr.name }}</div>
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
          <el-text>{{ editingCaseId ? "负责人" : "创建人" }}<em>*</em></el-text>
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

    <!-- 评审编辑弹窗 -->
    <el-dialog v-model="reviewModalVisible" :title="editingReviewId ? '编辑评审' : '新建评审'" width="560px"
      class="tc-modal tc-modal-rv">
      <div class="tc-form">
        <div class="tc-row">
          <el-text>评审名称<em>*</em></el-text>
          <el-input v-model="reviewForm.name" maxlength="60" placeholder="例如：登录鉴权-用例评审" />
          <div v-if="reviewErr.name" class="err">{{ reviewErr.name }}</div>
        </div>
        <div class="tc-row">
          <el-text>评审人<em>*</em></el-text>
          <el-input v-model="reviewForm.reviewersStr" maxlength="60" placeholder="多个评审人用逗号分隔，例如：张伟,李娜" />
          <div v-if="reviewErr.reviewers" class="err">
            {{ reviewErr.reviewers }}
          </div>
        </div>
        <div class="tc-row">
          <el-text>用例数量</el-text>
          <el-input v-model.number="reviewForm.caseCount" type="number" min="1" max="99" />
        </div>
        <div class="tc-row">
          <el-text>评审模式</el-text>
          <el-select v-model="reviewForm.mode">
            <el-option v-for="m in rvModes" :key="m.v" :value="m.v" :label="m.t" />
          </el-select>
        </div>
        <div class="tc-row">
          <el-text>所属模块</el-text>
          <el-select v-model="reviewForm.module">
            <el-option v-for="m in modules" :key="m" :value="m" :label="m" />
          </el-select>
        </div>
        <div class="tc-row">
          <el-text>评审周期</el-text>
          <div style="display: flex; gap: 8px; align-items: center">
            <el-date-picker v-model="reviewForm.startDate" type="date" value-format="YYYY-MM-DD" placeholder="开始日期"
              style="flex: 1" />
            <span style="color: var(--el-text-color-placeholder, #a8abb2)">~</span>
            <el-date-picker v-model="reviewForm.endDate" type="date" value-format="YYYY-MM-DD" placeholder="结束日期"
              style="flex: 1" />
          </div>
        </div>
        <div class="tc-row tc-full">
          <el-text>描述</el-text>
          <el-input v-model="reviewForm.desc" type="textarea" :rows="3" maxlength="200" placeholder="评审范围、关注点等（选填）" />
        </div>
      </div>
      <template #footer>
        <div class="tc-modal-foot">
          <el-button @click="reviewModalVisible = false">
            取消
          </el-button>
          <el-button type="primary" :disabled="reviewSaving" @click="saveReview">
            {{
              reviewSaving
                ? editingReviewId
                  ? "保存中…"
                  : "创建中…"
                : editingReviewId
                  ? "保存"
                  : "创建"
            }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入用例弹窗 -->
    <ImportDialog v-model="importVisible" @imported="loadCases" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { fetchCaseList, deleteCase } from "@/api/testCase";
import ImportDialog from "./components/ImportDialog.vue";

// 常量
const levels = [
  { v: "P0", t: "P0" },
  { v: "P1", t: "P1" },
  { v: "P2", t: "P2" },
  { v: "P3", t: "P3" },
];
const levelClsMap: Record<string, string> = {
  P0: "lv-p0",
  P1: "lv-p1",
  P2: "lv-p2",
  P3: "lv-p3",
};
function levelCls(l: string) {
  return levelClsMap[l] || "lv-p2";
}

const reviewLabels = [
  { v: "已通过", t: "已通过" },
  { v: "未通过", t: "未通过" },
  { v: "未评审", t: "未评审" },
  { v: "免评审", t: "免评审" },
];
const reviewClsMap: Record<string, string> = {
  已通过: "rv-pass",
  未通过: "rv-fail",
  未评审: "rv-none",
  免评审: "rv-free",
};
function reviewCls(r: string) {
  return reviewClsMap[r] || "rv-none";
}

const resultLabels = [
  { v: "通过", t: "通过" },
  { v: "失败", t: "失败" },
  { v: "阻塞", t: "阻塞" },
  { v: "未执行", t: "未执行" },
];
const resultClsMap: Record<string, string> = {
  通过: "rs-pass",
  失败: "rs-fail",
  阻塞: "rs-block",
  未执行: "rs-none",
};
function resultCls(r: string) {
  return resultClsMap[r] || "rs-none";
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

const rvStatuses = [
  { v: "待评审", t: "待评审" },
  { v: "评审中", t: "评审中" },
  { v: "已通过", t: "已通过" },
  { v: "已驳回", t: "已驳回" },
];
const rvClsMap: Record<string, string> = {
  待评审: "rv-pending",
  评审中: "rv-progress",
  已通过: "rv-passed",
  已驳回: "rv-rejected",
};
function rvStatusCls(s: string) {
  return rvClsMap[s] || "rv-pending";
}

const rvModes = [
  { v: "单人评审", t: "单人评审" },
  { v: "多人评审", t: "多人评审" },
  { v: "交叉评审", t: "交叉评审" },
  { v: "专家评审", t: "专家评审" },
];
const modeClsMap: Record<string, string> = {
  单人评审: "md-single",
  多人评审: "md-multi",
  交叉评审: "md-cross",
  专家评审: "md-expert",
};
function modeCls(m: string) {
  return modeClsMap[m] || "md-multi";
}

function rvRateClass(v: number) {
  const val = Math.max(0, Math.min(100, v || 0));
  return val === 0 ? "zero" : val >= 80 ? "hi" : val >= 60 ? "mid" : "low";
}

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

// 标签页
const tab = ref("case");
const reviewLoaded = ref(false);

function onTabChange(name: string | number) {
  if (name === "review" && !reviewLoaded.value) {
    reviewLoaded.value = true;
    loadReviews();
  }
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

// 评审列表状态
const rvSt = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  list: [] as any[],
  loading: false,
  pages: 1,
});
const rvFlt = reactive({ keyword: "", status: "" });

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

async function loadReviews() {
  rvSt.loading = true;
  try {
    // Use mock reviews from seed data
    const { createReviews } = await import("@/mocks/seed/testCase");
    const all = createReviews();
    let filtered = all;
    if (rvFlt.keyword)
      filtered = filtered.filter(
        (r) => r.name.includes(rvFlt.keyword) || r.id.includes(rvFlt.keyword),
      );
    if (rvFlt.status) {
      const statusMap: Record<string, string> = {
        待评审: "PENDING",
        评审中: "PENDING",
        已通过: "PASSED",
        已驳回: "REJECTED",
      };
      filtered = filtered.filter((r) => r.status === statusMap[rvFlt.status]);
    }
    rvSt.total = filtered.length;
    rvSt.pages = Math.max(1, Math.ceil(rvSt.total / rvSt.pageSize));
    const start = (rvSt.pageNum - 1) * rvSt.pageSize;
    rvSt.list = filtered.slice(start, start + rvSt.pageSize).map((r) => ({
      ...r,
      caseCount: r.caseCount,
      passRate: r.status === "PASSED" ? 100 : r.status === "REJECTED" ? 20 : 0,
      mode: "多人评审",
      module: modules[0],
      creator: r.reviewers?.[0] || "Administrator",
      createTime: r.startTime,
      period: `${r.startTime} ~ ${r.endTime}`,
      desc: "",
    }));
  } catch {
    rvSt.list = [];
    rvSt.total = 0;
    rvSt.pages = 1;
  } finally {
    rvSt.loading = false;
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

function searchReviews() {
  rvSt.pageNum = 1;
  loadReviews();
}
function resetReviews() {
  rvFlt.keyword = "";
  rvFlt.status = "";
  rvSt.pageNum = 1;
  rvSt.pageSize = 10;
  loadReviews();
}
function onRvSizeChange() {
  rvSt.pageNum = 1;
  loadReviews();
}

// 用例弹窗
const caseModalVisible = ref(false);
const editingCaseId = ref("");
const caseSaving = ref(false);
const importVisible = ref(false);
const caseForm = reactive({
  name: "",
  level: "P2",
  module: modules[0],
  creator: "",
});
const caseErr = reactive({ name: "", creator: "" });

function openCaseModal(row: any) {
  if (row) {
    editingCaseId.value = row.id;
    caseForm.name = row.name;
    caseForm.level = row.level || "P2";
    caseForm.module = row.module || modules[0];
    caseForm.creator = row.creator || row.executor || "";
  } else {
    editingCaseId.value = "";
    caseForm.name = "";
    caseForm.level = "P2";
    caseForm.module = modules[0];
    caseForm.creator = "";
  }
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
    // In mock mode, just show success
    ElMessage.success(editingCaseId.value ? "已保存" : "已创建");
    caseModalVisible.value = false;
    loadCases();
  } finally {
    caseSaving.value = false;
  }
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

const reviewModalVisible = ref(false);
const editingReviewId = ref("");
const reviewSaving = ref(false);
const reviewForm = reactive({
  name: "",
  reviewersStr: "",
  caseCount: 5,
  mode: "多人评审",
  module: modules[0],
  startDate: "",
  endDate: "",
  desc: "",
});
const reviewErr = reactive({ name: "", reviewers: "" });

function openReviewModal(row: any) {
  if (row) {
    editingReviewId.value = row.id;
    reviewForm.name = row.name;
    reviewForm.reviewersStr = (row.reviewers || []).join(",");
    reviewForm.caseCount = row.caseCount || 5;
    reviewForm.mode = row.mode || "多人评审";
    reviewForm.module = row.module || modules[0];
    const parts = (row.period || "").split("~");
    reviewForm.startDate = (parts[0] || "").trim();
    reviewForm.endDate = (parts[1] || "").trim();
    reviewForm.desc = row.desc || "";
  } else {
    editingReviewId.value = "";
    reviewForm.name = "";
    reviewForm.reviewersStr = "";
    reviewForm.caseCount = 5;
    reviewForm.mode = "多人评审";
    reviewForm.module = modules[0];
    reviewForm.startDate = "";
    reviewForm.endDate = "";
    reviewForm.desc = "";
  }
  reviewErr.name = "";
  reviewErr.reviewers = "";
  reviewModalVisible.value = true;
}

async function saveReview() {
  reviewErr.name = reviewForm.name.trim() ? "" : "请输入评审名称";
  reviewErr.reviewers = reviewForm.reviewersStr.trim() ? "" : "请输入评审人";
  if (!reviewForm.name.trim() || !reviewForm.reviewersStr.trim()) return;
  reviewSaving.value = true;
  try {
    ElMessage.success(editingReviewId.value ? "已保存" : "评审已创建");
    reviewModalVisible.value = false;
    if (tab.value !== "review") {
      tab.value = "review";
      reviewLoaded.value = true;
    }
    loadReviews();
  } finally {
    reviewSaving.value = false;
  }
}

async function onDeleteReview(row: any) {
  try {
    await ElMessageBox.confirm(
      `确认删除评审「${row.name}」？删除后不可恢复`,
      "删除评审",
      { type: "warning" },
    );
    ElMessage.success("已删除");
    loadReviews();
  } catch {
    /* 取消 */
  }
}

onMounted(loadCases);
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
  /* margin-bottom: 12px; */
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
  color: var(--el-text-color-primary, #303133);
}

.tc-pill {
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

.tc-stack {
  display: flex;
  align-items: center;
}

.tc-stack .tc-avatar {
  margin-right: -6px;
  border: 2px solid var(--el-bg-color, #fff);
}

.tc-more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--el-fill-color, #f0f2f5);
  font-size: 11px;
  color: var(--el-text-color-secondary, #909399);
  margin-left: 2px;
  border: 2px solid var(--el-bg-color, #fff);
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

/* 等级色 */
.lv-p0 {
  color: #ef4444;
  background: #fef2f2;
}

.lv-p1 {
  color: #f59e0b;
  background: #fffbeb;
}

.lv-p2 {
  color: #3b82f6;
  background: #eff6ff;
}

.lv-p3 {
  color: #94a3b8;
  background: #f8fafc;
}

/* 评审结果色 */
.rv-pass {
  color: #16a34a;
  background: #f0fdf4;
}

.rv-fail {
  color: #ef4444;
  background: #fef2f2;
}

.rv-none {
  color: #94a3b8;
  background: #f8fafc;
}

.rv-free {
  color: #6366f1;
  background: #eef2ff;
}

/* 执行结果色 */
.rs-pass {
  color: #16a34a;
  background: #f0fdf4;
}

.rs-fail {
  color: #ef4444;
  background: #fef2f2;
}

.rs-block {
  color: #f59e0b;
  background: #fffbeb;
}

.rs-none {
  color: #94a3b8;
  background: #f8fafc;
}

/* 评审状态 */
.rv-pending {
  color: #94a3b8;
  background: #f8fafc;
}

.rv-progress {
  color: #3b82f6;
  background: #eff6ff;
}

.rv-passed {
  color: #16a34a;
  background: #f0fdf4;
}

.rv-rejected {
  color: #ef4444;
  background: #fef2f2;
}

/* 评审模式 */
.md-single {
  color: #6366f1;
  background: #eef2ff;
}

.md-multi {
  color: #3b82f6;
  background: #eff6ff;
}

.md-cross {
  color: #f59e0b;
  background: #fffbeb;
}

.md-expert {
  color: #ef4444;
  background: #fef2f2;
}

/* 通过率 */
.rv-rate {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rv-ratebar {
  width: 80px;
  height: 6px;
  border-radius: 3px;
  background: var(--el-fill-color, #f0f2f5);
  overflow: hidden;
}

.rv-ratebar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.rv-rate.hi .rv-ratebar i {
  background: #16a34a;
}

.rv-rate.mid .rv-ratebar i {
  background: #3b82f6;
}

.rv-rate.low .rv-ratebar i {
  background: #f59e0b;
}

.rv-rate.zero .rv-ratebar i {
  background: #94a3b8;
}

.rv-rate span {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-regular, #606266);
  min-width: 32px;
}

.rv-desc {
  display: block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
}

.rv-period {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
  white-space: nowrap;
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