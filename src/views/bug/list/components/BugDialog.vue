<template>
  <el-dialog :model-value="modelValue" :title="bugData ? t('common.edit') : t('common.add')" width="560px"
    @update:model-value="$emit('update:modelValue', $event)" @open="onOpen">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item prop="title" label="标题"><el-input v-model="form.title" /></el-form-item>
      <el-form-item prop="severity" label="严重程度">
        <el-select v-model="form.severity" style="width: 100%">
          <el-option v-for="s in severities" :key="s" :label="severityMap[s].label" :value="s" />
        </el-select>
      </el-form-item>
      <el-form-item prop="assignee" label="处理人"><el-input v-model="form.assignee" /></el-form-item>
      <el-form-item prop="moduleId" label="模块"><el-input v-model="form.moduleId" placeholder="模块 ID" /></el-form-item>
      <el-form-item prop="description" label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="saving" @click="onSave">{{ t('common.save') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { createBug, updateBug } from '@/api/bug'
import type { Bug, BugSeverity } from '@/types/models'

const props = defineProps<{ modelValue: boolean; bugData: Bug | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'saved'): void }>()
const { t } = useI18n()
const formRef = ref<FormInstance>()
const saving = ref(false)

const severities: BugSeverity[] = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'TRIVIAL']
const severityMap: Record<BugSeverity, { label: string; color: string }> = {
  BLOCKER: { label: '阻塞', color: '#f56c6c' },
  CRITICAL: { label: '严重', color: '#e6a23c' },
  MAJOR: { label: '主要', color: '#f7ba2a' },
  MINOR: { label: '次要', color: '#409eff' },
  TRIVIAL: { label: '轻微', color: '#909399' },
}

const form = reactive<{ title: string; severity: BugSeverity; assignee: string; moduleId: string; description: string }>({
  title: '', severity: 'MINOR', assignee: '', moduleId: '', description: '',
})
const rules = { title: [{ required: true, message: '请输入标题', trigger: 'blur' }] }

function onOpen() {
  const d = props.bugData
  form.title = d?.title ?? ''
  form.severity = d?.severity ?? 'MINOR'
  form.assignee = d?.assignee ?? ''
  form.moduleId = d?.moduleId ?? ''
  form.description = d?.description ?? ''
}
async function onSave() {
  await formRef.value!.validate()
  saving.value = true
  if (props.bugData) {
    await updateBug(props.bugData.id, { ...form })
  } else {
    await createBug({ ...form, projectId: 'p-1', status: 'NEW', reporter: 'Administrator' })
  }
  saving.value = false
  ElMessage.success(t('common.success'))
  emit('saved')
  emit('update:modelValue', false)
}
</script>
