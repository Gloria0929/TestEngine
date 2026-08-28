<template>
  <el-tree :data="data" show-checkbox node-key="id" :default-checked-keys="modelValue"
    :props="{ label: 'name', children: 'children' }" @check="onCheck" />
</template>
<script setup lang="ts">
import type { PermissionNode } from '@/types/models'
defineProps<{ data: PermissionNode[]; modelValue: string[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void }>()
function onCheck(_node: unknown, checked: { checkedKeys: (string | number)[] }) {
  emit('update:modelValue', checked.checkedKeys.map(String))
}
</script>
