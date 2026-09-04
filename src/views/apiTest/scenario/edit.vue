<template>
  <div class="se-page">
    <!-- 头部：状态 + 等级 + 标题 + 收藏/复制 -->
    <div class="se-head">
      <div class="se-head-left">
        <el-tag :type="statusType(info.status)" round>{{ info.status }}</el-tag>
        <el-tag :type="levelType(info.level)" round>{{ info.level || 'P1' }}</el-tag>
        <h1 class="se-title">【{{ info.id }}】{{ info.name }}</h1>
      </div>
      <div class="se-head-right">
        <el-button :icon="RefreshRight" @click="load">刷新</el-button>
        <el-button type="primary" :disabled="saving" @click="saveAll">{{ saving ? '保存中…' : '保存' }}</el-button>
      </div>
    </div>

    <!-- 标签 / 描述 -->
    <div class="se-meta">
      <div class="se-meta-item">
        <span class="se-meta-lab">标签</span>
        <template v-if="info.tags?.length">
          <el-tag v-for="t in info.tags" :key="t" effect="plain" size="small" class="se-tag">{{ t }}</el-tag>
        </template>
        <span v-else class="se-meta-dash">-</span>
      </div>
      <div class="se-meta-item">
        <span class="se-meta-lab">描述</span>
        <span class="se-meta-dash">{{ info.desc || '-' }}</span>
      </div>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="tab" class="se-tabs">
      <el-tab-pane label="基本信息" name="base">
        <div class="se-card">
          <div class="se-form">
            <div class="se-row se-full">
              <el-text>场景名称<em>*</em></el-text>
              <el-input v-model="form.name" maxlength="80" placeholder="如：下单支付主流程" />
            </div>
            <div class="se-row">
              <el-text>用例等级</el-text>
              <el-select v-model="form.level" style="width: 100%">
                <el-option v-for="l in LEVELS" :key="l" :value="l" :label="l" />
              </el-select>
            </div>
            <div class="se-row">
              <el-text>责任人</el-text>
              <el-input v-model="form.responsible" maxlength="20" placeholder="选择或输入责任人" />
            </div>
            <div class="se-row se-full">
              <el-text>标签</el-text>
              <el-input v-model="form.tagsStr" maxlength="60" placeholder="多个标签用逗号分隔，如：冒烟,核心链路" />
            </div>
            <div class="se-row se-full">
              <el-text>描述</el-text>
              <el-input v-model="form.desc" type="textarea" :rows="3" maxlength="200" placeholder="场景说明（选填）" />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane name="steps">
        <template #label>
          <span>步骤</span>
          <el-tag type="info" effect="plain" size="small" class="se-tabcount">{{ validStepCount }}</el-tag>
        </template>
        <div class="se-card se-steps-card">
          <div class="se-steps-head">
            <span class="se-steps-title">步骤描述</span>
          </div>
          <div class="se-grid se-grid-head">
            <span class="g-drag" />
            <span>序号</span>
            <span>用例步骤</span>
            <span>预期结果</span>
            <span>操作</span>
          </div>
          <div v-for="(s, i) in steps" :key="s.id" class="se-grid se-grid-row"
            :class="{ 'se-dragging': dragIdx === i, 'se-drag-over': overIdx === i && dragIdx !== i }"
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
            <span><i class="se-idx">{{ i + 1 }}</i></span>
            <div class="g-cell">
              <el-input v-model="s.name" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" placeholder="请输入步骤"
                class="se-cell-input" />
            </div>
            <div class="g-cell">
              <el-input v-model="s.expected" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" placeholder="请输入预期"
                class="se-cell-input" />
            </div>
            <div class="g-op">
              <el-dropdown trigger="click" @command="(cmd: string) => onStepCmd(cmd, i)">
                <el-button link class="se-step-more">
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
          <div class="se-add-step" @click="addStep">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
              stroke-linecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            添加步骤
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="参数" name="params">
        <div class="se-card">
          <div v-if="!params.length" class="se-empty">暂无场景参数</div>
          <div v-for="(p, i) in params" :key="i" class="se-kv">
            <el-input v-model="p.key" placeholder="参数名" style="flex: 1" />
            <el-input v-model="p.value" placeholder="参数值" style="flex: 1.6" />
            <el-button link type="danger" @click="params.splice(i, 1)">删除</el-button>
          </div>
          <el-button plain class="se-kv-add" @click="params.push({ key: '', value: '' })">+ 添加参数</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane v-for="t in PLACEHOLDERS" :key="t.name" :label="t.label" :name="t.name">
        <div class="se-card">
          <div class="se-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 10h18M9 4v16" />
            </svg>
            <div>{{ t.empty }}</div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus'
import { useDragSort } from '@/composables/useDragSort';
import { RefreshRight } from '@element-plus/icons-vue';
import { fetchScenario, updateScenario } from '@/api/apiTest';
import type { Scenario, ScenarioStatus, ScenarioStep } from '@/types/models';

const LEVELS = ['P0', 'P1', 'P2', 'P3'] as const;
const PLACEHOLDERS = [
  { name: 'after', label: '前/后置', empty: '暂无前/后置操作' },
  { name: 'assert', label: '断言', empty: '暂无断言规则' },
  { name: 'history', label: '执行历史', empty: '暂无执行记录，执行场景后可在此查看' },
  { name: 'changes', label: '变更历史', empty: '暂无变更记录' }
];

const route = useRoute();
const router = useRouter();
const scenarioId = computed(() => String(route.params.id));

const info = ref<Partial<Scenario>>({});
const saving = ref(false);
const dirty = ref(false);
const tab = ref('steps');

const form = reactive({
  name: '',
  level: 'P1' as (typeof LEVELS)[number],
  responsible: '',
  tagsStr: '',
  desc: '',
});
const steps = ref<ScenarioStep[]>([]);
const params = ref([{ key: '', value: '' }]);

const validStepCount = computed(() => steps.value.filter((s) => s.name.trim() || (s.expected || '').trim()).length);

function blankStep(): ScenarioStep {
  return {
    id: 'st-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    name: '',
    expected: '',
  };
}

// 末行为空行占位；填入内容后自动追加新的空行
watch(
  () => steps.value.map((s) => s.name + '\n' + (s.expected || '')).join('|'),
  () => {
    const list = steps.value;
    if (!list.length || list[list.length - 1].name.trim() || (list[list.length - 1].expected || '').trim()) {
      list.push(blankStep());
    }
  },
);

function onStepCmd(cmd: string, i: number) {
  if (cmd === 'delete') {
    steps.value.splice(i, 1);
  } else {
    steps.value.splice(cmd === 'above' ? i : i + 1, 0, blankStep());
  }
  dirty.value = true;
}

type TagType = "primary" | "success" | "warning" | "danger" | "info";
function levelType(l?: string): TagType {
  const map: Record<string, TagType> = { P0: 'danger', P1: 'warning', P2: 'primary', P3: 'info' };
  return map[l || 'P1'] || 'warning';
}
function statusType(s?: ScenarioStatus): TagType {
  const map: Record<ScenarioStatus, TagType> = { '未执行': 'info', '执行中': 'primary', '通过': 'success', '失败': 'danger' };
  return map[s || '未执行'] || 'info';
}

async function load() {
  const s = await fetchScenario(scenarioId.value);
  if (!s) {
    ElMessage.error('场景不存在或已删除');
    router.replace('/api-test/scenario');
    return;
  }
  info.value = s;
  form.name = s.name;
  form.level = s.level || 'P1';
  form.responsible = s.responsible || '';
  form.tagsStr = (s.tags || []).join(',');
  form.desc = s.desc || '';
  steps.value = (s.steps || []).map((st) => ({ ...st, expected: st.expected ?? '' }));
  dirty.value = false;
}

async function saveAll() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入场景名称');
    return;
  }
  saving.value = true;
  try {
    const valid = steps.value.filter((s) => s.name.trim() || (s.expected || '').trim());
    await updateScenario(scenarioId.value, {
      name: form.name.trim(),
      level: form.level,
      responsible: form.responsible.trim(),
      tags: form.tagsStr.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      desc: form.desc,
      steps: valid,
      apiCount: valid.length,
    });
    ElMessage.success('已保存');
    dirty.value = false;
    await load();
  } finally {
    saving.value = false;
  }
}

function addStep() {
  steps.value.push(blankStep());
  dirty.value = true;
}

/* 步骤拖拽排序 */
const { dragArmed, dragIdx, overIdx, onDragStart, onDrop, resetDrag } = useDragSort(
  (from, to) => {
    const [moved] = steps.value.splice(from, 1);
    steps.value.splice(to, 0, moved);
    dirty.value = true;
  },
);

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    ElMessage.success('链接已复制');
  } catch {
    ElMessage.warning(window.location.href);
  }
}

onMounted(load);
</script>

<style scoped>
.se-page {
  display: flex;
  flex-direction: column;
}

.se-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.se-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.se-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.se-star,
.se-linkbtn {
  color: var(--el-text-color-secondary, #909399);
  padding: 4px;
}

.se-star.on {
  color: #f59e0b;
}

.se-head-right {
  display: flex;
  gap: 10px;
}

.se-meta {
  display: flex;
  gap: 48px;
  padding: 10px 2px 2px;
  flex-wrap: wrap;
}

.se-meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.se-meta-lab {
  font-size: 13px;
  color: var(--el-text-color-secondary, #909399);
}

.se-meta-dash {
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
}

.se-tag {
  margin-right: 4px;
}

.se-tabs {
  margin-top: 6px;
}

.se-tabcount {
  margin-left: 6px;
}

.se-card {
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  padding: 16px;
}

.se-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  max-width: 860px;
}

.se-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.se-row .el-text {
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  align-self: auto;
}

.se-row .el-text em {
  color: var(--el-color-danger, #f56c6c);
  font-style: normal;
  margin-left: 2px;
}

.se-full {
  grid-column: 1 / -1;
}

/* 步骤表格 */
.se-steps-card {
  padding: 16px 0;
}

.se-steps-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 20px 12px;
}

.se-steps-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.se-grid {
  display: grid;
  grid-template-columns: 32px 72px minmax(220px, 1.15fr) minmax(180px, 1fr) 64px;
  align-items: center;
  column-gap: 12px;
}

.se-grid-head {
  padding: 8px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  color: var(--el-text-color-secondary, #909399);
  font-size: 13px;
}

.se-grid-head span:nth-child(n + 3) {
  text-align: center;
}

.se-grid-row {
  padding: 6px 20px;
  min-height: 52px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  transition: background 0.15s;
}

.se-grid-row:hover {
  background: var(--el-fill-color-lighter, #fafafa);
}

.g-drag {
  color: var(--el-border-color-dark, #cdd0d6);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
}

.se-idx {
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
  position: relative;
  min-width: 0;
}

.se-cell-input :deep(.el-textarea__inner) {
  border-color: transparent;
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13.5px;
  color: var(--el-text-color-primary, #303133);
  box-shadow: none;
}

.se-cell-input :deep(.el-textarea__inner:hover) {
  border-color: var(--el-border-color, #dcdfe6);
  background: var(--el-bg-color, #fff);
}

.se-cell-input :deep(.el-textarea__inner:focus) {
  border-color: var(--el-color-primary, #409eff);
  background: var(--el-bg-color, #fff);
}

.g-op {
  display: flex;
  justify-content: center;
}

.se-step-more {
  color: var(--el-text-color-secondary, #909399);
  padding: 4px;
}

.se-step-more:hover {
  color: var(--el-color-primary, #409eff);
}

.se-add-step {
  margin: 14px 20px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--el-color-primary, #409eff);
  font-size: 13.5px;
  cursor: pointer;
  user-select: none;
  width: fit-content;
}

.se-add-step:hover {
  opacity: 0.8;
}

/* 步骤拖拽排序反馈 */
.g-drag:active {
  cursor: grabbing;
  color: var(--accent, #2563eb);
}

.se-grid-row.se-dragging {
  opacity: 0.45;
}

.se-grid-row.se-drag-over {
  box-shadow: inset 0 2px 0 var(--accent, #2563eb);
}

/* 参数 */
.se-kv {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.se-kv-add {
  width: 100%;
  border-style: dashed;
}

/* 空状态 */
.se-empty {
  padding: 52px 16px;
  text-align: center;
  color: var(--el-text-color-secondary, #909399);
  font-size: 13.5px;
}

.se-empty svg {
  width: 34px;
  height: 34px;
  margin-bottom: 10px;
  color: var(--el-border-color, #dcdfe6);
}
</style>
