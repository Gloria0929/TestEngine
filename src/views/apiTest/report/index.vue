<template>
  <div class="rp-page">
    <!-- 搜索栏 -->
    <div class="bg-bar">
      <div class="bg-field">
        <label class="bg-lab">关键词</label>
        <input class="bg-in" style="width: 220px" v-model="filter.keyword" placeholder="搜索报告名称 / ID" @keydown.enter="search" />
      </div>
      <div class="bg-field">
        <label class="bg-lab">报告类型</label>
        <select class="bg-sel" style="width: 130px" v-model="filter.type" @change="search">
          <option value="">全部</option>
          <option v-for="t in reportTypes" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      <div class="bg-spacer" />
      <div class="bg-field">
        <label class="bg-lab">&nbsp;</label>
        <button class="bg-btn bg-btn-pri" @click="search">查询</button>
      </div>
      <div class="bg-field">
        <label class="bg-lab">&nbsp;</label>
        <button class="bg-btn" @click="reset">重置</button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-card" :class="{ 'bg-loading': loading }">
      <div class="bg-scroll">
        <div v-if="loading && !list.length" class="bg-state">加载中…</div>
        <div v-else-if="!list.length" class="bg-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>
          <div>暂无符合条件的报告</div>
        </div>
        <table v-else class="bg-tb">
          <thead>
            <tr>
              <th style="width: 110px">ID</th>
              <th style="min-width: 220px">报告名称</th>
              <th style="width: 110px">报告类型</th>
              <th style="width: 100px">执行结果</th>
              <th style="width: 150px">通过率</th>
              <th style="width: 120px">用例</th>
              <th style="width: 130px">执行人</th>
              <th style="width: 160px">创建时间</th>
              <th style="width: 110px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in list" :key="row.id">
              <td class="bg-id">{{ row.id }}</td>
              <td><span class="bg-cname" :title="row.name">{{ row.name }}</span></td>
              <td><span class="bg-pill st-doing">{{ row.type || '接口定义' }}</span></td>
              <td><span class="bg-pill" :class="resultCls(row.result)">{{ row.result || '—' }}</span></td>
              <td>
                <span class="bg-rate">
                  <span class="bg-rate-bar">
                    <span class="bg-rate-fill" :class="rateCls(row.passRate)" :style="{ width: Math.min(100, row.passRate ?? 0) + '%' }"></span>
                  </span>
                  <span class="bg-rate-num" :style="{ color: rateColor(row.passRate) }">{{ row.passRate ?? 0 }}%</span>
                </span>
              </td>
              <td>
                <span style="color: #18a058; font-weight: 600">{{ row.success ?? 0 }}</span>
                <span style="color: var(--el-text-color-placeholder, #a8abb2)"> / </span>
                <span style="color: #d93838; font-weight: 600">{{ row.fail ?? 0 }}</span>
                <span style="color: var(--el-text-color-placeholder, #a8abb2)">（共 {{ row.total ?? 0 }}）</span>
              </td>
              <td>
                <div v-if="row.executor" class="bg-user">
                  <span class="bg-avatar" :style="{ background: avatarColor(row.executor) }">{{ row.executor.slice(0, 1) }}</span>
                  <span>{{ row.executor }}</span>
                </div>
                <span v-else style="color: var(--el-text-color-placeholder, #a8abb2)">—</span>
              </td>
              <td class="bg-time">{{ row.createTime }}</td>
              <td>
                <div class="bg-ops">
                  <button class="bg-op bg-op-view" @click="viewDetail(row)">查看</button>
                  <button class="bg-op bg-op-del" @click="onDelete(row)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="bg-foot">
        <div class="bg-total">共 {{ total }} 份报告，第 {{ pageNum }} / {{ pages }} 页</div>
        <div class="bg-pager">
          <span class="bg-size">每页</span>
          <select class="bg-sel" style="width: 74px" v-model.number="pageSize" @change="goPage(1)">
            <option v-for="n in [10, 20, 50]" :key="n" :value="n">{{ n }}</option>
          </select>
          <span class="bg-size">条</span>
          <span style="width: 8px"></span>
          <button class="bg-pg" :disabled="pageNum <= 1" @click="goPage(pageNum - 1)">上一页</button>
          <template v-for="(p, i) in pageNums" :key="i">
            <button v-if="p === '...'" class="bg-pg" disabled>…</button>
            <button v-else class="bg-pg" :class="{ on: p === pageNum }" @click="goPage(p)">{{ p }}</button>
          </template>
          <button class="bg-pg" :disabled="pageNum >= pages" @click="goPage(pageNum + 1)">下一页</button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="detailVisible" class="bg-mask" @click.self="detailVisible = false">
      <div class="bg-modal" style="width: 760px">
        <h3>报告详情：{{ detail?.name }}</h3>
        <div v-if="detailLoading" class="at-spin"><span class="dot"></span>加载中…</div>
        <template v-else-if="detail">
          <div class="at-rpt-sum">
            <div class="at-rpt-item">
              <div class="k">报告类型</div>
              <div class="v">{{ detail.type || '—' }}</div>
            </div>
            <div class="at-rpt-item">
              <div class="k">执行结果</div>
              <div class="v" :class="detail.result === '成功' ? 'pass' : detail.result === '失败' ? 'fail' : ''">{{ detail.result || '—' }}</div>
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
            <table class="bg-tb">
              <thead>
                <tr>
                  <th style="width: 60px">#</th>
                  <th style="min-width: 180px">接口名称</th>
                  <th style="width: 90px">方法</th>
                  <th style="min-width: 160px">路径</th>
                  <th style="width: 90px">结果</th>
                  <th style="width: 100px">耗时</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, i) in detail.steps" :key="i">
                  <td class="bg-id">{{ i + 1 }}</td>
                  <td class="bg-cname">{{ s.name }}</td>
                  <td><span class="m-badge" :class="methodBadgeCls(s.method)">{{ s.method }}</span></td>
                  <td class="at-path">{{ s.path }}</td>
                  <td><span class="bg-pill" :class="s.result === '成功' ? 'st-pass' : 'st-fail'">{{ s.result }}</span></td>
                  <td class="bg-time">{{ s.time }} ms</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <div v-else class="bg-state">加载报告详情失败</div>
        <div class="bg-modal-foot">
          <button class="bg-btn" @click="detailVisible = false">关闭</button>
        </div>
      </div>
    </div>
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

const pageNums = computed(() => {
  const cur = pageNum.value, tot = pages.value
  const out: (number | '...')[] = []
  for (let i = 1; i <= tot; i++) {
    if (i === 1 || i === tot || Math.abs(i - cur) <= 1) out.push(i)
    else if (out[out.length - 1] !== '...') out.push('...')
  }
  return out
})

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
.rp-page { height: 100%; display: flex; flex-direction: column; }

/* 报告详情弹窗 */
.at-spin {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 40px 16px; font-size: 13px; color: var(--el-text-color-secondary, #909399);
}
.at-spin .dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--el-color-primary, #409eff);
  animation: at-spin-dot 0.9s infinite alternate;
}
@keyframes at-spin-dot {
  from { opacity: 0.25; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1.2); }
}
.at-rpt-sum {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 12px 14px;
}
.at-rpt-item {
  border: 1px solid var(--el-border-color-lighter, #ebeef5); border-radius: 8px;
  padding: 10px 12px; background: var(--el-fill-color-light, #fafafa);
}
.at-rpt-item .k {
  font-size: 11.5px; color: var(--el-text-color-secondary, #909399); margin-bottom: 4px;
}
.at-rpt-item .v {
  font-size: 16px; font-weight: 600; color: var(--el-text-color-primary, #303133);
}
.at-rpt-item .v.pass { color: #18a058; }
.at-rpt-item .v.fail { color: #d93838; }

@media (max-width: 900px) {
  .at-rpt-sum { grid-template-columns: repeat(2, 1fr); }
}
</style>