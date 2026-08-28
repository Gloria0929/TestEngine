<template>
  <div class="report">
    <div class="left">
      <div class="list-title">报告列表</div>
      <el-menu>
        <el-menu-item v-for="r in reports" :key="r.id" :index="r.id" @click="selectReport(r)">
          <span class="report-item">
            <el-tag :type="statusTag(r.status)" size="small">{{ statusText(r.status) }}</el-tag>
            <span class="report-name">{{ r.name }}</span>
            <span class="report-time">{{ r.createTime }}</span>
          </span>
        </el-menu-item>
      </el-menu>
    </div>

    <div class="right" v-if="detail" v-loading="loading">
      <div class="stats">
        <div class="stat">
          <div class="stat-label">通过率</div>
          <div class="stat-value">{{ passRate }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">耗时</div>
          <div class="stat-value">{{ detail.duration }} ms</div>
        </div>
        <div class="stat">
          <div class="stat-label">时间</div>
          <div class="stat-value">{{ detail.createTime }}</div>
        </div>
      </div>

      <el-table :data="detail.steps">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand">
              <div class="expand-row"><span class="expand-label">断言</span><span>{{ row.assertion || '-' }}</span></div>
              <div class="expand-row"><span class="expand-label">提取</span><span>{{ row.extract || '-' }}</span></div>
              <div class="expand-row"><span class="expand-label">控制台</span>
                <div class="console-lines">
                  <div v-if="!(row.console && row.console.length)">-</div>
                  <div v-for="(line, i) in row.console" :key="i" class="console-line">{{ line }}</div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="步骤名" min-width="140" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="耗时" width="90">
          <template #default="{ row }">{{ row.time }} ms</template>
        </el-table-column>
        <el-table-column prop="request" label="请求" min-width="180" />
        <el-table-column prop="response" label="响应" min-width="120" />
      </el-table>
    </div>

    <div class="right empty" v-else>
      <el-empty description="请选择报告" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchApiReports, fetchApiReport } from '@/api/apiTest'
import type { ApiReport } from '@/types/models'

const reports = ref<ApiReport[]>([])
const detail = ref<ApiReport | null>(null)
const loading = ref(false)

const passRate = computed(() => {
  if (!detail.value || !detail.value.steps.length) return '-'
  const pass = detail.value.steps.filter((s) => s.status === 'PASS').length
  return Math.round((pass / detail.value.steps.length) * 100) + '%'
})

function statusTag(status: 'PASS' | 'FAIL') {
  return status === 'PASS' ? 'success' : 'danger'
}
function statusText(status: 'PASS' | 'FAIL') {
  return status === 'PASS' ? '通过' : '失败'
}

async function selectReport(r: ApiReport) {
  loading.value = true
  detail.value = await fetchApiReport(r.id)
  loading.value = false
}

onMounted(async () => {
  reports.value = await fetchApiReports()
  if (reports.value.length) selectReport(reports.value[0])
})
</script>

<style scoped>
.report { display: flex; height: 100%; }
.left { width: 260px; flex-shrink: 0; border-right: 1px solid var(--el-border-color); padding: 8px; }
.list-title { font-weight: 600; padding: 8px 12px; }
.report-item { display: flex; align-items: center; gap: 8px; width: 100%; }
.report-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.report-time { color: var(--el-text-color-secondary); font-size: 12px; }
.right { flex: 1; min-width: 0; padding: 12px; overflow: auto; }
.right.empty { display: flex; align-items: center; justify-content: center; }
.stats { display: flex; gap: 16px; margin-bottom: 16px; }
.stat { min-width: 140px; padding: 12px 16px; border: 1px solid var(--el-border-color); border-radius: 6px; }
.stat-label { color: var(--el-text-color-secondary); font-size: 12px; }
.stat-value { font-size: 20px; font-weight: 600; margin-top: 4px; }
.expand { padding: 8px 24px; }
.expand-row { display: flex; gap: 8px; margin-bottom: 8px; }
.expand-label { flex-shrink: 0; color: var(--el-text-color-secondary); min-width: 56px; }
.console-lines { font-family: monospace; font-size: 12px; }
.console-line { white-space: pre-wrap; word-break: break-all; }
</style>
