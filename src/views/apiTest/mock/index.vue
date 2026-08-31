<template>
  <div class="mock">
    <div class="toolbar">
      <el-button type="primary" @click="openCreate">新建</el-button>
    </div>

    <el-table :data="rules" v-loading="loading">
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column label="方法" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="methodType(row.method)">{{ row.method }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路径" min-width="200" />
      <el-table-column label="状态码" width="90">
        <template #default="{ row }">
          <el-tag size="small" :type="statusType(row.responseStatus)">{{ row.responseStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="onCopy(row)">复制地址</el-button>
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="editVisible" :title="editingId ? '编辑 Mock 规则' : '新建 Mock 规则'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="引用接口">
          <el-select v-model="form.definitionId" style="width: 100%" placeholder="选择接口定义">
            <el-option v-for="d in definitions" :key="d.id" :label="`${d.method} ${d.path}`" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="方法">
          <el-select v-model="form.method" style="width: 100%">
            <el-option v-for="m in methods" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item label="路径"><el-input v-model="form.path" placeholder="/api/xxx" /></el-form-item>
        <el-form-item label="匹配条件">
          <KeyValueEditor v-model="form.match" />
        </el-form-item>
        <el-form-item label="响应状态码">
          <el-input-number v-model="form.responseStatus" :min="100" :max="599" />
        </el-form-item>
        <el-form-item label="响应体">
          <el-input v-model="form.responseBody" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="延迟(ms)">
          <el-input-number v-model="form.delay" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import KeyValueEditor from '@/views/apiTest/debug/components/KeyValueEditor.vue'
import { fetchMockRules, saveMockRule, updateMockRule, deleteMockRule, fetchApiDefinitions } from '@/api/apiTest'
import type { MockRule, HttpMethod, ApiDefinition } from '@/types/models'

type TagType = 'success' | 'warning' | 'info' | 'primary' | 'danger'
const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'CONNECT']

const rules = ref<MockRule[]>([])
const definitions = ref<ApiDefinition[]>([])
const loading = ref(false)
const editVisible = ref(false)
const saving = ref(false)
const editingId = ref('')

const form = reactive<MockRule>({
  id: '', name: '', definitionId: '', method: 'GET', path: '', match: [], responseStatus: 200, responseBody: '', delay: 0,
})

function methodType(m: HttpMethod): TagType {
  const map: Record<HttpMethod, TagType> = {
    GET: 'success', POST: 'warning', PUT: 'primary', DELETE: 'danger', PATCH: 'info', OPTIONS: 'info', HEAD: 'info', CONNECT: 'info',
  }
  return map[m]
}
function statusType(code: number): TagType {
  if (code >= 200 && code < 300) return 'success'
  if (code >= 400 && code < 500) return 'warning'
  if (code >= 500) return 'danger'
  return 'info'
}

async function load() {
  loading.value = true
  try {
    rules.value = await fetchMockRules()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = ''
  Object.assign(form, { id: '', name: '', definitionId: '', method: 'GET', path: '', match: [], responseStatus: 200, responseBody: '', delay: 0 })
  editVisible.value = true
}

function openEdit(row: MockRule) {
  editingId.value = row.id
  Object.assign(form, {
    id: row.id, name: row.name, definitionId: row.definitionId, method: row.method, path: row.path,
    match: row.match.map((m) => ({ ...m })), responseStatus: row.responseStatus, responseBody: row.responseBody, delay: row.delay,
  })
  editVisible.value = true
}

async function onSave() {
  if (!form.name.trim() || !form.path.trim() || !form.definitionId) { ElMessage.warning('请填写名称、路径与引用接口'); return }
  saving.value = true
  const payload: MockRule = { ...form, match: form.match.map((m) => ({ ...m })) }
  if (editingId.value) await updateMockRule(editingId.value, payload)
  else await saveMockRule(payload)
  saving.value = false
  ElMessage.success('已保存')
  editVisible.value = false
  load()
}

async function onDelete(row: MockRule) {
  try {
    await ElMessageBox.confirm('确认删除该 Mock 规则？', '提示', { type: 'warning' })
  } catch {
    return
  }
  await deleteMockRule(row.id)
  ElMessage.success('已删除')
  load()
}

async function onCopy(row: MockRule) {
  try {
    await navigator.clipboard.writeText('https://mock.testengine.io' + row.path)
    ElMessage.success('地址已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

onMounted(async () => {
  const [mockRules, defs] = await Promise.all([fetchMockRules(), fetchApiDefinitions()])
  rules.value = mockRules
  definitions.value = defs
})
</script>
<style scoped>
.mock { padding: 12px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
</style>
