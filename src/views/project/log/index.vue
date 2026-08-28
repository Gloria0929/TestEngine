<template>
  <div class="log">
    <div class="toolbar">
      <el-select v-model="filterScope" placeholder="范围" clearable style="width: 140px" @change="onFilter">
        <el-option v-for="s in scopes" :key="s" :label="s" :value="s" />
      </el-select>
      <el-input v-model="filterObject" placeholder="对象" clearable style="width: 180px" @change="onFilter" />
      <el-input v-model="filterTime" placeholder="时间" clearable style="width: 180px" @change="onFilter" />
    </div>
    <DataTable :columns="columns" :data="rows" :loading="loading" :total="total" :page="page" @page-change="onPage" />
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import DataTable, { type DataColumn } from '@/components/DataTable.vue'
import { fetchOperationLogs } from '@/api/project'
import type { PageQuery } from '@/types'
import type { OperationLog } from '@/types/models'

const scopes = ['用例', '场景', '接口', '缺陷']
const rows = ref<OperationLog[]>([])
const loading = ref(false)
const total = ref(0)
const page = reactive({ pageNum: 1, pageSize: 10 })
const filterScope = ref('')
const filterObject = ref('')
const filterTime = ref('')

const columns: DataColumn[] = [
  { prop: 'scope', label: '范围', width: 100 },
  { prop: 'object', label: '对象', minWidth: 200 },
  { prop: 'action', label: '操作', width: 100 },
  { prop: 'user', label: '用户', width: 140 },
  { prop: 'time', label: '时间', width: 160 },
]

function onPage(p: number, s: number) { page.pageNum = p; page.pageSize = s; load() }
function onFilter() { page.pageNum = 1; load() }
async function load() {
  loading.value = true
  const params: PageQuery = {
    pageNum: page.pageNum,
    pageSize: page.pageSize,
    scope: filterScope.value || undefined,
    object: filterObject.value || undefined,
    time: filterTime.value || undefined,
  }
  const res = await fetchOperationLogs(params)
  rows.value = res.list
  total.value = res.total
  loading.value = false
}
onMounted(load)
</script>
<style scoped>
.toolbar { display: flex; gap: 12px; margin-bottom: 12px; }
</style>
