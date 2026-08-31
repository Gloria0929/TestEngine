<template>
  <div class="case-list">
    <div class="left"><ModuleTree :modules="modules" :selected="moduleId" @select="onSelect" @add="onAddModule" /></div>
    <div class="right">
      <div class="toolbar">
        <el-input v-model="query.keyword" :placeholder="'搜索'" clearable style="width: 220px" @change="load" />
        <el-select v-model="level" placeholder="等级" clearable style="width: 120px" @change="load">
          <el-option v-for="lv in levels" :key="lv" :label="lv" :value="lv" />
        </el-select>
        <div class="spacer" />
        <el-button v-permission="'testCase:create'" type="primary" @click="openEdit()">{{ '新建' }}</el-button>
        <el-button @click="onExport">{{ '导出' }}</el-button>
        <el-button @click="importVisible = true">{{ '导入' }}</el-button>
      </div>
      <DataTable :columns="columns" :data="rows" :loading="loading" :total="total" :page="page"
        selection @page-change="onPage" @selection-change="(s) => selected = s">
        <template #col-name="{ row }"><el-link type="primary" @click="openDetail(row)">{{ row.name }}</el-link></template>
        <template #col-level="{ row }"><el-tag size="small">{{ row.level }}</el-tag></template>
        <template #col-status="{ row }">{{ statusText(row.status) }}</template>
        <template #actions="{ row }">
          <el-button link type="primary" @click="openEdit(row)">{{ '编辑' }}</el-button>
          <el-button link type="danger" @click="onDelete(row)">{{ '删除' }}</el-button>
        </template>
      </DataTable>
    </div>
    <CaseEditDialog v-model="editVisible" :case-data="editing" @saved="load" />
    <ImportDialog v-model="importVisible" @imported="load" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import ModuleTree from '@/components/ModuleTree.vue'
import DataTable, { type DataColumn } from '@/components/DataTable.vue'
import CaseEditDialog from './components/CaseEditDialog.vue'
import ImportDialog from './components/ImportDialog.vue'
import { fetchModuleTree, fetchCaseList, deleteCase } from '@/api/testCase'
import { exportCases } from '@/utils/excel'
import type { TestCase, ModuleNode } from '@/types/models'

const router = useRouter()
const modules = ref<ModuleNode[]>([])
const moduleId = ref('')
const level = ref('')
const levels = ['P0', 'P1', 'P2', 'P3']
const rows = ref<TestCase[]>([])
const loading = ref(false)
const total = ref(0)
const selected = ref<unknown[]>([])
const page = reactive({ pageNum: 1, pageSize: 10 })
const query = reactive({ keyword: '' })

const columns: DataColumn[] = [
  { prop: 'name', label: '用例名称', minWidth: 240 },
  { prop: 'level', label: '等级', width: 80 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'executor', label: '执行人', width: 100 },
  { prop: 'updateTime', label: '更新时间', width: 160 },
]
function statusText(s: TestCase['status']) { return { DRAFT: '草稿', REVIEW: '待评审', READY: '就绪' }[s] ?? s }
function onSelect(id: string) { moduleId.value = id; load() }
function onAddModule(_parentId: string | null) { ElMessage.info('模块新建（Task 3.1 已接接口）') }
function onPage(p: number, s: number) { page.pageNum = p; page.pageSize = s; load() }
function openEdit(row?: TestCase) { editVisible.value = true; editing.value = row ?? null }
function openDetail(row: TestCase) { router.push(`/test-case/detail/${row.id}`) }
function onExport() { exportCases(rows.value) }
async function onDelete(row: TestCase) {
  await ElMessageBox.confirm('确认删除？删除后可在回收站恢复', '确认', { type: 'warning' })
  await deleteCase(row.id)
  ElMessage.success('操作成功')
  load()
}
async function load() {
  loading.value = true
  try {
    const params = { ...query, pageNum: page.pageNum, pageSize: page.pageSize, moduleId: moduleId.value || undefined, level: level.value || undefined }
    const res = await fetchCaseList(params as never)
    rows.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}
const editVisible = ref(false)
const importVisible = ref(false)
const editing = ref<TestCase | null>(null)
onMounted(async () => { modules.value = await fetchModuleTree('p-1'); load() })
</script>
<style scoped>
.case-list { display: flex; gap: 16px; }
.left { width: 240px; flex-shrink: 0; }
.right { flex: 1; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.spacer { flex: 1; }
</style>
