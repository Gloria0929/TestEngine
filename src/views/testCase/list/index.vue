<template>
  <div class="case-page">
    <div class="tc">
      <!-- 头部 -->
      <div class="tc-head">
        <div></div>
        <button class="tc-btn tc-btn-pri" @click="tab === 'case' ? openCaseModal(null) : openReviewModal(null)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {{ tab === "case" ? "新建用例" : "新建评审" }}
        </button>
      </div>

      <!-- 标签页 -->
      <div class="tc-tabs">
        <button class="tc-tab" :class="{ on: tab === 'case' }" @click="tab = 'case'">
          用例列表
        </button>
        <button class="tc-tab" :class="{ on: tab === 'review' }" @click="switchToReview">
          用例评审
        </button>
      </div>

      <!-- 用例列表面板 -->
      <div v-show="tab === 'case'" class="tc-pane" :class="{ on: tab === 'case' }">
        <div class="tc-bar">
          <div class="tc-field">
            <label class="tc-lab">关键词</label><input class="tc-in" style="width: 220px" v-model="flt.keyword"
              placeholder="搜索 ID 或用例名称" @keyup.enter="searchCases" />
          </div>
          <div class="tc-field">
            <label class="tc-lab">用例等级</label><select class="tc-sel" style="width: 110px" v-model="flt.level"
              @change="searchCases">
              <option value="">全部</option>
              <option v-for="l in levels" :key="l.v" :value="l.v">
                {{ l.t }}
              </option>
            </select>
          </div>
          <div class="tc-field">
            <label class="tc-lab">评审结果</label><select class="tc-sel" style="width: 120px" v-model="flt.review"
              @change="searchCases">
              <option value="">全部</option>
              <option v-for="r in reviewLabels" :key="r.v" :value="r.v">
                {{ r.t }}
              </option>
            </select>
          </div>
          <div class="tc-field">
            <label class="tc-lab">执行结果</label><select class="tc-sel" style="width: 120px" v-model="flt.result"
              @change="searchCases">
              <option value="">全部</option>
              <option v-for="r in resultLabels" :key="r.v" :value="r.v">
                {{ r.t }}
              </option>
            </select>
          </div>
          <div class="tc-field">
            <label class="tc-lab">所属模块</label><select class="tc-sel" style="width: 130px" v-model="flt.module"
              @change="searchCases">
              <option value="">全部</option>
              <option v-for="m in modules" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div class="tc-spacer" />
          <div class="tc-field">
            <label class="tc-lab">&nbsp;</label><button class="tc-btn tc-btn-pri" @click="searchCases">
              查询
            </button>
          </div>
          <div class="tc-field">
            <label class="tc-lab">&nbsp;</label><button class="tc-btn" @click="resetCases">重置</button>
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
            <table v-else class="tc-tb">
              <thead>
                <tr>
                  <th style="width: 90px">ID</th>
                  <th style="min-width: 220px">用例名称</th>
                  <th style="width: 90px">用例等级</th>
                  <th style="width: 100px">评审结果</th>
                  <th style="width: 100px">执行结果</th>
                  <th style="width: 120px">所属模块</th>
                  <th style="width: 130px">更新人</th>
                  <th style="width: 160px">更新时间</th>
                  <th style="width: 130px">创建人</th>
                  <th style="width: 160px">创建时间</th>
                  <th style="width: 110px">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in st.list" :key="row.id">
                  <td class="tc-id">{{ row.id }}</td>
                  <td>
                    <span class="tc-cname" :title="row.name">{{
                      row.name
                    }}</span>
                  </td>
                  <td>
                    <span class="tc-pill" :class="levelCls(row.level)">{{
                      row.level || "-"
                    }}</span>
                  </td>
                  <td>
                    <span class="tc-pill" :class="reviewCls((row as any).review)">{{ (row as any).review || "未评审"
                    }}</span>
                  </td>
                  <td>
                    <span class="tc-pill" :class="resultCls((row as any).result)">{{ (row as any).result || "未执行"
                    }}</span>
                  </td>
                  <td>
                    <span class="tc-mod">{{ (row as any).module || "-" }}</span>
                  </td>
                  <td>
                    <div class="tc-user">
                      <span class="tc-avatar" :style="{
                        background: avatarColor((row as any).updater || '?'),
                      }">{{ ((row as any).updater || "?").slice(0, 1) }}</span><span>{{ (row as any).updater || "-"
                      }}</span>
                    </div>
                  </td>
                  <td class="tc-time">{{ (row as any).updateTime || "-" }}</td>
                  <td>
                    <div class="tc-user">
                      <span class="tc-avatar" :style="{
                        background: avatarColor((row as any).creator || '?'),
                      }">{{ ((row as any).creator || "?").slice(0, 1) }}</span><span>{{ (row as any).creator || "-"
                      }}</span>
                    </div>
                  </td>
                  <td class="tc-time">{{ row.createTime || "-" }}</td>
                  <td>
                    <div class="tc-ops">
                      <button class="tc-op" @click="openCaseModal(row)">
                        编辑
                      </button>
                      <button class="tc-op tc-op-del" @click="onDeleteCase(row)">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="tc-foot">
            <div class="tc-total">
              共 {{ st.total }} 条用例，第 {{ st.pageNum }} / {{ st.pages }} 页
            </div>
            <div class="tc-pager">
              <span class="tc-size">每页</span>
              <select class="tc-sel" style="width: 74px" :value="st.pageSize" @change="onCasePageSize">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span class="tc-size">条</span>
              <span style="width: 8px"></span>
              <button class="tc-pg" :disabled="st.pageNum <= 1" @click="goCasePage(st.pageNum - 1)">
                上一页
              </button>
              <template v-for="p in casePageNumbers" :key="p">
                <button v-if="p === '...'" class="tc-pg" disabled>…</button>
                <button v-else class="tc-pg" :class="{ on: p === st.pageNum }" @click="goCasePage(p as number)">
                  {{ p }}
                </button>
              </template>
              <button class="tc-pg" :disabled="st.pageNum >= st.pages" @click="goCasePage(st.pageNum + 1)">
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 用例评审面板 -->
      <div v-show="tab === 'review'" class="tc-pane" :class="{ on: tab === 'review' }">
        <div class="tc-bar">
          <div class="tc-field">
            <label class="tc-lab">关键词</label><input class="tc-in" style="width: 220px" v-model="rvFlt.keyword"
              placeholder="搜索评审 ID 或名称" @keyup.enter="searchReviews" />
          </div>
          <div class="tc-field">
            <label class="tc-lab">评审状态</label><select class="tc-sel" style="width: 120px" v-model="rvFlt.status"
              @change="searchReviews">
              <option value="">全部</option>
              <option v-for="s in rvStatuses" :key="s.v" :value="s.v">
                {{ s.t }}
              </option>
            </select>
          </div>
          <div class="tc-spacer" />
          <div class="tc-field">
            <label class="tc-lab">&nbsp;</label><button class="tc-btn tc-btn-pri" @click="searchReviews">
              查询
            </button>
          </div>
          <div class="tc-field">
            <label class="tc-lab">&nbsp;</label><button class="tc-btn" @click="resetReviews">重置</button>
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
            <table v-else class="tc-tb">
              <thead>
                <tr>
                  <th style="width: 120px">ID</th>
                  <th style="min-width: 170px">评审名称</th>
                  <th style="width: 92px">用例数量</th>
                  <th style="width: 96px">评审状态</th>
                  <th style="width: 120px">通过率</th>
                  <th style="width: 96px">评审模式</th>
                  <th style="width: 160px">评审人</th>
                  <th style="width: 110px">创建人</th>
                  <th style="width: 104px">所属模块</th>
                  <th style="min-width: 200px">描述</th>
                  <th style="width: 168px">评审周期</th>
                  <th style="width: 160px">创建时间</th>
                  <th style="width: 100px">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in rvSt.list" :key="r.id">
                  <td class="tc-id">{{ r.id }}</td>
                  <td>
                    <span class="tc-cname" :title="r.name">{{ r.name }}</span>
                  </td>
                  <td>
                    <span class="tc-cases"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                      </svg><b>{{ r.caseCount }}</b></span>
                  </td>
                  <td>
                    <span class="tc-pill" :class="rvStatusCls(r.status)">{{
                      r.status || "待评审"
                    }}</span>
                  </td>
                  <td>
                    <div class="rv-rate" :class="rvRateClass(r.passRate)">
                      <div class="rv-ratebar">
                        <i :style="{
                          width:
                            Math.max(0, Math.min(100, r.passRate || 0)) + '%',
                        }"></i>
                      </div>
                      <span>{{ r.passRate || 0 }}%</span>
                    </div>
                  </td>
                  <td>
                    <span class="tc-pill" :class="modeCls((r as any).mode)">{{
                      (r as any).mode || "多人评审"
                    }}</span>
                  </td>
                  <td>
                    <div class="tc-stack">
                      <template v-if="r.reviewers?.length">
                        <span v-for="(u, i) in r.reviewers.slice(0, 4)" :key="i" class="tc-avatar"
                          :style="{ background: avatarColor(u) }" :title="u">{{ u.slice(0, 1) }}</span>
                        <span v-if="r.reviewers.length > 4" class="tc-more">+{{ r.reviewers.length - 4 }}</span>
                      </template>
                      <span v-else style="color: var(--el-text-color-placeholder, #a8abb2)">—</span>
                    </div>
                  </td>
                  <td>
                    <div class="tc-user">
                      <span class="tc-avatar" :style="{
                        background: avatarColor((r as any).creator || '?'),
                      }">{{ ((r as any).creator || "?").slice(0, 1) }}</span><span>{{ (r as any).creator || "-"
                      }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="tc-mod">{{ (r as any).module || "-" }}</span>
                  </td>
                  <td>
                    <span class="rv-desc" :title="(r as any).desc">{{
                      (r as any).desc || "—"
                    }}</span>
                  </td>
                  <td>
                    <span class="rv-period">{{
                      (r as any).period || "—"
                    }}</span>
                  </td>
                  <td class="tc-time">{{ r.createTime || "-" }}</td>
                  <td>
                    <div class="tc-ops">
                      <button class="tc-op" @click="openReviewModal(r)">
                        编辑
                      </button>
                      <button class="tc-op tc-op-del" @click="onDeleteReview(r)">
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="tc-foot">
            <div class="tc-total">
              共 {{ rvSt.total }} 条评审，第 {{ rvSt.pageNum }} /
              {{ rvSt.pages }} 页
            </div>
            <div class="tc-pager">
              <span class="tc-size">每页</span>
              <select class="tc-sel" style="width: 74px" :value="rvSt.pageSize" @change="onRvPageSize">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span class="tc-size">条</span>
              <span style="width: 8px"></span>
              <button class="tc-pg" :disabled="rvSt.pageNum <= 1" @click="goRvPage(rvSt.pageNum - 1)">
                上一页
              </button>
              <template v-for="p in rvPageNumbers" :key="p">
                <button v-if="p === '...'" class="tc-pg" disabled>…</button>
                <button v-else class="tc-pg" :class="{ on: p === rvSt.pageNum }" @click="goRvPage(p as number)">
                  {{ p }}
                </button>
              </template>
              <button class="tc-pg" :disabled="rvSt.pageNum >= rvSt.pages" @click="goRvPage(rvSt.pageNum + 1)">
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用例编辑弹窗 -->
    <div v-if="caseModalVisible" class="tc-mask" @click.self="caseModalVisible = false">
      <div class="tc-modal">
        <h3>{{ editingCaseId ? "编辑用例" : "新建用例" }}</h3>
        <div class="tc-form">
          <div class="tc-row">
            <label>用例名称<em>*</em></label><input v-model="caseForm.name" maxlength="60" placeholder="请输入用例名称" />
            <div v-if="caseErr.name" class="err">{{ caseErr.name }}</div>
          </div>
          <div class="tc-row">
            <label>用例等级</label><select v-model="caseForm.level">
              <option v-for="l in levels" :key="l.v" :value="l.v">
                {{ l.t }}
              </option>
            </select>
          </div>
          <div class="tc-row">
            <label>所属模块</label><select v-model="caseForm.module">
              <option v-for="m in modules" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div class="tc-row">
            <label>{{ editingCaseId ? "负责人" : "创建人" }}<em>*</em></label><input v-model="caseForm.creator" maxlength="20"
              placeholder="请输入负责人" />
            <div v-if="caseErr.creator" class="err">{{ caseErr.creator }}</div>
          </div>
        </div>
        <div class="tc-modal-foot">
          <button class="tc-btn" @click="caseModalVisible = false">取消</button>
          <button class="tc-btn tc-btn-pri" :disabled="caseSaving" @click="saveCase">
            {{ caseSaving ? "保存中…" : "保存" }}
          </button>
        </div>
      </div>
    </div>

    <!-- 评审编辑弹窗 -->
    <div v-if="reviewModalVisible" class="tc-mask tc-modal-rv" @click.self="reviewModalVisible = false">
      <div class="tc-modal">
        <h3>{{ editingReviewId ? "编辑评审" : "新建评审" }}</h3>
        <div class="tc-form">
          <div class="tc-row">
            <label>评审名称<em>*</em></label><input v-model="reviewForm.name" maxlength="60" placeholder="例如：登录鉴权-用例评审" />
            <div v-if="reviewErr.name" class="err">{{ reviewErr.name }}</div>
          </div>
          <div class="tc-row">
            <label>评审人<em>*</em></label><input v-model="reviewForm.reviewersStr" maxlength="60"
              placeholder="多个评审人用逗号分隔，例如：张伟,李娜" />
            <div v-if="reviewErr.reviewers" class="err">
              {{ reviewErr.reviewers }}
            </div>
          </div>
          <div class="tc-row">
            <label>用例数量</label><input v-model.number="reviewForm.caseCount" type="number" min="1" max="99" />
          </div>
          <div class="tc-row">
            <label>评审模式</label><select v-model="reviewForm.mode">
              <option v-for="m in rvModes" :key="m.v" :value="m.v">
                {{ m.t }}
              </option>
            </select>
          </div>
          <div class="tc-row">
            <label>所属模块</label><select v-model="reviewForm.module">
              <option v-for="m in modules" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div class="tc-row">
            <label>评审周期</label>
            <div style="display: flex; gap: 8px; align-items: center">
              <input v-model="reviewForm.startDate" type="date" style="flex: 1" /><span
                style="color: var(--el-text-color-placeholder, #a8abb2)">~</span><input v-model="reviewForm.endDate"
                type="date" style="flex: 1" />
            </div>
          </div>
          <div class="tc-row tc-full">
            <label>描述</label><textarea v-model="reviewForm.desc" maxlength="200" placeholder="评审范围、关注点等（选填）"></textarea>
          </div>
        </div>
        <div class="tc-modal-foot">
          <button class="tc-btn" @click="reviewModalVisible = false">
            取消
          </button>
          <button class="tc-btn tc-btn-pri" :disabled="reviewSaving" @click="saveReview">
            {{
              reviewSaving
                ? editingReviewId
                  ? "保存中…"
                  : "创建中…"
                : editingReviewId
                  ? "保存"
                  : "创建"
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { fetchCaseList, deleteCase } from "@/api/testCase";
import type { TestCase } from "@/types/models";

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

function pageNums(cur: number, tot: number) {
  const list: (number | string)[] = [];
  for (let i = 1; i <= tot; i++) {
    if (i === 1 || i === tot || Math.abs(i - cur) <= 1) list.push(i);
    else if (list[list.length - 1] !== "...") list.push("...");
  }
  return list;
}
const casePageNumbers = computed(() => pageNums(st.pageNum, st.pages));
const rvPageNumbers = computed(() => pageNums(rvSt.pageNum, rvSt.pages));

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
function goCasePage(p: number) {
  if (p >= 1 && p <= st.pages && p !== st.pageNum) {
    st.pageNum = p;
    loadCases();
  }
}
function onCasePageSize(e: Event) {
  st.pageSize = parseInt((e.target as HTMLSelectElement).value, 10) || 10;
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
function goRvPage(p: number) {
  if (p >= 1 && p <= rvSt.pages && p !== rvSt.pageNum) {
    rvSt.pageNum = p;
    loadReviews();
  }
}
function onRvPageSize(e: Event) {
  rvSt.pageSize = parseInt((e.target as HTMLSelectElement).value, 10) || 10;
  rvSt.pageNum = 1;
  loadReviews();
}

function switchToReview() {
  tab.value = "review";
  if (!reviewLoaded.value) {
    reviewLoaded.value = true;
    loadReviews();
  }
}

// 用例弹窗
const caseModalVisible = ref(false);
const editingCaseId = ref("");
const caseSaving = ref(false);
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
    caseForm.module = (row as any).module || modules[0];
    caseForm.creator = (row as any).creator || row.executor || "";
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
    reviewForm.mode = (row as any).mode || "多人评审";
    reviewForm.module = (row as any).module || modules[0];
    const parts = ((row as any).period || "").split("~");
    reviewForm.startDate = (parts[0] || "").trim();
    reviewForm.endDate = (parts[1] || "").trim();
    reviewForm.desc = (row as any).desc || "";
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

<style>
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
}

.tc-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 14px;
  height: 32px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-regular, #606266);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tc-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.tc-btn-pri {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.tc-btn-pri:hover {
  background: var(--accent-hover);
  color: #fff;
}

.tc-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--el-border-color-light, #e4e7ed);
  margin-bottom: 16px;
}

.tc-tab {
  padding: 8px 20px;
  border: none;
  background: none;
  font-size: 14px;
  color: var(--el-text-color-regular, #606266);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tc-tab:hover {
  color: var(--accent);
}

.tc-tab.on {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 600;
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
  margin-bottom: 12px;
}

.tc-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tc-lab {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  line-height: 1;
}

.tc-in,
.tc-sel {
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  font-size: 13px;
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-regular, #606266);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.tc-in:focus,
.tc-sel:focus {
  border-color: var(--accent);
}

.tc-sel {
  appearance: auto;
  padding-right: 24px;
}

.tc-spacer {
  flex: 1;
}

.tc-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  border-radius: 8px;
  background: var(--el-bg-color, #fff);
  overflow: hidden;
}

.tc-scroll {
  flex: 1;
  overflow: auto;
}

.tc-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 0;
  color: var(--el-text-color-placeholder, #a8abb2);
  font-size: 13px;
}

.tc-state svg {
  width: 40px;
  height: 40px;
  opacity: 0.35;
}

.tc-tb {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.tc-tb th {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  background: var(--el-fill-color-light, #f5f7fa);
  border-bottom: 1px solid var(--el-border-color-light, #e4e7ed);
  white-space: nowrap;
}

.tc-tb td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  color: var(--el-text-color-regular, #606266);
  vertical-align: middle;
}

.tc-tb tbody tr:hover {
  background: var(--el-fill-color-lighter, #fafafa);
}

.tc-id {
  font-family: "SF Mono", "Menlo", "Monaco", "Courier New", monospace;
  font-size: 12px;
  color: var(--el-text-color-placeholder, #a8abb2);
}

.tc-cname {
  cursor: pointer;
  color: var(--accent);
}

.tc-cname:hover {
  text-decoration: underline;
}

.tc-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.tc-mod {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
}

.tc-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder, #a8abb2);
  white-space: nowrap;
}

.tc-user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.tc-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}

.tc-stack {
  display: flex;
  align-items: center;
  gap: -6px;
}

.tc-stack .tc-avatar {
  margin-right: -6px;
  border: 2px solid var(--el-bg-color, #fff);
}

.tc-more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
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
  gap: 4px;
  color: var(--el-text-color-regular, #606266);
}

.tc-cases svg {
  opacity: 0.5;
}

.tc-ops {
  display: flex;
  gap: 6px;
}

.tc-op {
  border: none;
  background: none;
  color: var(--accent);
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}

.tc-op:hover {
  text-decoration: underline;
}

.tc-op-del {
  color: var(--el-color-danger, #f56c6c);
}

.tc-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid var(--el-border-color-light, #e4e7ed);
  flex-shrink: 0;
}

.tc-total {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
}

.tc-pager {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tc-size {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
}

.tc-pg {
  min-width: 32px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 4px;
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-regular, #606266);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tc-pg:hover:not(:disabled) {
  color: var(--accent);
  border-color: var(--accent);
}

.tc-pg.on {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.tc-pg:disabled {
  opacity: 0.4;
  cursor: default;
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
  font-size: 12px;
  color: var(--el-text-color-placeholder, #a8abb2);
  white-space: nowrap;
}

/* 弹窗 */
.tc-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.tc-modal {
  background: var(--el-bg-color, #fff);
  border-radius: 12px;
  padding: 24px;
  width: 520px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.tc-modal-rv .tc-modal {
  width: 560px;
}

.tc-modal h3 {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
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

.tc-row label {
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  font-weight: 500;
}

.tc-row label em {
  color: var(--el-color-danger, #f56c6c);
  font-style: normal;
  margin-left: 2px;
}

.tc-row input,
.tc-row select,
.tc-row textarea {
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  font-size: 13px;
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-regular, #606266);
  outline: none;
  box-sizing: border-box;
}

.tc-row textarea {
  height: 80px;
  padding: 8px 10px;
  resize: vertical;
  font-family: inherit;
}

.tc-row input:focus,
.tc-row select:focus,
.tc-row textarea:focus {
  border-color: var(--accent);
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
  border-top: 1px solid var(--el-border-color-light, #e4e7ed);
}
</style>
