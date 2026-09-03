<template>
  <el-dialog :model-value="modelValue" title="导入用例" width="480px"
    @update:model-value="$emit('update:modelValue', $event)">
    <el-upload drag :auto-upload="false" :limit="1" accept=".xlsx,.xls" :on-change="onFile">
      <el-icon class="el-icon--upload">
        <UploadFilled />
      </el-icon>
      <div>拖拽 Excel 到此，或点击选择</div>
    </el-upload>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :disabled="!file" @click="onImport">导入</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { parseCases } from '@/utils/excel'
import { createCase } from '@/api/testCase'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'imported'): void }>()
const file = ref<File | null>(null)
function onFile(f: { raw?: File }) { file.value = f.raw ?? null }
async function onImport() {
  if (!file.value) return
  const list = await parseCases(file.value)
  for (const c of list) await createCase({ ...c, projectId: 'p-1', status: 'DRAFT', executor: 'test' })
  ElMessage.success(`${'操作成功'}（${list.length} 条）`)
  emit('imported'); emit('update:modelValue', false)
}
</script>
