<template>
  <div class="rp-page">
    <!-- 搜索栏 -->
    <div class="bg-bar">
      <div class="bg-field">
        <el-text class="bg-lab">关键词</el-text>
        <el-input v-model="filter.keyword" style="width:220px" placeholder="搜索报告名称 / ID" clearable
          @keydown.enter="search" @clear="search" />
      </div>
      <div class="bg-field">
        <el-text class="bg-lab">报告类型</el-text>
        <el-select v-model="filter.type" style="width:130px" placeholder="全部" clearable @change="search">
          <el-option v-for="t in reportTypes" :key="t" :label="t" :value="t" />
        </el-select>
      </div>
      <div class="bg-spacer" />
      <div class="bg-field">
        <el-text class="bg-lab">&nbsp;</el-text>
        <el-button type="primary" @click="search">查询</el-button>
      </div>
      <div class="bg-field">
        <el-text class="bg-lab">&nbsp;</el-text>
        <el-button @click="reset">重置</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-card" :class="{ 'bg-loading': loading }">
      <div class="bg-scroll">
        <div v-if="loading && !list.length" class="bg-state">加载中…</div>
        <div v-else-if="!list.length" class="bg-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <path d="M14 2v6h6" />
            <path d="M8 13h8M8 17h5" />
          </svg>
          <div>暂无符合条件的报告</div>
        </div>
        <el-table v-else :data="list">
          <el-table-column prop="id" label="ID" min-width="110" class-name="bg-id" />
          <el-table-column label="报告名称" min-width="220">
            <template #default="{ row }">
              <span class="bg-cname" :title="row.name">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="报告类型" min-width="110">
            <template #default="{ row }">
              <span class="bg-pill st-doing">{{ row.type || '接口定义' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="执行结果" min-width="100">
            <template #default="{ row }">
              <span class="bg-pill" :class="resultCls(row.result)">{{ row.result || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="通过率" min-width="150">
            <template #default="{ row }">
              <span class="bg-rate">
                <span class="bg-rate-bar">
                  <span class="bg-rate-fill" :class="rateCls(row.passRate)"
                    :style="{ width: Math.min(100, row.passRate ?? 0) + '%' }"></span>
                </span>
                <span class="bg-rate-num" :style="{ color: rateColor(row.passRate) }">{{ row.passRate ?? 0 }}%</span>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="用例" min-width="120">
            <template #default="{ row }">
              <span style="color: #18a058; font-weight: 600">{{ row.success ?? 0 }}</span>
              <span style="color: var(--el-text-color-placeholder, #a8abb2)"> / </span>
              <span style="color: #d93838; font-weight: 600">{{ row.fail ?? 0 }}</span>
              <span style="color: var(--el-text-color-placeholder, #a8abb2)">（共 {{ row.total ?? 0 }}）</span>
            </template>
          </el-table-column>
          <el-table-column label="执行人" min-width="130">
            <template #default="{ row }">
              <div v-if="row.executor" class="bg-user">
                <span class="bg-avatar" :style="{ background: avatarColor(row.executor) }">{{ row.executor.slice(0, 1)
                }}</span>
                <span>{{ row.executor }}</span>
              </div>
              <span v-else style="color: var(--el-text-color-placeholder, #a8abb2)">—</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" min-width="160" class-name="bg-time" />
          <el-table-column label="操作" min-width="110">
            <template #default="{ row }">
              <div class="bg-ops">
                <el-button link style="color:#18a058" @click="viewDetail(row)">查看</el-button>
                <el-button link type="danger" @click="onDelete(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="bg-foot">
        <div class="bg-total">共 {{ total }} 份报告，第 {{ pageNum }} / {{ pages }} 页</div>
        <el-pagination :current-page="pageNum" :page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total"
          layout="sizes, prev, pager, next" @current-change="goPage"
          @size-change="(n: number) => { pageSize = n; goPage(1); }" />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="`报告详情：${detail?.name || ''}`" width="760px" destroy-on-close>
      <div v-if="detailLoading" class="at-spin"><span class="dot"></span>加载中…</div>
      <template v-else-if="detail">
        <div class="at-rpt-sum">
          <div class="at-rpt-item">
            <div class="k">报告类型</div>
            <div class="v">{{ detail.type || '—' }}</div>
          </div>
          <div class="at-rpt-item">
            <div class="k">执行结果</div>
            <div class="v" :class="detail.result === '成功' ? 'pass' : detail.result === '失败' ? 'fail' : ''">{{
              detail.result || '—' }}</div>
          </div>
          <div class="at-rpt-item">
            <div class="k">通过率</div>
            <div class="v pass">{{ detail.passRate ?? 0 }}%</div>
          </div>
          <div class="at-rpt-item">
            <div class="k">成功 / 失败</div>
            <div class="v">{{ detail.success ?? 0 }} / {{ detail.fail ?? 0 }}</div>
          </div>
        </div>
        <div class="bg-scroll" style="border-top: 1px solid var(--el-border-color-lighter, #ebeef5)">
          <el-table :data="detail.steps">
            <el-table-column label="#" min-width="60">
              <template #default="{ $index }">
                <span class="bg-id">{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="接口名称" min-width="180">
              <template #default="{ row }">
                <span class="bg-cname">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="方法" min-width="90">
              <template #default="{ row }">
                <span class="m-badge" :class="methodBadgeCls(row.method)">{{ row.method }}</span>
              </template>
            </el-table-column>
            <el-table-column label="路径" min-width="240">
              <template #default="{ row }">
                <span class="at-path">{{ row.path }}</span>
              </template>
            </el-table-column>
            <el-table-column label="结果" min-width="90">
              <template #default="{ row }">
                <span class="bg-pill" :class="row.result === '成功' ? 'st-pass' : 'st-fail'">{{ row.result }}</span>
              </template>
            </el-table-column>
            <el-table-column label="耗时" min-width="100">
              <template #default="{ row }">
                <span class="bg-time">{{ row.time }} ms</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
      <div v-else class="bg-state">加载报告详情失败</div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchApiReportPage, fetchApiReport, deleteApiReport } from '@/api/apiTest'
import type { ApiReport } from '@/types/models'

const reportTypes = ['接口定义', '接口场景', '批量测试']
const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#6366f1', '#ec4899']

const list = ref<ApiReport[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const filter = reactive({ keyword: '', type: '' })

const detail = ref<ApiReport | null>(null)
const detailVisible = ref(false)
const detailLoading = ref(false)

const pages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

function resultCls(result: string): string {
  const map: Record<string, string> = { '成功': 'st-pass', '失败': 'st-fail', '部分成功': 'st-part' }
  return map[result] || 'st-wait'
}

function rateCls(v: number | undefined): string {
  const rate = v ?? 0
  return rate >= 90 ? 'rt-good' : rate >= 60 ? 'rt-mid' : 'rt-bad'
}

function methodBadgeCls(method: string): string {
  const map: Record<string, string> = { GET: 'm-get', POST: 'm-post', PUT: 'm-put', DELETE: 'm-del', PATCH: 'm-patch', HEAD: 'm-head', OPTIONS: 'm-opt' }
  return map[method] || 'm-get'
}

function rateColor(v: number | undefined): string {
  const rate = v ?? 0
  return rate >= 90 ? '#18a058' : rate >= 60 ? '#d67f1b' : '#d93838'
}

function avatarColor(name: string): string {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[h % 8]
}

async function load() {
  loading.value = true
  try {
    const res = await fetchApiReportPage({
      pageNum: pageNum.value, pageSize: pageSize.value,
      keyword: filter.keyword.trim(), type: filter.type,
    })
    list.value = res.list ?? []
    total.value = res.total ?? 0
  } catch {
    list.value = []; total.value = 0
  } finally {
    loading.value = false
  }
}

function search() { pageNum.value = 1; load() }
function reset() {
  filter.keyword = ''; filter.type = ''
  pageNum.value = 1; pageSize.value = 10
  load()
}
function goPage(p: number) {
  if (!p || p < 1 || p > pages.value || p === pageNum.value) return
  pageNum.value = p; load()
}

let timer: ReturnType<typeof setTimeout> | null = null
watch(() => filter.keyword, () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => search(), 320)
})
onUnmounted(() => { if (timer) clearTimeout(timer) })

async function viewDetail(item: ApiReport) {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await fetchApiReport(item.id)
  } catch {
    detail.value = null
  } finally {
    detailLoading.value = false
  }
}

async function onDelete(row: ApiReport) {
  try {
    await ElMessageBox.confirm(`确认删除报告「${row.name}」？`, '删除报告', { type: 'warning' })
  } catch { return }
  await deleteApiReport(row.id)
  ElMessage.success('已删除')
  load()
}

onMounted(load)
</script>

<style>
.rp-page {
  display: flex;
  flex-direction: column;
}

/* 报告详情弹窗 */
.at-spin {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary, #909399);
}

.at-spin .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-primary, #409eff);
  animation: at-spin-dot 0.9s infinite alternate;
}

@keyframes at-spin-dot {
  from {
    opacity: 0.25;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1.2);
  }
}

.at-rpt-sum {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 12px 14px;
}

.at-rpt-item {
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--el-fill-color-light, #fafafa);
}

.at-rpt-item .k {
  font-size: 11.5px;
  color: var(--el-text-color-secondary, #909399);
  margin-bottom: 4px;
}

.at-rpt-item .v {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.at-rpt-item .v.pass {
  color: #18a058;
}

.at-rpt-item .v.fail {
  color: #d93838;
}

@media (max-width: 900px) {
  .at-rpt-sum {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>