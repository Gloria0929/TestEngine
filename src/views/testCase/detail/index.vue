<template>
  <div v-if="detail" class="cd-page">
    <!-- 顶部：返回 + 页签导航 -->
    <div class="cd-top">
      <el-button link class="cd-back" @click="router.back()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </el-button>
      <el-tabs v-model="tab" class="cd-tabs">
        <el-tab-pane label="基本信息" name="base" />
        <el-tab-pane label="详情" name="detail" />
        <el-tab-pane label="用例" name="cases" />
        <el-tab-pane label="缺陷" name="bugs" />
        <el-tab-pane label="依赖关系" name="deps" />
        <el-tab-pane label="用例评审" name="reviews" />
        <el-tab-pane label="测试计划" name="plans" />
      </el-tabs>
    </div>

    <!-- 基本信息 -->
    <template v-if="tab === 'base'">
      <div class="cd-card">
        <div class="cd-sec-head">
          <span class="cd-sec-title">基本信息</span>
          <el-button v-if="!baseEditing" link type="primary" @click="startBaseEdit">
            <svg class="cd-edit-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            内容编辑
          </el-button>
        </div>
        <div v-if="!baseEditing" class="cd-desc">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="用例 ID"><span class="cd-mono">{{ detail.id }}</span></el-descriptions-item>
            <el-descriptions-item label="用例名称" :span="2">{{ detail.name }}</el-descriptions-item>
            <el-descriptions-item label="所属模块">{{ moduleName(detail.moduleId) }}</el-descriptions-item>
            <el-descriptions-item label="用例等级"><span class="cd-level" :class="'lv-' + detail.level.toLowerCase()">{{
              detail.level }}</span></el-descriptions-item>
            <el-descriptions-item label="创建人">{{ detail.createUser }}</el-descriptions-item>
            <el-descriptions-item label="用例状态">{{ statusLabel(detail.status) }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ detail.executor || '-' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间"><span class="cd-mono">{{ detail.updateTime
                }}</span></el-descriptions-item>
            <el-descriptions-item label="标签" :span="3">
              <template v-if="detail.tags.length">
                <el-tag v-for="t in detail.tags" :key="t" effect="plain" size="small" class="cd-tag">{{ t }}</el-tag>
              </template>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div v-else class="cd-form">
          <div class="cd-row">
            <el-text>用例名称<em>*</em></el-text>
            <el-input v-model="baseForm.name" maxlength="80" placeholder="请输入用例名称" />
            <div v-if="baseErr.name" class="cd-err">{{ baseErr.name }}</div>
          </div>
          <div class="cd-form-grid">
            <div class="cd-row">
              <el-text>用例等级</el-text>
              <el-select v-model="baseForm.level">
                <el-option v-for="l in LEVELS" :key="l" :value="l" :label="l" />
              </el-select>
            </div>
            <div class="cd-row">
              <el-text>所属模块</el-text>
              <el-select v-model="baseForm.moduleId">
                <el-option v-for="m in moduleOptions" :key="m.id" :value="m.id" :label="m.label" />
              </el-select>
            </div>
            <div class="cd-row">
              <el-text>负责人</el-text>
              <el-input v-model="baseForm.executor" maxlength="20" placeholder="选择或输入负责人" />
            </div>
            <div class="cd-row">
              <el-text>标签</el-text>
              <el-input v-model="baseForm.tagsStr" maxlength="60" placeholder="多个标签用逗号分隔" />
            </div>
          </div>
          <div class="cd-save-row">
            <el-button @click="baseEditing = false">取消</el-button>
            <el-button type="primary" :disabled="baseSaving" @click="saveBase">{{ baseSaving ? '保存中…' : '保存'
            }}</el-button>
          </div>
        </div>
      </div>
    </template>

    <!-- 详情：前置条件 + 步骤描述 -->
    <template v-else-if="tab === 'detail'">
      <div class="cd-card">
        <div class="cd-sec-head">
          <span class="cd-sec-title">测试目的</span>
          <el-button v-if="!editing" link type="primary" @click="editing = true">
            <svg class="cd-edit-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            内容编辑
          </el-button>
        </div>
        <el-input v-if="editing" v-model="editForm.purpose" type="textarea" :rows="3" maxlength="500"
          placeholder="描述用例的测试目的（选填）" class="cd-rich" />
        <div v-else class="cd-richtext">{{ detail.purpose || '-' }}</div>

        <div class="cd-sec-head" style="margin-top: 20px">
          <span class="cd-sec-title">前置条件</span>
        </div>
        <el-input v-if="editing" v-model="editForm.precondition" type="textarea" :rows="3" maxlength="500"
          placeholder="描述执行本用例前需满足的条件" class="cd-rich" />
        <div v-else class="cd-richtext">{{ detail.precondition || '-' }}</div>

        <div v-if="editing" class="cd-save-row">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" :disabled="detailSaving" @click="saveDesc">{{ detailSaving ? '保存中…' : '保存'
            }}</el-button>
        </div>

        <div class="cd-sec-head" style="margin-top: 24px">
          <span class="cd-sec-title">步骤描述</span>
        </div>
        <div class="cd-grid cd-grid-head">
          <span class="g-drag" />
          <span>序号</span>
          <span>用例步骤</span>
          <span>预期结果</span>
          <span>操作</span>
        </div>
        <div v-for="(s, i) in steps" :key="s.id" class="cd-grid cd-grid-row"
          :class="{ 'cd-dragging': dragIdx === i, 'cd-drag-over': overIdx === i && dragIdx !== i }"
          :draggable="dragArmed === i" @dragstart="onDragStart(i, $event)" @dragover.prevent="overIdx = i"
          @dragleave="overIdx = -1" @drop.prevent="onDrop" @dragend="resetDrag">
          <span class="g-drag" title="拖拽排序" @mousedown="dragArmed = i" @mouseup="dragArmed = -1">
            <svg width="12" height="16" viewBox="0 0 10 16" fill="currentColor">
              <circle cx="2" cy="3" r="1.3" />
              <circle cx="8" cy="3" r="1.3" />
              <circle cx="2" cy="8" r="1.3" />
              <circle cx="8" cy="8" r="1.3" />
              <circle cx="2" cy="13" r="1.3" />
              <circle cx="8" cy="13" r="1.3" />
            </svg>
          </span>
          <span><i class="cd-idx">{{ i + 1 }}</i></span>
          <div class="g-cell">
            <el-input v-model="s.description" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" placeholder="请输入步骤"
              class="cd-cell-input" />
          </div>
          <div class="g-cell">
            <el-input v-model="s.expected" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" placeholder="请输入预期"
              class="cd-cell-input" />
          </div>
          <div class="g-op">
            <el-dropdown trigger="click" @command="(cmd: string) => onStepCmd(cmd, i)">
              <el-button link class="cd-more">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="1.6" />
                  <circle cx="12" cy="12" r="1.6" />
                  <circle cx="19" cy="12" r="1.6" />
                </svg>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="above">上方插入步骤</el-dropdown-item>
                  <el-dropdown-item command="below">下方插入步骤</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <div class="cd-save-row">
          <el-button type="primary" :disabled="stepSaving" @click="saveSteps">{{ stepSaving ? '保存中…' : '保存步骤'
            }}</el-button>
        </div>
      </div>
    </template>

    <!-- 用例：关联用例 -->
    <template v-else-if="tab === 'cases'">
      <div class="cd-card">
        <div class="cd-bar">
          <el-button type="primary" @click="openPickDialog('related')">关联用例</el-button>
          <span class="cd-spacer" />
          <el-input v-model="caseKw" style="width: 240px" placeholder="通过名称搜索" clearable :prefix-icon="SearchIcon" />
        </div>
        <el-table v-if="filteredRelated.length" :data="filteredRelated">
          <el-table-column label="ID" min-width="110">
            <template #default="{ row }"><span class="cd-mono">{{ row.id }}</span></template>
          </el-table-column>
          <el-table-column prop="name" label="用例名称" min-width="240" />
          <el-table-column label="所属项目" min-width="140">
            <template #default="{ row }">{{ projectName(row.projectId) }}</template>
          </el-table-column>
          <el-table-column label="操作" min-width="100">
            <template #default="{ row }">
              <el-button link type="danger" @click="removeRelated(row.id)">取消关联</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="cd-empty-line">暂无数据，请 <el-button link type="primary"
            @click="openPickDialog('related')">关联用例</el-button>
        </div>
      </div>
    </template>

    <!-- 缺陷 -->
    <template v-else-if="tab === 'bugs'">
      <div class="cd-card">
        <div class="cd-bar">
          <el-radio-group v-model="bugMode">
            <el-radio-button value="direct">直接关联</el-radio-button>
            <el-radio-button value="plan">测试计划</el-radio-button>
          </el-radio-group>
          <el-input v-model="bugKw" style="width: 240px" placeholder="通过名称搜索" clearable :prefix-icon="SearchIcon" />
          <template v-if="bugMode === 'direct'">
            <span class="cd-spacer" />
            <el-button type="primary" @click="openPickDialog('bug')">关联缺陷</el-button>
            <el-button @click="bugCreateVisible = true">新建缺陷</el-button>
          </template>
        </div>
        <el-table v-if="filteredBugs.length" :data="filteredBugs">
          <el-table-column label="ID" min-width="110">
            <template #default="{ row }"><span class="cd-mono">{{ row.id }}</span></template>
          </el-table-column>
          <el-table-column prop="title" label="缺陷名称" min-width="260" />
          <el-table-column label="缺陷状态" min-width="110">
            <template #default="{ row }">
              <span class="cd-pill" :class="bugCls(row.status)">{{ bugLabel(row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="reporter" label="创建人" min-width="120" />
          <el-table-column v-if="bugMode === 'direct'" label="操作" min-width="100">
            <template #default="{ row }">
              <el-button link type="danger" @click="unlinkBug(row.id)">取消关联</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="cd-empty-line">暂无数据，请
          <template v-if="bugMode === 'direct'">
            <el-button link type="primary" @click="openPickDialog('bug')">关联缺陷</el-button> 或
            <el-button link type="primary" @click="bugCreateVisible = true">新建缺陷</el-button>
          </template>
          <template v-else>切换到「直接关联」查看</template>
        </div>
      </div>
    </template>

    <!-- 依赖关系 -->
    <template v-else-if="tab === 'deps'">
      <div class="cd-card">
        <div class="cd-bar">
          <el-button type="primary" @click="openPickDialog(depDir)">添加{{ depDir === 'pre' ? '前置' : '后置' }}用例</el-button>
          <span class="cd-spacer" />
          <el-radio-group v-model="depDir">
            <el-radio-button value="pre">前置用例</el-radio-button>
            <el-radio-button value="post">后置用例</el-radio-button>
          </el-radio-group>
          <el-input v-model="depKw" style="width: 240px" placeholder="通过名称搜索" clearable :prefix-icon="SearchIcon" />
        </div>
        <el-table v-if="filteredDeps.length" :data="filteredDeps">
          <el-table-column label="ID" min-width="110">
            <template #default="{ row }"><span class="cd-mono">{{ row.id }}</span></template>
          </el-table-column>
          <el-table-column prop="name" label="用例名称" min-width="260" />
          <el-table-column prop="createUser" label="创建人" min-width="120" />
          <el-table-column label="操作" min-width="100">
            <template #default="{ row }">
              <el-button link type="danger" @click="removeDep(row.id)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="cd-empty-line">暂无数据，请
          <el-button link type="primary" @click="openPickDialog(depDir)">添加{{ depDir === 'pre' ? '前置' : '后置'
            }}用例</el-button>
        </div>
      </div>
    </template>

    <!-- 用例评审 -->
    <template v-else-if="tab === 'reviews'">
      <div class="cd-card">
        <div class="cd-bar">
          <span class="cd-sec-title">用例评审列表</span>
          <span class="cd-spacer" />
          <el-input v-model="reviewKw" style="width: 240px" placeholder="通过 ID/名称搜索" clearable
            :prefix-icon="SearchIcon" />
        </div>
        <el-table v-if="filteredReviews.length" :data="filteredReviews">
          <el-table-column label="ID" min-width="110">
            <template #default="{ row }"><span class="cd-mono">{{ row.id }}</span></template>
          </el-table-column>
          <el-table-column prop="name" label="评审名称" min-width="240" sortable />
          <el-table-column label="评审状态" min-width="110">
            <template #default="{ row }">
              <span class="cd-pill" :class="rvCls(row.status)">{{ rvLabel(row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="评审结果" min-width="110">
            <template #default="{ row }">{{ rvLabel(row.status) }}</template>
          </el-table-column>
          <el-table-column label="评审人" min-width="160">
            <template #default="{ row }">{{ row.reviewers.join('、') || '-' }}</template>
          </el-table-column>
        </el-table>
        <div v-else class="cd-empty-line">暂无数据</div>
      </div>
    </template>

    <!-- 测试计划 -->
    <template v-else-if="tab === 'plans'">
      <div class="cd-card">
        <div class="cd-empty-block">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path d="M8 2v4M16 2v4M3 10h18" />
          </svg>
          <div>暂无关联测试计划</div>
        </div>
      </div>
    </template>

    <!-- 关联选择弹窗（用例 / 依赖 / 缺陷共用） -->
    <el-dialog v-model="pickVisible" :title="pickTitle" width="620px" destroy-on-close>
      <el-input v-model="pickKw" style="width: 240px; margin-bottom: 12px" placeholder="通过名称搜索" clearable
        :prefix-icon="SearchIcon" />
      <el-table :data="pickRows" v-loading="pickLoading" max-height="360" @selection-change="onPickSel">
        <el-table-column type="selection" width="44" />
        <el-table-column label="ID" min-width="100">
          <template #default="{ row }"><span class="cd-mono">{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column :prop="pickType === 'bug' ? 'title' : 'name'" :label="pickType === 'bug' ? '缺陷名称' : '用例名称'"
          min-width="240" />
        <el-table-column v-if="pickType !== 'bug'" prop="createUser" label="创建人" min-width="110" />
      </el-table>
      <template #footer>
        <el-button @click="pickVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!pickSel.length" @click="confirmPick">确认关联</el-button>
      </template>
    </el-dialog>

    <!-- 新建缺陷弹窗 -->
    <el-dialog v-model="bugCreateVisible" title="新建缺陷" width="520px" destroy-on-close>
      <div class="cd-form">
        <div class="cd-row">
          <el-text>缺陷标题<em>*</em></el-text>
          <el-input v-model="bugForm.title" maxlength="80" placeholder="简要描述缺陷" />
        </div>
        <div class="cd-row">
          <el-text>严重程度</el-text>
          <el-select v-model="bugForm.severity">
            <el-option v-for="s in SEVERITIES" :key="s.v" :label="s.t" :value="s.v" />
          </el-select>
        </div>
        <div class="cd-row">
          <el-text>处理人</el-text>
          <el-input v-model="bugForm.assignee" maxlength="20" placeholder="选择或输入处理人" />
        </div>
      </div>
      <template #footer>
        <el-button @click="bugCreateVisible = false">取消</el-button>
        <el-button type="primary" :disabled="bugCreating" @click="createBugAndLink">{{ bugCreating ? '创建中…' : '创建并关联'
          }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search as SearchIcon } from '@element-plus/icons-vue';
import { fetchCase, fetchCaseList, updateCase } from '@/api/testCase';
import { fetchBugs, createBug } from '@/api/bug';
import { fetchModuleTree, fetchReviews } from '@/api/testCase';
import type { TestCase, CaseStep, Bug, BugSeverity, BugStatus, Review, ModuleNode, CaseStatus } from '@/types/models';
import { useDragSort } from '@/composables/useDragSort';

const route = useRoute();
const router = useRouter();
const caseId = computed(() => String(route.params.id));

const tab = ref('base');
const detail = ref<TestCase | null>(null);
const modules = ref<ModuleNode[]>([]);
const reviews = ref<Review[]>([]);

const editing = ref(false);
const detailSaving = ref(false);
const stepSaving = ref(false);
const editForm = reactive({ purpose: '', precondition: '' });
const steps = ref<CaseStep[]>([]);

/* 基本信息编辑 */
const LEVELS = ['P0', 'P1', 'P2', 'P3'] as const;
const baseEditing = ref(false);
const baseSaving = ref(false);
const baseForm = reactive({
  name: '',
  level: 'P1' as (typeof LEVELS)[number],
  moduleId: '',
  executor: '',
  tagsStr: '',
});
const baseErr = reactive({ name: '' });

const moduleOptions = computed(() => {
  const opts: Array<{ id: string; label: string }> = [];
  const walk = (ns: ModuleNode[], depth: number) => {
    for (const n of ns) {
      opts.push({ id: n.id, label: (depth ? '　'.repeat(depth) : '') + n.name });
      walk(n.children, depth + 1);
    }
  };
  walk(modules.value, 0);
  return opts;
});

function startBaseEdit() {
  const d = detail.value!;
  baseForm.name = d.name;
  baseForm.level = d.level;
  baseForm.moduleId = d.moduleId;
  baseForm.executor = d.executor || '';
  baseForm.tagsStr = (d.tags || []).join(',');
  baseErr.name = '';
  baseEditing.value = true;
}

async function saveBase() {
  baseErr.name = baseForm.name.trim() ? '' : '请输入用例名称';
  if (!baseForm.name.trim()) return;
  baseSaving.value = true;
  try {
    await updateCase(caseId.value, {
      name: baseForm.name.trim(),
      level: baseForm.level,
      moduleId: baseForm.moduleId,
      executor: baseForm.executor.trim(),
      tags: baseForm.tagsStr.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
    });
    ElMessage.success('已保存');
    baseEditing.value = false;
    await load();
  } finally { baseSaving.value = false; }
}

const caseKw = ref('');
const bugKw = ref('');
const depKw = ref('');
const reviewKw = ref('');
const bugMode = ref<'direct' | 'plan'>('direct');
const depDir = ref<'pre' | 'post'>('pre');

const allBugs = ref<Bug[]>([]);

const pickVisible = ref(false);
const pickLoading = ref(false);
const pickKw = ref('');
const pickType = ref<'related' | 'pre' | 'post' | 'bug'>('related');
const pickRows = ref<Array<TestCase | Bug>>([]);
const pickSel = ref<Array<TestCase | Bug>>([]);

const bugCreateVisible = ref(false);
const bugCreating = ref(false);
const bugForm = reactive({ title: '', severity: 'MAJOR' as BugSeverity, assignee: '' });
const SEVERITIES = [
  { v: 'BLOCKER', t: '阻塞' }, { v: 'CRITICAL', t: '严重' }, { v: 'MAJOR', t: '主要' },
  { v: 'MINOR', t: '次要' }, { v: 'TRIVIAL', t: '轻微' },
] as const;

const relatedPool = ref<TestCase[]>([]);

const filteredRelated = computed(() =>
  relatedPool.value.filter((c) => detail.value?.relatedCaseIds?.includes(c.id))
    .filter((c) => !caseKw.value || c.name.toLowerCase().includes(caseKw.value.toLowerCase())),
);

const filteredBugs = computed(() => {
  const kw = bugKw.value.toLowerCase();
  const ids = bugMode.value === 'direct' ? (detail.value?.bugIds ?? []) : null;
  return allBugs.value
    .filter((b) => (ids ? ids.includes(b.id) : !!b.planId))
    .filter((b) => !kw || b.title.toLowerCase().includes(kw));
});

const filteredDeps = computed(() => {
  const ids = depDir.value === 'pre' ? (detail.value?.preCaseIds ?? []) : (detail.value?.postCaseIds ?? []);
  return relatedPool.value.filter((c) => ids.includes(c.id))
    .filter((c) => !depKw.value || c.name.toLowerCase().includes(depKw.value.toLowerCase()));
});

const filteredReviews = computed(() =>
  reviews.value.filter((r) => r.caseIds.includes(caseId.value))
    .filter((r) => !reviewKw.value || `${r.id} ${r.name}`.toLowerCase().includes(reviewKw.value.toLowerCase())),
);

function moduleName(id: string): string {
  const walk = (ns: ModuleNode[]): string => {
    for (const n of ns) {
      if (n.id === id) return n.name;
      const hit = walk(n.children);
      if (hit) return hit;
    }
    return '';
  };
  return walk(modules.value) || id;
}
function projectName(pid: string): string {
  return pid === 'p-1' ? 'TestEngine 演示项目' : pid;
}
function statusLabel(s: CaseStatus): string {
  return ({ DRAFT: '草稿', REVIEW: '评审中', READY: '已就绪' } as Record<CaseStatus, string>)[s] || s;
}
function bugLabel(s: BugStatus): string {
  return ({ NEW: '新建', ASSIGNED: '已指派', FIXING: '修复中', FIXED: '已解决', CLOSED: '已关闭', REOPEN: '重新打开' } as Record<BugStatus, string>)[s] || s;
}
function bugCls(s: BugStatus): string {
  return ({ NEW: 'st-new', ASSIGNED: 'st-assigned', FIXING: 'st-fixing', FIXED: 'st-fixed', CLOSED: 'st-closed', REOPEN: 'st-reopen' } as Record<BugStatus, string>)[s] || 'st-new';
}
function rvLabel(s: Review['status']): string {
  return ({ PENDING: '待评审', PASSED: '通过', REJECTED: '未通过' } as Record<Review['status'], string>)[s] || s;
}
function rvCls(s: Review['status']): string {
  return ({ PENDING: 'rv-pending', PASSED: 'rv-passed', REJECTED: 'rv-rejected' } as Record<Review['status'], string>)[s] || 'rv-pending';
}

async function load() {
  const d = await fetchCase(caseId.value);
  if (!d) return;
  detail.value = { ...d, preCaseIds: d.preCaseIds ?? [], postCaseIds: d.postCaseIds ?? [], relatedCaseIds: d.relatedCaseIds ?? [], bugIds: d.bugIds ?? [] };
  steps.value = (d.steps || []).map((s) => ({ ...s }));
  if (!modules.value.length) modules.value = await fetchModuleTree('p-1');
  loadPool();
  loadBugs();
  loadReviews();
}

async function loadPool() {
  try {
    const res = await fetchCaseList({ pageNum: 1, pageSize: 100 });
    relatedPool.value = res.list ?? [];
  } catch { relatedPool.value = []; }
}

async function loadBugs() {
  try {
    const res = await fetchBugs({ pageNum: 1, pageSize: 100 });
    allBugs.value = res.list ?? [];
  } catch { allBugs.value = []; }
}

async function loadReviews() {
  try { reviews.value = await fetchReviews(); } catch { reviews.value = []; }
}

/* 详情编辑 */
function startEdit() {
  editForm.purpose = detail.value?.purpose ?? '';
  editForm.precondition = detail.value?.precondition ?? '';
  editing.value = true;
}
watch(editing, (v) => { if (v) startEdit(); });
function cancelEdit() { editing.value = false; }
async function saveDesc() {
  detailSaving.value = true;
  try {
    await updateCase(caseId.value, { purpose: editForm.purpose, precondition: editForm.precondition });
    ElMessage.success('已保存');
    editing.value = false;
    await load();
  } finally { detailSaving.value = false; }
}

/* 步骤 */
function blankStep(): CaseStep {
  return { id: 's-' + Date.now() + '-' + Math.floor(Math.random() * 1000), description: '', expected: '' };
}
watch(
  () => steps.value.map((s) => s.description + '\n' + s.expected).join('|'),
  () => {
    const list = steps.value;
    if (!list.length || list[list.length - 1].description.trim() || list[list.length - 1].expected.trim()) {
      list.push(blankStep());
    }
  },
);
function addStep() { steps.value.push(blankStep()); }
function onStepCmd(cmd: string, i: number) {
  if (cmd === 'delete') steps.value.splice(i, 1);
  else steps.value.splice(cmd === 'above' ? i : i + 1, 0, blankStep());
}

/* 步骤拖拽排序 */
const { dragArmed, dragIdx, overIdx, onDragStart, onDrop, resetDrag } = useDragSort(
  (from, to) => {
    const [moved] = steps.value.splice(from, 1);
    steps.value.splice(to, 0, moved);
  },
);
async function saveSteps() {
  stepSaving.value = true;
  try {
    const valid = steps.value.filter((s) => s.description.trim() || s.expected.trim());
    await updateCase(caseId.value, { steps: valid });
    ElMessage.success('步骤已保存');
    await load();
  } finally { stepSaving.value = false; }
}

/* 关联选择弹窗 */
const pickTitle = computed(() => {
  const map: Record<string, string> = { related: '关联用例', pre: '添加前置用例', post: '添加后置用例', bug: '关联缺陷' };
  return map[pickType.value] || '选择';
});
function openPickDialog(type: 'related' | 'pre' | 'post' | 'bug') {
  pickType.value = type;
  pickKw.value = '';
  pickSel.value = [];
  pickVisible.value = true;
  if (type === 'bug') {
    pickRows.value = allBugs.value.filter((b) => !(detail.value?.bugIds ?? []).includes(b.id));
    pickLoading.value = false;
  } else {
    pickLoading.value = true;
    fetchCaseList({ pageNum: 1, pageSize: 100 }).then((res) => {
      pickRows.value = (res.list ?? []).filter((c: TestCase) => c.id !== caseId.value);
    }).finally(() => { pickLoading.value = false; });
  }
}
watch(pickKw, () => {
  const kw = pickKw.value.toLowerCase();
  if (pickType.value === 'bug') {
    pickRows.value = allBugs.value
      .filter((b) => !(detail.value?.bugIds ?? []).includes(b.id))
      .filter((b) => !kw || b.title.toLowerCase().includes(kw));
  } else {
    // 关联弹窗的关键词过滤在前端进行（数据已加载）
    if (pickRows.value.length && kw) {
      pickRows.value = pickRows.value.filter((r: any) => (r.name || r.title || '').toLowerCase().includes(kw));
    }
  }
});
function onPickSel(sel: Array<TestCase | Bug>) { pickSel.value = sel; }
async function confirmPick() {
  const d = detail.value!;
  if (pickType.value === 'bug') {
    const ids = pickSel.value.map((b) => b.id);
    d.bugIds = [...new Set([...(d.bugIds ?? []), ...ids])];
    await updateCase(caseId.value, { bugIds: d.bugIds });
  } else if (pickType.value === 'related') {
    const ids = pickSel.value.map((c) => c.id);
    d.relatedCaseIds = [...new Set([...(d.relatedCaseIds ?? []), ...ids])];
    await updateCase(caseId.value, { relatedCaseIds: d.relatedCaseIds });
  } else if (pickType.value === 'pre') {
    const ids = pickSel.value.map((c) => c.id);
    d.preCaseIds = [...new Set([...(d.preCaseIds ?? []), ...ids])];
    await updateCase(caseId.value, { preCaseIds: d.preCaseIds });
  } else {
    const ids = pickSel.value.map((c) => c.id);
    d.postCaseIds = [...new Set([...(d.postCaseIds ?? []), ...ids])];
    await updateCase(caseId.value, { postCaseIds: d.postCaseIds });
  }
  ElMessage.success(`已关联 ${pickSel.value.length} 项`);
  pickVisible.value = false;
  await load();
}

async function removeRelated(id: string) {
  const d = detail.value!;
  d.relatedCaseIds = (d.relatedCaseIds ?? []).filter((x) => x !== id);
  await updateCase(caseId.value, { relatedCaseIds: d.relatedCaseIds });
  ElMessage.success('已取消关联');
}
async function unlinkBug(id: string) {
  const d = detail.value!;
  d.bugIds = (d.bugIds ?? []).filter((x) => x !== id);
  await updateCase(caseId.value, { bugIds: d.bugIds });
  ElMessage.success('已取消关联');
}
async function removeDep(id: string) {
  const d = detail.value!;
  if (depDir.value === 'pre') {
    d.preCaseIds = (d.preCaseIds ?? []).filter((x) => x !== id);
    await updateCase(caseId.value, { preCaseIds: d.preCaseIds });
  } else {
    d.postCaseIds = (d.postCaseIds ?? []).filter((x) => x !== id);
    await updateCase(caseId.value, { postCaseIds: d.postCaseIds });
  }
  ElMessage.success('已移除');
}

/* 新建缺陷 */
async function createBugAndLink() {
  if (!bugForm.title.trim()) { ElMessage.warning('请输入缺陷标题'); return; }
  bugCreating.value = true;
  try {
    const b = await createBug({
      projectId: 'p-1',
      title: bugForm.title.trim(),
      severity: bugForm.severity,
      status: 'NEW',
      assignee: bugForm.assignee.trim(),
      reporter: 'Administrator',
      description: '',
      moduleId: detail.value?.moduleId ?? '',
    });
    const d = detail.value!;
    d.bugIds = [...(d.bugIds ?? []), b.id];
    await updateCase(caseId.value, { bugIds: d.bugIds });
    ElMessage.success('缺陷已创建并关联');
    bugCreateVisible.value = false;
    bugForm.title = ''; bugForm.assignee = ''; bugForm.severity = 'MAJOR';
    await load();
  } finally { bugCreating.value = false; }
}

onMounted(load);
</script>

<style scoped>
.cd-page {
  display: flex;
  flex-direction: column;
}

.cd-top {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  margin-bottom: 16px;
}

.cd-back {
  color: var(--el-text-color-regular, #606266);
  padding: 4px;
  flex: none;
}

.cd-tabs {
  flex: 1;
  min-width: 0;
}

.cd-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.cd-card {
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  padding: 18px 20px;
}

.cd-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
}

.cd-level {
  font-weight: 600;
}

.lv-p0 {
  color: #d93838;
}

.lv-p1 {
  color: #d67f1b;
}

.lv-p2 {
  color: #1d7afb;
}

.lv-p3 {
  color: #909399;
}

.cd-tag {
  margin-right: 6px;
}

.cd-desc :deep(.el-descriptions__label) {
  width: 110px;
}

/* 区块标题 */
.cd-sec-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.cd-sec-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.cd-edit-ico {
  margin-right: 4px;
}

.cd-richtext {
  min-height: 64px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 8px;
  background: var(--el-fill-color-lighter, #fafafa);
  font-size: 13.5px;
  color: var(--el-text-color-regular, #606266);
  white-space: pre-wrap;
}

.cd-rich :deep(.el-textarea__inner) {
  border-radius: 8px;
}

.cd-save-row {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

/* 步骤表格 */
.cd-grid {
  display: grid;
  grid-template-columns: 32px 72px minmax(220px, 1.15fr) minmax(180px, 1fr) 64px;
  align-items: center;
  column-gap: 12px;
}

.cd-grid-head {
  padding: 8px 8px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  color: var(--el-text-color-secondary, #909399);
  font-size: 13px;
}

.cd-grid-head span:nth-child(n + 3) {
  text-align: center;
}

.cd-grid-row {
  padding: 6px 8px;
  min-height: 52px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  transition: background 0.15s;
}

.cd-grid-row:hover {
  background: var(--el-fill-color-lighter, #fafafa);
}

.g-drag {
  color: var(--el-border-color-dark, #cdd0d6);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
}

.g-drag:active {
  cursor: grabbing;
  color: var(--accent, #2563eb);
}

.cd-grid-row.cd-dragging {
  opacity: 0.45;
}

.cd-grid-row.cd-drag-over {
  box-shadow: inset 0 2px 0 var(--accent, #2563eb);
}

.cd-idx {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--el-fill-color, #f0f2f5);
  color: var(--el-text-color-regular, #606266);
  font-size: 12px;
  font-style: normal;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.g-cell {
  min-width: 0;
}

.cd-cell-input :deep(.el-textarea__inner) {
  border-color: transparent;
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13.5px;
  color: var(--el-text-color-primary, #303133);
  box-shadow: none;
}

.cd-cell-input :deep(.el-textarea__inner:hover) {
  border-color: var(--el-border-color, #dcdfe6);
  background: var(--el-bg-color, #fff);
}

.cd-cell-input :deep(.el-textarea__inner:focus) {
  border-color: var(--el-color-primary, #409eff);
  background: var(--el-bg-color, #fff);
}

.g-op {
  display: flex;
  justify-content: center;
}

.cd-more {
  color: var(--el-text-color-secondary, #909399);
  padding: 4px;
}

.cd-more:hover {
  color: var(--el-color-primary, #409eff);
}

/* 工具条 */
.cd-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.cd-spacer {
  flex: 1;
}

.cd-empty-line {
  padding: 32px 0;
  text-align: center;
  color: var(--el-text-color-secondary, #909399);
  font-size: 13.5px;
}

.cd-empty-block {
  padding: 52px 16px;
  text-align: center;
  color: var(--el-text-color-secondary, #909399);
  font-size: 13.5px;
}

.cd-empty-block svg {
  width: 34px;
  height: 34px;
  margin-bottom: 10px;
  color: var(--el-border-color, #dcdfe6);
}

/* 状态胶囊 */
.cd-pill {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1;
}

.st-new {
  background: #e8f3ff;
  color: #1d7afb;
}

.st-assigned {
  background: #f0ebff;
  color: #7c3aed;
}

.st-fixing {
  background: #fdf3e7;
  color: #d67f1b;
}

.st-fixed {
  background: #e8f7ee;
  color: #18a058;
}

.st-closed {
  background: var(--el-fill-color, #f0f2f5);
  color: var(--el-text-color-secondary, #909399);
}

.st-reopen {
  background: #fdecec;
  color: #d93838;
}

.rv-pending {
  background: #fdf3e7;
  color: #d67f1b;
}

.rv-passed {
  background: #e8f7ee;
  color: #18a058;
}

.rv-rejected {
  background: #fdecec;
  color: #d93838;
}

/* 新建缺陷表单 */
.cd-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cd-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.cd-err {
  font-size: 12px;
  color: var(--el-color-danger, #f56c6c);
}

.cd-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cd-row .el-text {
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  align-self: auto;
}

.cd-row .el-text em {
  color: var(--el-color-danger, #f56c6c);
  font-style: normal;
  margin-left: 2px;
}
</style>
