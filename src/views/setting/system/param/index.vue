<template>
  <div class="param">
    <div class="toolbar">
      <el-button type="primary" @click="openEdit()">新建参数</el-button>
    </div>
    <el-table :data="params" v-loading="loading">
      <el-table-column prop="key" label="参数键" width="200" />
      <el-table-column prop="value" label="参数值" min-width="240" />
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑参数' : '新建参数'" width="480px">
      <el-form label-width="80px">
        <el-form-item label="参数键">
          <el-input v-model="form.key" placeholder="如 base.url" />
        </el-form-item>
        <el-form-item label="参数值">
          <el-input v-model="form.value" placeholder="参数值" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" placeholder="描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchSysParams, createSysParam, updateSysParam } from '@/api/setting'
import type { SysParam } from '@/types/models'

const params = ref<SysParam[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingId = ref('')
const form = reactive({ key: '', value: '', description: '' })

function openEdit(row?: SysParam) {
  editingId.value = row?.id ?? ''
  form.key = row?.key ?? ''
  form.value = row?.value ?? ''
  form.description = row?.description ?? ''
  dialogVisible.value = true
}
async function onSave() {
  const data = { key: form.key, value: form.value, description: form.description }
  if (editingId.value) await updateSysParam(editingId.value, data)
  else await createSysParam(data)
  ElMessage.success('已保存')
  dialogVisible.value = false
  load()
}
async function load() {
  loading.value = true
  try {
    params.value = await fetchSysParams()
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>
<style scoped>
.toolbar { margin-bottom: 12px; }
</style>
