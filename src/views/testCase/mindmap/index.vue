<template>
  <div class="mindmap">
    <div class="tree-panel">
      <el-tree :data="treeData" node-key="id" default-expand-all :props="{ label: 'name', children: 'children' }"
        @node-click="onNodeClick">
        <template #default="{ data }">
          <span :class="['node', data.type]">{{ data.name }}</span>
        </template>
      </el-tree>
    </div>
    <div class="edit-panel" v-if="current">
      <template v-if="current.type === 'case'">
        <el-form label-width="80px">
          <el-form-item label="用例名"><el-input v-model="current.name" /></el-form-item>
          <el-form-item label="等级"><el-select v-model="current.level"><el-option v-for="l in ['P0','P1','P2','P3']" :key="l" :label="l" :value="l" /></el-select></el-form-item>
          <el-form-item label="前置条件"><el-input v-model="current.precondition" type="textarea" /></el-form-item>
        </el-form>
        <el-button type="primary" @click="saveCase">保存</el-button>
      </template>
      <template v-else-if="current.type === 'step'">
        <el-form label-width="80px">
          <el-form-item label="步骤"><el-input v-model="current.description" /></el-form-item>
          <el-form-item label="预期"><el-input v-model="current.expected" /></el-form-item>
        </el-form>
        <el-button type="primary" @click="saveCase">保存</el-button>
      </template>
      <el-empty v-else :description="'暂无数据'" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchModuleTree, fetchCaseList, updateCase } from '@/api/testCase'
import type { ModuleNode, TestCase, CaseLevel } from '@/types/models'

type TreeNode = { id: string; name: string; type: 'module' | 'case' | 'step'; children: TreeNode[]; level?: CaseLevel; precondition?: string; description?: string; expected?: string; caseId?: string }
const treeData = ref<TreeNode[]>([])
const current = ref<TreeNode | null>(null)

function build(modules: ModuleNode[], cases: TestCase[]): TreeNode[] {
  return modules.map((m) => ({
    id: m.id, name: m.name, type: 'module',
    children: [
      ...m.children.map((sub) => build([sub], cases)[0]),
      ...cases.filter((c) => c.moduleId === m.id).map((c): TreeNode => ({
        id: c.id, name: c.name, type: 'case', level: c.level, precondition: c.precondition, caseId: c.id,
        children: c.steps.map((s): TreeNode => ({ id: `${c.id}-${s.id}`, name: s.description, type: 'step', description: s.description, expected: s.expected, caseId: c.id, children: [] })),
      })),
    ],
  }))
}
function findCaseNode(nodes: TreeNode[], caseId: string): TreeNode | null {
  for (const n of nodes) {
    if (n.type === 'case' && n.id === caseId) return n
    if (n.children?.length) {
      const found = findCaseNode(n.children, caseId)
      if (found) return found
    }
  }
  return null
}
function onNodeClick(n: TreeNode) { current.value = n }
async function saveCase() {
  const node = current.value
  if (!node?.caseId) return
  if (node.type === 'case') {
    await updateCase(node.caseId, { name: node.name, level: node.level, precondition: node.precondition })
  } else if (node.type === 'step') {
    const caseNode = findCaseNode(treeData.value, node.caseId)
    if (caseNode) {
      const steps = caseNode.children.map((s) => ({ id: s.id, description: s.description ?? '', expected: s.expected ?? '' }))
      await updateCase(node.caseId, { steps })
    }
  }
  ElMessage.success('操作成功')
}
onMounted(async () => {
  const [modules, caseRes] = await Promise.all([fetchModuleTree('p-1'), fetchCaseList({ pageNum: 1, pageSize: 100 })])
  treeData.value = build(modules, caseRes.list)
})
</script>
<style scoped>
.mindmap { display: flex; gap: 16px; height: calc(100vh - 120px); }
.tree-panel { width: 320px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); padding: 8px; overflow: auto; }
.edit-panel { flex: 1; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); padding: 16px; }
.node.case { color: var(--accent); font-weight: 500; }
</style>
