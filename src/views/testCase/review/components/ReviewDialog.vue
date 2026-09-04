<template>
  <el-dialog :model-value="modelValue" title="新建评审" width="560px"
    @update:model-value="$emit('update:modelValue', $event)" @open="onOpen">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item prop="name" label="评审名称"><el-input v-model="form.name" /></el-form-item>
      <el-form-item prop="reviewers" label="评审人">
        <el-select v-model="form.reviewers" multiple allow-create filterable default-first-option style="width: 100%">
          <el-option v-for="u in presetReviewers" :key="u" :label="u" :value="u" />
        </el-select>
      </el-form-item>
      <el-form-item prop="startTime" label="开始时间">
        <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" value-format="YYYY-MM-DD HH:mm" style="width: 100%" />
      </el-form-item>
      <el-form-item prop="endTime" label="结束时间">
        <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" value-format="YYYY-MM-DD HH:mm" style="width: 100%" />
      </el-form-item>
      <el-form-item prop="caseIds" label="关联用例">
        <el-select v-model="form.caseIds" multiple filterable style="width: 100%">
          <el-option v-for="c in caseOptions" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { fetchCaseList, createReview } from '@/api/testCase'
import type { TestCase } from '@/types/models'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'saved'): void }>()
const presetReviewers = ['test', 'dev', 'Administrator']
const formRef = ref<FormInstance>()
const saving = ref(false)
const caseOptions = ref<TestCase[]>([])
const form = reactive<{ name: string; reviewers: string[]; startTime: string; endTime: string; caseIds: string[] }>({
  name: '', reviewers: [], startTime: '', endTime: '', caseIds: [],
})
const rules = { name: [{ required: true, message: '请输入评审名称', trigger: 'blur' }] }

async function loadCases() {
  const res = await fetchCaseList({ pageNum: 1, pageSize: 100 })
  caseOptions.value = res.list
}
function onOpen() {
  form.name = ''; form.reviewers = []; form.startTime = ''; form.endTime = ''; form.caseIds = []
}
async function onSave() {
  await formRef.value!.validate()
  saving.value = true
  await createReview({ ...form })
  saving.value = false
  ElMessage.success('评审已创建')
  emit('saved'); emit('update:modelValue', false)
}
onMounted(loadCases)
</script>
