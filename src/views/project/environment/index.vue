<template>
  <div class="environment">
    <div class="toolbar">
      <el-button type="primary" @click="openEdit()">新增环境</el-button>
    </div>
    <el-table :data="environments" v-loading="loading">
      <el-table-column prop="name" label="名称" width="160" />
      <el-table-column prop="domain" label="域名" min-width="240" />
      <el-table-column label="变量" width="90">
        <template #default="{ row }">{{ row.variables.length }}</template>
      </el-table-column>
      <el-table-column label="HOST 映射" width="110">
        <template #default="{ row }">{{ row.hosts.length }}</template>
      </el-table-column>
      <el-table-column label="公共请求头" width="110">
        <template #default="{ row }">{{ row.headers.length }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="drawerVisible" :title="editingId ? '编辑环境' : '新增环境'" size="480px">
      <el-form label-width="90px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="环境名称" />
        </el-form-item>
        <el-form-item label="域名">
          <el-input v-model="form.domain" placeholder="http://" />
        </el-form-item>
      </el-form>
      <div class="section">
        <div class="section-title">变量</div>
        <KeyValueEditor v-model="form.variables" />
      </div>
      <div class="section">
        <div class="section-title">HOST 映射</div>
        <KeyValueEditor v-model="form.hosts" />
      </div>
      <div class="section">
        <div class="section-title">公共请求头</div>
        <KeyValueEditor v-model="form.headers" />
      </div>
      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import KeyValueEditor from '@/views/apiTest/debug/components/KeyValueEditor.vue'
import { fetchEnvironments, createEnvironment, updateEnvironment, deleteEnvironment } from '@/api/project'
import type { Environment } from '@/types/models'

const PROJECT_ID = 'p-1'
const environments = ref<Environment[]>([])
const loading = ref(false)
const drawerVisible = ref(false)
const editingId = ref('')
const form = reactive({
  name: '',
  domain: '',
  variables: [] as Environment['variables'],
  hosts: [] as Environment['hosts'],
  headers: [] as Environment['headers'],
})

function openEdit(row?: Environment) {
  editingId.value = row?.id ?? ''
  form.name = row?.name ?? ''
  form.domain = row?.domain ?? ''
  form.variables = (row?.variables ?? []).map((v) => ({ ...v }))
  form.hosts = (row?.hosts ?? []).map((v) => ({ ...v }))
  form.headers = (row?.headers ?? []).map((v) => ({ ...v }))
  drawerVisible.value = true
}
async function onSave() {
  const data = {
    projectId: PROJECT_ID,
    name: form.name,
    domain: form.domain,
    variables: form.variables,
    hosts: form.hosts,
    headers: form.headers,
  }
  if (editingId.value) await updateEnvironment(editingId.value, data)
  else await createEnvironment(data)
  ElMessage.success('已保存')
  drawerVisible.value = false
  load()
}
async function onDelete(row: Environment) {
  await ElMessageBox.confirm(`确定删除环境 ${row.name}？`, '提示', { type: 'warning' })
  await deleteEnvironment(row.id)
  ElMessage.success('已删除')
  load()
}
async function load() {
  loading.value = true
  environments.value = await fetchEnvironments()
  loading.value = false
}
onMounted(load)
</script>
<style scoped>
.toolbar { margin-bottom: 12px; }
.section { margin-top: 16px; }
.section-title { font-weight: 600; margin-bottom: 8px; }
</style>
