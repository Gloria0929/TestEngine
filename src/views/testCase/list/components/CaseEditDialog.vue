<template>
  <el-dialog :model-value="modelValue" :title="caseData ? '编辑' : '新建'" width="640px"
    @update:model-value="$emit('update:modelValue', $event)" @open="onOpen">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item prop="name" label="用例名称"><el-input v-model="form.name" /></el-form-item>
      <el-form-item prop="moduleId" label="所属模块"><el-input v-model="form.moduleId" placeholder="模块 ID" /></el-form-item>
      <el-form-item prop="level" label="等级">
        <el-select v-model="form.level"><el-option v-for="l in ['P0','P1','P2','P3']" :key="l" :label="l" :value="l" /></el-select>
      </el-form-item>
      <el-form-item prop="precondition" label="前置条件"><el-input v-model="form.precondition" type="textarea" /></el-form-item>
      <el-form-item label="步骤与预期">
        <div v-for="(s, i) in form.steps" :key="i" class="step-row">
          <el-input v-model="s.description" placeholder="步骤描述" />
          <el-input v-model="s.expected" placeholder="预期结果" />
          <el-icon @click="form.steps.splice(i, 1)"><Delete /></el-icon>
        </div>
        <el-button link type="primary" @click="form.steps.push({ id: 's-' + Date.now(), description: '', expected: '' })">添加步骤</el-button>
      </el-form-item>
      <el-form-item label="标签"><el-input v-model="tagsText" placeholder="逗号分隔" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">{{ '取消' }}</el-button>
      <el-button type="primary" :loading="saving" @click="onSave">{{ '保存' }}</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { createCase, updateCase } from '@/api/testCase'
import type { TestCase, CaseStep } from '@/types/models'

const props = defineProps<{ modelValue: boolean; caseData: TestCase | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'saved'): void }>()
const formRef = ref<FormInstance>()
const saving = ref(false)
const form = reactive<{ name: string; moduleId: string; level: TestCase['level']; precondition: string; steps: CaseStep[] }>({
  name: '', moduleId: '', level: 'P1', precondition: '', steps: [],
})
const tagsText = ref('')
const rules = { name: [{ required: true, message: '请输入用例名称', trigger: 'blur' }] }

function onOpen() {
  const d = props.caseData
  form.name = d?.name ?? ''; form.moduleId = d?.moduleId ?? 'm-1-1'; form.level = d?.level ?? 'P1'
  form.precondition = d?.precondition ?? ''; form.steps = d?.steps?.length ? [...d.steps] : []
  tagsText.value = (d?.tags ?? []).join(',')
}
async function onSave() {
  await formRef.value!.validate()
  saving.value = true
  const data = { ...form, tags: tagsText.value.split(',').map((s) => s.trim()).filter(Boolean) }
  if (props.caseData) await updateCase(props.caseData.id, data)
  else await createCase({ ...data, projectId: 'p-1', status: 'DRAFT', executor: 'test' })
  saving.value = false
  ElMessage.success('操作成功')
  emit('saved'); emit('update:modelValue', false)
}
</script>
