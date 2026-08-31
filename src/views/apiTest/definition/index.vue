<template>
  <div class="definition">
    <div class="toolbar">
      <el-radio-group v-model="viewMode">
        <el-radio-button value="list">列表</el-radio-button>
        <el-radio-button value="doc">文档</el-radio-button>
      </el-radio-group>
      <div class="spacer" />
      <el-button type="primary" @click="openCreate">新建</el-button>
      <el-button @click="importVisible = true">导入</el-button>
    </div>

    <el-table v-if="viewMode === 'list'" :data="definitions" v-loading="loading">
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column label="方法" width="90">
        <template #default="{ row }"><el-tag size="small">{{ row.method }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="path" label="路径" min-width="200" />
      <el-table-column prop="protocol" label="协议" width="90" />
      <el-table-column prop="description" label="描述" min-width="160" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-tree v-else :data="tree" node-key="id" default-expand-all>
      <template #default="{ data }">
        <span class="tree-node">
          <span v-if="data.method" class="method" :class="data.method.toLowerCase()">{{ data.method }}</span>
          <span class="tree-name">{{ data.name }}</span>
          <span v-if="data.path" class="tree-path">{{ data.path }}</span>
        </span>
      </template>
    </el-tree>

    <el-dialog v-model="editVisible" :title="editingId ? '编辑接口' : '新建接口'" width="560px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="协议">
          <el-select v-model="form.protocol" style="width: 100%">
            <el-option v-for="p in protocols" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="方法">
          <el-select v-model="form.method" style="width: 100%">
            <el-option v-for="m in methods" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item label="路径"><el-input v-model="form.path" placeholder="/api/xxx" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="模块">
          <el-select v-model="form.moduleId" style="width: 100%">
            <el-option v-for="m in moduleOptions" :key="m.id" :label="m.name" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
      </template>
    </el-dialog>

    <ImportDialog v-model="importVisible" @imported="load" />
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ImportDialog from './components/ImportDialog.vue'
import { fetchApiDefinitions, createApiDefinition, updateApiDefinition, deleteApiDefinition } from '@/api/apiTest'
import { fetchModuleTree } from '@/api/testCase'
import type { ApiDefinition, ModuleNode, HttpMethod } from '@/types/models'

const protocols: ApiDefinition['protocol'][] = ['HTTP', 'TCP', 'SQL', 'DUBBO']
const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'CONNECT']

const viewMode = ref<'list' | 'doc'>('list')
const definitions = ref<ApiDefinition[]>([])
const modules = ref<ModuleNode[]>([])
const loading = ref(false)
const editVisible = ref(false)
const importVisible = ref(false)
const saving = ref(false)
const editingId = ref('')

const form = reactive<{ name: string; method: HttpMethod; path: string; protocol: ApiDefinition['protocol']; moduleId: string; description: string }>({
  name: '', method: 'GET', path: '', protocol: 'HTTP', moduleId: '', description: '',
})

const moduleOptions = computed(() => {
  const opts: { id: string; name: string }[] = []
  const walk = (nodes: ModuleNode[]) => {
    for (const n of nodes) {
      opts.push({ id: n.id, name: n.name })
      if (n.children?.length) walk(n.children)
    }
  }
  walk(modules.value)
  return opts
})

const tree = computed(() => {
  const nameMap = new Map<string, string>()
  const walk = (nodes: ModuleNode[]) => {
    for (const n of nodes) {
      nameMap.set(n.id, n.name)
      if (n.children?.length) walk(n.children)
    }
  }
  walk(modules.value)
  const groups = new Map<string, ApiDefinition[]>()
  for (const def of definitions.value) {
    const list = groups.get(def.moduleId) ?? []
    list.push(def)
    groups.set(def.moduleId, list)
  }
  return [...groups.entries()].map(([moduleId, defs]) => ({
    id: moduleId,
    name: nameMap.get(moduleId) ?? moduleId,
    children: defs.map((d) => ({ id: d.id, name: d.name, method: d.method, path: d.path })),
  }))
})

async function load() {
  loading.value = true
  try {
    definitions.value = await fetchApiDefinitions()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = ''
  Object.assign(form, { name: '', method: 'GET', path: '', protocol: 'HTTP', moduleId: moduleOptions.value[0]?.id ?? '', description: '' })
  editVisible.value = true
}

function openEdit(row: ApiDefinition) {
  editingId.value = row.id
  Object.assign(form, { name: row.name, method: row.method, path: row.path, protocol: row.protocol, moduleId: row.moduleId, description: row.description })
  editVisible.value = true
}

async function onSave() {
  if (!form.name.trim() || !form.path.trim()) { ElMessage.warning('请填写名称与路径'); return }
  saving.value = true
  if (editingId.value) await updateApiDefinition(editingId.value, { ...form })
  else await createApiDefinition({ ...form, projectId: 'p-1' })
  saving.value = false
  ElMessage.success('已保存')
  editVisible.value = false
  load()
}

async function onDelete(row: ApiDefinition) {
  await ElMessageBox.confirm('确认删除该接口？', '提示', { type: 'warning' })
  await deleteApiDefinition(row.id)
  ElMessage.success('已删除')
  load()
}

onMounted(async () => {
  const [defs, mods] = await Promise.all([fetchApiDefinitions(), fetchModuleTree('p-1')])
  definitions.value = defs
  modules.value = mods
})
</script>
<style scoped>
.definition { padding: 12px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.spacer { flex: 1; }
.tree-node { display: flex; align-items: center; gap: 8px; }
.method { font-weight: 600; font-size: 12px; min-width: 56px; }
.method.get { color: var(--el-color-success); }
.method.post { color: var(--el-color-warning); }
.method.put { color: var(--el-color-primary); }
.method.delete { color: var(--el-color-danger); }
.method.patch { color: var(--el-color-info); }
.tree-path { color: var(--el-text-color-secondary); font-size: 12px; }
</style>
