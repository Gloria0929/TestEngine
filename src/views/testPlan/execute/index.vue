<template>
  <div class="execute">
    <div class="header">
      <div class="title">{{ planName }}</div>
      <div class="progress">
        <span class="count">{{ doneCount }} / {{ rows.length }}</span>
        <el-progress :percentage="percent" :show-text="false" class="bar" />
      </div>
    </div>

    <div class="toolbar">
      <div class="spacer" />
      <el-button @click="linkVisible = true">关联用例</el-button>
      <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
    </div>

    <el-table :data="rows" v-loading="loading">
      <el-table-column prop="name" label="用例名称" min-width="220" />
      <el-table-column prop="level" label="优先级" width="80" />
      <el-table-column label="执行结果" width="360">
        <template #default="{ row }">
          <div class="state-btns">
            <el-button v-for="s in states" :key="s.value" size="small"
              :type="row.result === s.value ? s.type : 'default'"
              :plain="row.result !== s.value" @click="toggle(row, s.value)">{{ s.label }}</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="实际结果" min-width="220">
        <template #default="{ row }">
          <el-input v-model="actualMap[row.id]" placeholder="填写实际结果" />
        </template>
      </el-table-column>
    </el-table>

    <PlanCaseDialog v-model="linkVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import PlanCaseDialog from '../list/components/PlanCaseDialog.vue'
import { fetchPlanCases, submitCaseResult } from '@/api/testPlan'
import type { TestCase, ExecuteResult, PlanCaseResult } from '@/types/models'

interface CaseRow extends TestCase { result: ExecuteResult | null }

const route = useRoute()
const rows = ref<CaseRow[]>([])
const loading = ref(false)
const saving = ref(false)
const linkVisible = ref(false)
const actualMap = reactive<Record<string, string>>({})

const planId = computed(() => String(route.params.id))
const planName = computed(() => String(route.query.name ?? ''))
const doneCount = computed(() => rows.value.filter((r) => r.result).length)
const percent = computed(() => (rows.value.length ? Math.round((doneCount.value / rows.value.length) * 100) : 0))

const states: { value: ExecuteResult; label: string; type: 'success' | 'danger' | 'warning' | 'info' }[] = [
  { value: 'PASS', label: '通过', type: 'success' },
  { value: 'FAIL', label: '失败', type: 'danger' },
  { value: 'BLOCK', label: '阻塞', type: 'warning' },
  { value: 'SKIP', label: '跳过', type: 'info' },
]

function toggle(row: CaseRow, value: ExecuteResult) {
  row.result = row.result === value ? null : value
}
async function load() {
  loading.value = true
  rows.value = await fetchPlanCases(planId.value)
  for (const r of rows.value) {
    if (actualMap[r.id] === undefined) actualMap[r.id] = ''
  }
  loading.value = false
}
async function onSave() {
  saving.value = true
  const results: PlanCaseResult[] = []
  for (const r of rows.value) {
    if (r.result) results.push({ caseId: r.id, result: r.result, actual: actualMap[r.id] ?? '' })
  }
  await submitCaseResult(planId.value, results)
  saving.value = false
  ElMessage.success('已保存执行结果')
}
onMounted(load)
</script>

<style scoped>
.execute { padding: 16px; }
.header { display: flex; align-items: center; gap: 24px; margin-bottom: 12px; }
.title { font-size: 18px; font-weight: 600; }
.progress { display: flex; align-items: center; gap: 12px; flex: 1; }
.count { color: var(--el-text-color-secondary); font-size: 13px; white-space: nowrap; }
.bar { flex: 1; max-width: 480px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.spacer { flex: 1; }
.state-btns { display: flex; gap: 4px; }
</style>
