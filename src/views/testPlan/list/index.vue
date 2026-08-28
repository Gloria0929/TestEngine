<template>
  <div class="plan-list">
    <div class="toolbar">
      <el-input v-model="query.keyword" :placeholder="t('common.search')" clearable style="width: 220px" @change="load" />
      <div class="spacer" />
      <el-button type="primary" @click="openEdit()">{{ t('common.add') }}</el-button>
    </div>
    <DataTable :columns="columns" :data="rows" :loading="loading" :total="total" :page="page"
      :actions-width="320" @page-change="onPage">
      <template #col-status="{ row }">
        <el-tag :type="statusTag(row.status).type" size="small">{{ statusTag(row.status).label }}</el-tag>
      </template>
      <template #col-duration="{ row }">{{ row.startTime }} ~ {{ row.endTime }}</template>
      <template #col-progress="{ row }"><el-progress :percentage="row.progress" /></template>
      <template #actions="{ row }">
        <el-button link type="primary" @click="openEdit(row)">{{ t('common.edit') }}</el-button>
        <el-button link type="primary" @click="onExecute(row)">执行</el-button>
        <el-button link type="primary" @click="onCopy(row)">复制</el-button>
        <el-button link type="danger" @click="onDelete(row)">{{ t('common.delete') }}</el-button>
        <el-button link type="primary" @click="onReport(row)">查看报告</el-button>
      </template>
    </DataTable>

    <el-dialog v-model="editVisible" :title="editingId ? t('common.edit') : t('common.add')" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item prop="name" label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item prop="owner" label="负责人"><el-input v-model="form.owner" /></el-form-item>
        <el-form-item prop="startTime" label="开始时间"><el-input v-model="form.startTime" placeholder="如 2026-08-25" /></el-form-item>
        <el-form-item prop="endTime" label="结束时间"><el-input v-model="form.endTime" placeholder="如 2026-08-28" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="onSave">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import DataTable, { type DataColumn } from '@/components/DataTable.vue'
import { fetchPlans, createPlan, updatePlan, deletePlan, copyPlan } from '@/api/testPlan'
import type { TestPlan } from '@/types/models'

const { t } = useI18n()
const router = useRouter()
const rows = ref<TestPlan[]>([])
const loading = ref(false)
const total = ref(0)
const page = reactive({ pageNum: 1, pageSize: 10 })
const query = reactive({ keyword: '' })

const columns: DataColumn[] = [
  { prop: 'name', label: '名称', minWidth: 200 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'owner', label: '负责人', width: 120 },
  { prop: 'duration', label: '起止时间', minWidth: 220 },
  { prop: 'progress', label: '进度', width: 180 },
]

function statusTag(s: TestPlan['status']) {
  return { DRAFT: { label: '草稿', type: 'info' }, RUNNING: { label: '进行中', type: 'primary' }, DONE: { label: '已完成', type: 'success' } }[s] as { label: string; type: 'info' | 'primary' | 'success' }
}
function onPage(p: number, s: number) { page.pageNum = p; page.pageSize = s; load() }
function onExecute(row: TestPlan) { router.push({ path: '/test-plan/execute/' + row.id, query: { name: row.name } }) }
function onReport(row: TestPlan) { router.push(`/test-plan/report/${row.id}`) }
async function onCopy(row: TestPlan) {
  await copyPlan(row.id)
  ElMessage.success(t('common.success'))
  load()
}
async function onDelete(row: TestPlan) {
  await ElMessageBox.confirm(t('common.deleteConfirm'), t('common.confirm'), { type: 'warning' })
  await deletePlan(row.id)
  ElMessage.success(t('common.success'))
  load()
}
async function load() {
  loading.value = true
  const params = { ...query, pageNum: page.pageNum, pageSize: page.pageSize }
  const res = await fetchPlans(params as never)
  rows.value = res.list
  total.value = res.total
  loading.value = false
}

const editVisible = ref(false)
const saving = ref(false)
const editingId = ref('')
const formRef = ref<FormInstance>()
const form = reactive<TestPlan>({ id: '', projectId: 'p-1', name: '', status: 'DRAFT', owner: '', startTime: '', endTime: '', progress: 0 })
const rules = { name: [{ required: true, message: '请输入名称', trigger: 'blur' }], owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }] }

function openEdit(row?: TestPlan) {
  editingId.value = row?.id ?? ''
  if (row) {
    form.id = row.id
    form.projectId = row.projectId
    form.name = row.name
    form.status = row.status
    form.owner = row.owner
    form.startTime = row.startTime
    form.endTime = row.endTime
    form.progress = row.progress
  } else {
    form.id = ''
    form.projectId = 'p-1'
    form.name = ''
    form.status = 'DRAFT'
    form.owner = ''
    form.startTime = ''
    form.endTime = ''
    form.progress = 0
  }
  editVisible.value = true
}
async function onSave() {
  await formRef.value!.validate()
  saving.value = true
  if (editingId.value) {
    await updatePlan(editingId.value, { ...form })
  } else {
    await createPlan({ ...form })
  }
  saving.value = false
  ElMessage.success(t('common.success'))
  editVisible.value = false
  load()
}
onMounted(load)
</script>
<style scoped>
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.spacer { flex: 1; }
</style>
