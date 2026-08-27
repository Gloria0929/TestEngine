<!-- src/views/testCase/list/components/CaseEditDialog.vue（占位，Task 3.3 完整实现） -->
<template>
  <el-dialog :model-value="modelValue" title="编辑用例" @update:model-value="$emit('update:modelValue', $event)">
    <p>表单见 Task 3.3</p>
  </el-dialog>
</template>
<script setup lang="ts">
defineProps<{ modelValue: boolean; caseData: unknown }>()
defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'saved'): void }>()
</script>
