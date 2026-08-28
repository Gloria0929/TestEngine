<template>
  <div class="recycle">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="用例" name="case">
        <el-table :data="cases" v-loading="caseLoading">
          <el-table-column prop="name" label="用例名称" min-width="240" />
          <el-table-column prop="moduleId" label="模块" width="120" />
          <el-table-column prop="level" label="等级" width="80" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">{{ caseStatusText(row.status) }}</template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="160" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="onRestoreCase(row)">恢复</el-button>
              <el-button link type="danger" @click="onPurgeCase(row)">彻底删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="场景" name="scenario">
        <el-table :data="scenarios" v-loading="scenarioLoading">
          <el-table-column prop="name" label="场景名称" min-width="240" />
          <el-table-column prop="moduleId" label="模块" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="scenarioStatusTag(row.status)" size="small">{{ scenarioStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="onRestoreScenario(row)">恢复</el-button>
              <el-button link type="danger" @click="onPurgeScenario(row)">彻底删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchRecycle, restoreCase, purgeCase } from '@/api/testCase'
import { fetchScenarioRecycle, restoreScenario, purgeScenario } from '@/api/apiTest'
import type { TestCase, Scenario } from '@/types/models'

const activeTab = ref('case')
const cases = ref<TestCase[]>([])
const scenarios = ref<Scenario[]>([])
const caseLoading = ref(false)
const scenarioLoading = ref(false)

function caseStatusText(s: TestCase['status']) { return { DRAFT: '草稿', REVIEW: '待评审', READY: '就绪' }[s] ?? s }
function scenarioStatusTag(status: Scenario['status']) {
  return status === 'PASS' ? 'success' : status === 'FAIL' ? 'danger' : 'info'
}
function scenarioStatusText(status: Scenario['status']) {
  return status === 'PASS' ? '通过' : status === 'FAIL' ? '失败' : '草稿'
}

async function loadCases() {
  caseLoading.value = true
  cases.value = await fetchRecycle()
  caseLoading.value = false
}
async function loadScenarios() {
  scenarioLoading.value = true
  scenarios.value = await fetchScenarioRecycle()
  scenarioLoading.value = false
}

async function onRestoreCase(row: TestCase) {
  await restoreCase(row.id)
  ElMessage.success('已恢复')
  loadCases()
}
async function onPurgeCase(row: TestCase) {
  await ElMessageBox.confirm('彻底删除后不可恢复，确认删除？', '确认', { type: 'warning' })
  await purgeCase(row.id)
  ElMessage.success('已彻底删除')
  loadCases()
}
async function onRestoreScenario(row: Scenario) {
  await restoreScenario(row.id)
  ElMessage.success('已恢复')
  loadScenarios()
}
async function onPurgeScenario(row: Scenario) {
  await ElMessageBox.confirm('彻底删除后不可恢复，确认删除？', '确认', { type: 'warning' })
  await purgeScenario(row.id)
  ElMessage.success('已彻底删除')
  loadScenarios()
}

onMounted(() => {
  loadCases()
  loadScenarios()
})
</script>

<style scoped>
.recycle { padding: 16px; }
</style>
