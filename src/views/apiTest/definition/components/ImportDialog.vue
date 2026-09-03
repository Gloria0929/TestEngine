<template>
  <el-dialog :model-value="modelValue" title="导入接口" width="520px"
    @update:model-value="$emit('update:modelValue', $event)">
    <el-input v-model="text" type="textarea" :rows="10" placeholder="粘贴 Swagger JSON / Postman / HAR 文本" />
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="importing" :disabled="!text.trim()" @click="onImport">导入</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { importDefinition } from '@/api/apiTest'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'imported'): void }>()
const text = ref('')
const importing = ref(false)

async function onImport() {
  if (!text.value.trim()) return
  importing.value = true
  const { count } = await importDefinition(text.value)
  importing.value = false
  ElMessage.success(`导入 ${count} 条`)
  text.value = ''
  emit('imported')
  emit('update:modelValue', false)
}
</script>
