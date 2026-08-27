<template>
  <el-dialog :model-value="modelValue" title="导入用例" width="480px" @update:model-value="$emit('update:modelValue', $event)">
    <el-upload drag :auto-upload="false" :limit="1" accept=".xlsx,.xls" :on-change="onFile">
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div>拖拽 Excel 到此，或点击选择</div>
    </el-upload>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :disabled="!file" @click="onImport">{{ t('common.import') }}</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { parseCases } from '@/utils/excel'
import { createCase } from '@/api/testCase'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'imported'): void }>()
const { t } = useI18n()
const file = ref<File | null>(null)
function onFile(f: { raw?: File }) { file.value = f.raw ?? null }
async function onImport() {
  if (!file.value) return
  const list = await parseCases(file.value)
  for (const c of list) await createCase({ ...c, projectId: 'p-1', status: 'DRAFT', executor: 'test' })
  ElMessage.success(`${t('common.success')}（${list.length} 条）`)
  emit('imported'); emit('update:modelValue', false)
}
</script>
