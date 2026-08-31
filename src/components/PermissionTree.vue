<template>
  <el-tree
    class="permission-tree"
    :data="data"
    show-checkbox
    node-key="id"
    :default-checked-keys="modelValue"
    :props="{ label: 'name', children: 'children' }"
    :check-strictly="false"
    :disabled="disabled"
    @check="onCheck"
  />
</template>
<script setup lang="ts">
import type { PermissionNode } from '@/types/models'
defineProps<{ data: PermissionNode[]; modelValue: string[]; disabled?: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void }>()
function onCheck(_node: unknown, checked: { checkedKeys: (string | number)[] }) {
  emit('update:modelValue', checked.checkedKeys.map(String))
}
</script>
<style scoped>
.permission-tree {
  --el-tree-node-hover-bg-color: rgba(var(--accent-rgb), 0.04);
}
.permission-tree :deep(.el-tree-node__content) {
  height: 36px;
  border-radius: var(--radius-sm);
}
.permission-tree :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  border-color: var(--accent);
  background: var(--accent);
}
</style>
