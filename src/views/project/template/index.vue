<template>
  <div class="template">
    <div class="toolbar">
      <el-button type="primary" @click="openEdit()">新增模板</el-button>
    </div>
    <el-table :data="templates" v-loading="loading">
      <el-table-column prop="name" label="模板名称" min-width="180" />
      <el-table-column prop="kind" label="类型" width="100" />
      <el-table-column label="字段数" width="100">
        <template #default="{ row }">{{ row.fields.length }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">设计</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="drawerVisible" :title="editingId ? '设计模板' : '新增模板'" size="600px">
      <el-form label-width="90px">
        <el-form-item label="模板名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.kind" style="width: 100%">
            <el-option label="用例" value="用例" />
            <el-option label="缺陷" value="缺陷" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="section-title">字段列表</div>
      <div v-for="(f, i) in form.fields" :key="f.id" class="field-row">
        <el-input v-model="f.key" placeholder="Key" style="width: 130px" />
        <el-input v-model="f.label" placeholder="标签" style="width: 150px" />
        <el-select v-model="f.type" style="width: 110px">
          <el-option label="text" value="text" />
          <el-option label="select" value="select" />
          <el-option label="textarea" value="textarea" />
        </el-select>
        <el-checkbox v-model="f.required">必填</el-checkbox>
        <el-button link :disabled="i === 0" @click="move(i, -1)">上移</el-button>
        <el-button link :disabled="i === form.fields.length - 1" @click="move(i, 1)">下移</el-button>
        <el-button link type="danger" @click="removeField(i)">删除</el-button>
      </div>
      <el-button link type="primary" @click="addField">+ 添加字段</el-button>
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
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/api/project'
import type { ProjectTemplate, TemplateField } from '@/types/models'

const templates = ref<ProjectTemplate[]>([])
const loading = ref(false)
const drawerVisible = ref(false)
const editingId = ref('')
const fieldSeq = ref(0)
const form = reactive<{ name: string; kind: '用例' | '缺陷'; fields: TemplateField[] }>({
  name: '',
  kind: '用例',
  fields: [],
})

function newField(): TemplateField {
  return { id: 'f-' + Date.now() + '-' + fieldSeq.value++, key: '', label: '', required: false, type: 'text' }
}
function openEdit(row?: ProjectTemplate) {
  editingId.value = row?.id ?? ''
  fieldSeq.value = 0
  form.name = row?.name ?? ''
  form.kind = row?.kind ?? '用例'
  form.fields = (row?.fields ?? []).map((f) => ({ ...f }))
  drawerVisible.value = true
}
function addField() { form.fields.push(newField()) }
function removeField(i: number) { form.fields.splice(i, 1) }
function move(i: number, dir: number) {
  const j = i + dir
  const tmp = form.fields[i]
  form.fields[i] = form.fields[j]
  form.fields[j] = tmp
}
async function onSave() {
  const data = { name: form.name, kind: form.kind, fields: form.fields }
  if (editingId.value) await updateTemplate(editingId.value, data)
  else await createTemplate(data)
  ElMessage.success('已保存')
  drawerVisible.value = false
  load()
}
async function onDelete(row: ProjectTemplate) {
  await ElMessageBox.confirm(`确定删除模板 ${row.name}？`, '提示', { type: 'warning' })
  await deleteTemplate(row.id)
  ElMessage.success('已删除')
  load()
}
async function load() {
  loading.value = true
  templates.value = await fetchTemplates()
  loading.value = false
}
onMounted(load)
</script>
<style scoped>
.toolbar { margin-bottom: 12px; }
.section-title { font-weight: 600; margin: 16px 0 8px; }
.field-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
</style>
