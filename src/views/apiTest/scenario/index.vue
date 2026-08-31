<template>
  <div class="scenario">
    <div class="left">
      <ModuleTree :modules="modules" :selected="moduleId" @select="onSelect" @add="onAddModule" />
    </div>
    <div class="right">
      <div class="toolbar">
        <span class="title">场景列表</span>
        <div class="spacer" />
        <el-button type="primary" @click="onCreate">新建</el-button>
      </div>
      <el-table :data="filtered" v-loading="loading">
        <el-table-column prop="name" label="名称" min-width="180" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="步骤数" width="90">
          <template #default="{ row }">{{ countSteps(row.steps) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="success" @click="onExecute(row)">执行</el-button>
            <el-button link @click="onCopy(row)">复制</el-button>
            <el-button link type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <StepEditor v-model="editorVisible" :scenario="current" :definitions="definitions" :modules="modules" @saved="load" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ModuleTree from '@/components/ModuleTree.vue'
import StepEditor from './components/StepEditor.vue'
import { fetchScenarios, saveScenario, executeScenario, deleteScenario, fetchApiDefinitions } from '@/api/apiTest'
import { fetchModuleTree } from '@/api/testCase'
import type { Scenario, ScenarioStep, ApiDefinition, ModuleNode } from '@/types/models'

const modules = ref<ModuleNode[]>([])
const scenarios = ref<Scenario[]>([])
const definitions = ref<ApiDefinition[]>([])
const moduleId = ref('')
const loading = ref(false)
const editorVisible = ref(false)
const current = ref<Scenario | null>(null)

const filtered = computed(() => {
  if (!moduleId.value) return scenarios.value
  return scenarios.value.filter((s) => s.moduleId === moduleId.value)
})

function statusTag(status: Scenario['status']) {
  return status === 'PASS' ? 'success' : status === 'FAIL' ? 'danger' : 'info'
}
function statusText(status: Scenario['status']) {
  return status === 'PASS' ? '通过' : status === 'FAIL' ? '失败' : '草稿'
}
function countSteps(steps: ScenarioStep[]): number {
  let n = 0
  const walk = (arr: ScenarioStep[]) => {
    for (const s of arr) {
      n++
      if (s.children?.length) walk(s.children)
    }
  }
  walk(steps)
  return n
}

function onSelect(id: string) { moduleId.value = id }
function onAddModule() { ElMessage.info('模块管理请到用例模块树') }

async function load() {
  loading.value = true
  try {
    scenarios.value = await fetchScenarios()
  } finally {
    loading.value = false
  }
}

function onCreate() {
  current.value = { id: '', name: '', moduleId: moduleId.value || 'm-1', status: 'DRAFT', steps: [] }
  editorVisible.value = true
}

function openEdit(row: Scenario) {
  current.value = JSON.parse(JSON.stringify(row))
  editorVisible.value = true
}

async function onExecute(row: Scenario) {
  const res = await executeScenario(row.id)
  ElMessageBox.alert(JSON.stringify(res, null, 2), `执行结果：${row.name}`, { type: 'info' })
}

async function onCopy(row: Scenario) {
  const copy = JSON.parse(JSON.stringify(row)) as Scenario
  copy.id = ''
  copy.name = row.name + ' - 副本'
  const stamp = () => 'st-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)
  const walk = (arr: ScenarioStep[]) => { for (const s of arr) { s.id = stamp(); if (s.children?.length) walk(s.children) } }
  walk(copy.steps)
  await saveScenario(copy)
  ElMessage.success('已复制')
  load()
}

async function onDelete(row: Scenario) {
  await ElMessageBox.confirm('确认删除该场景？', '提示', { type: 'warning' })
  await deleteScenario(row.id)
  ElMessage.success('已删除')
  load()
}

onMounted(async () => {
  const [mods, defs] = await Promise.all([fetchModuleTree('p-1'), fetchApiDefinitions()])
  modules.value = mods
  definitions.value = defs
  load()
})
</script>

<style scoped>
.scenario { display: flex; gap: 12px; padding: 12px; }
.left { width: 220px; flex-shrink: 0; }
.right { flex: 1; min-width: 0; }
.toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.title { font-weight: 600; }
.spacer { flex: 1; }
</style>
