<!-- src/components/ModuleTree.vue -->
<template>
  <div class="module-tree">
    <div class="tree-head">
      <span>模块</span>
      <el-icon @click="$emit('add', null)"><Plus /></el-icon>
    </div>
    <el-tree :data="modules" node-key="id" :props="{ label: 'name', children: 'children' }"
      highlight-current default-expand-all :current-node-key="selected" @node-click="(d: ModuleNode) => $emit('select', d.id)">
      <template #default="{ node, data }">
        <span class="tree-node">{{ node.label }}</span>
      </template>
    </el-tree>
  </div>
</template>
<script setup lang="ts">
import type { ModuleNode } from '@/types/models'
defineProps<{ modules: ModuleNode[]; selected: string }>()
defineEmits<{ (e: 'select', id: string): void; (e: 'add', parentId: string | null): void }>()
</script>
<style scoped>
.module-tree { border: 1px solid var(--border); border-radius: 8px; padding: 8px; background: var(--surface); }
.tree-head { display: flex; justify-content: space-between; padding: 4px 8px; font-weight: 600; }
</style>
