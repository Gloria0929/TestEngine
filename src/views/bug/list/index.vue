<template>
  <div class="bug-list">
    <div class="toolbar">
      <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 130px" @change="onFilter">
        <el-option v-for="s in bugStatuses" :key="s" :label="statusMap[s].label" :value="s" />
      </el-select>
      <el-select v-model="filterSeverity" placeholder="严重程度" clearable style="width: 130px" @change="onFilter">
        <el-option v-for="s in bugSeverities" :key="s" :label="severityMap[s].label" :value="s" />
      </el-select>
      <el-input v-model="filterAssignee" placeholder="处理人" clearable style="width: 140px" @change="onFilter" />
      <el-input v-model="keyword" :placeholder="t('common.search')" clearable style="width: 220px" @change="onFilter" />
      <div class="spacer" />
      <el-button type="primary" @click="openEdit()">{{ t('common.add') }}</el-button>
    </div>
    <DataTable :columns="columns" :data="rows" :loading="loading" :total="total" :page="page"
      :actions-width="320" @page-change="onPage">
      <template #col-title="{ row }"><el-link type="primary" @click="openDetail(row)">{{ row.title }}</el-link></template>
      <template #col-severity="{ row }">
        <el-tag :color="severityMap[row.severity as BugSeverity].color" size="small">{{ severityMap[row.severity as BugSeverity].label }}</el-tag>
      </template>
      <template #col-status="{ row }">
        <el-tag :type="statusMap[row.status as BugStatus].type" size="small">{{ statusMap[row.status as BugStatus].label }}</el-tag>
      </template>
      <template #col-assignee="{ row }">{{ row.assignee || '-' }}</template>
      <template #actions="{ row }">
        <el-button link type="primary" @click="openDetail(row)">详情</el-button>
        <el-button link type="primary" @click="openEdit(row)">{{ t('common.edit') }}</el-button>
        <el-dropdown trigger="click" @command="onTransition(row, $event)">
          <el-button link type="primary">状态流转<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="s in transitions(row.status)" :key="s" :command="s">{{ statusMap[s].label }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button link type="danger" @click="onDelete(row)">{{ t('common.delete') }}</el-button>
      </template>
    </DataTable>

    <BugDialog v-model="editVisible" :bug-data="editing" @saved="load" />

    <el-drawer v-model="drawerVisible" :title="current?.title" size="560px">
      <template v-if="current">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="严重程度">
            <el-tag :color="severityMap[current.severity].color" size="small">{{ severityMap[current.severity].label }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusMap[current.status].type" size="small">{{ statusMap[current.status].label }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理人">{{ current.assignee || '-' }}</el-descriptions-item>
          <el-descriptions-item label="报告人">{{ current.reporter }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ current.createTime }}</el-descriptions-item>
          <el-descriptions-item label="模块">{{ current.moduleId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ current.description }}</el-descriptions-item>
        </el-descriptions>
        <div class="comments">
          <div class="comments-title">评论</div>
          <div v-for="(c, i) in commentList(current.id)" :key="i" class="comment-item">
            <div class="comment-head">
              <span class="comment-user">{{ c.user }}</span>
              <span class="comment-time">{{ c.time }}</span>
            </div>
            <div class="comment-content">{{ c.content }}</div>
          </div>
          <el-empty v-if="!commentList(current.id).length" description="暂无评论" :image-size="60" />
          <div class="comment-input">
            <el-input v-model="commentText" type="textarea" :rows="2" placeholder="添加评论" />
            <el-button type="primary" size="small" @click="onAddComment">发表</el-button>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import DataTable, { type DataColumn } from '@/components/DataTable.vue'
import BugDialog from './components/BugDialog.vue'
import { fetchBugs, updateBug, deleteBug } from '@/api/bug'
import type { PageQuery } from '@/types'
import type { Bug, BugSeverity, BugStatus } from '@/types/models'

const { t } = useI18n()
const rows = ref<Bug[]>([])
const loading = ref(false)
const total = ref(0)
const page = reactive({ pageNum: 1, pageSize: 10 })
const filterStatus = ref('')
const filterSeverity = ref('')
const filterAssignee = ref('')
const keyword = ref('')

const bugStatuses: BugStatus[] = ['NEW', 'ASSIGNED', 'FIXING', 'FIXED', 'CLOSED', 'REOPEN']
const bugSeverities: BugSeverity[] = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'TRIVIAL']
const statusMap: Record<BugStatus, { label: string; type: 'info' | 'primary' | 'warning' | 'success' | 'danger' }> = {
  NEW: { label: '新建', type: 'info' },
  ASSIGNED: { label: '已分配', type: 'primary' },
  FIXING: { label: '修复中', type: 'warning' },
  FIXED: { label: '已修复', type: 'success' },
  CLOSED: { label: '已关闭', type: 'info' },
  REOPEN: { label: '重新打开', type: 'danger' },
}
const severityMap: Record<BugSeverity, { label: string; color: string }> = {
  BLOCKER: { label: '阻塞', color: '#f56c6c' },
  CRITICAL: { label: '严重', color: '#e6a23c' },
  MAJOR: { label: '主要', color: '#f7ba2a' },
  MINOR: { label: '次要', color: '#409eff' },
  TRIVIAL: { label: '轻微', color: '#909399' },
}

const columns: DataColumn[] = [
  { prop: 'title', label: '标题', minWidth: 220 },
  { prop: 'severity', label: '严重程度', width: 110 },
  { prop: 'status', label: '状态', width: 110 },
  { prop: 'assignee', label: '处理人', width: 110 },
  { prop: 'createTime', label: '创建时间', width: 160 },
]

function onPage(p: number, s: number) { page.pageNum = p; page.pageSize = s; load() }
function onFilter() { page.pageNum = 1; load() }
function transitions(s: BugStatus) { return bugStatuses.filter((x) => x !== s) }
async function onTransition(row: Bug, status: BugStatus) {
  await updateBug(row.id, { status })
  ElMessage.success(t('common.success'))
  load()
}
async function onDelete(row: Bug) {
  await ElMessageBox.confirm(t('common.deleteConfirm'), t('common.confirm'), { type: 'warning' })
  await deleteBug(row.id)
  ElMessage.success(t('common.success'))
  load()
}
async function load() {
  loading.value = true
  const params: PageQuery = {
    pageNum: page.pageNum,
    pageSize: page.pageSize,
    keyword: keyword.value || undefined,
    status: filterStatus.value || undefined,
    severity: filterSeverity.value || undefined,
    assignee: filterAssignee.value || undefined,
  }
  const res = await fetchBugs(params)
  rows.value = res.list
  total.value = res.total
  loading.value = false
}

const editVisible = ref(false)
const editing = ref<Bug | null>(null)
function openEdit(row?: Bug) {
  editing.value = row ?? null
  editVisible.value = true
}

const drawerVisible = ref(false)
const current = ref<Bug | null>(null)
const commentText = ref('')
interface BugComment { user: string; content: string; time: string }
const comments = reactive<Record<string, BugComment[]>>({})
function openDetail(row: Bug) {
  current.value = row
  commentText.value = ''
  drawerVisible.value = true
}
function commentList(bugId: string): BugComment[] {
  if (!comments[bugId]) comments[bugId] = []
  return comments[bugId]
}
function onAddComment() {
  if (!current.value) return
  const text = commentText.value.trim()
  if (!text) { ElMessage.warning('请输入评论内容'); return }
  commentList(current.value.id).push({ user: 'Administrator', content: text, time: new Date().toLocaleString() })
  commentText.value = ''
}

onMounted(load)
</script>
<style scoped>
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.spacer { flex: 1; }
.comments { margin-top: 16px; }
.comments-title { font-weight: 500; margin-bottom: 12px; }
.comment-item { padding: 8px 0; border-bottom: 1px solid var(--el-border-color-lighter); }
.comment-head { display: flex; justify-content: space-between; align-items: center; }
.comment-user { font-weight: 500; font-size: 13px; }
.comment-time { color: var(--el-text-color-secondary); font-size: 12px; }
.comment-content { margin-top: 4px; font-size: 13px; color: var(--el-text-color-primary); }
.comment-input { display: flex; gap: 8px; align-items: flex-start; margin-top: 12px; }
.comment-input .el-input { flex: 1; }
</style>
