<template>
  <el-drawer :model-value="modelValue" :title="title" size="720px"
    @update:model-value="$emit('update:modelValue', $event)">
    <div v-if="editing" class="editor">
      <el-form label-width="70px" class="form">
        <el-form-item label="名称">
          <el-input v-model="editing.name" placeholder="场景名称" />
        </el-form-item>
        <el-form-item label="模块">
          <el-select v-model="editing.moduleId" style="width: 100%">
            <el-option v-for="m in moduleOptions" :key="m.id" :label="m.name" :value="m.id" />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="steps-head">
        <span class="section-title">步骤</span>
        <el-button size="small" type="primary" @click="addRoot">添加步骤</el-button>
      </div>

      <el-tree :data="editing.steps" node-key="id" draggable default-expand-all
        :expand-on-click-node="false" highlight-current
        @node-click="onNodeClick" @node-drop="onDrop">
        <template #default="{ data }">
          <div class="tree-node">
            <span class="node-name">{{ data.name || '未命名步骤' }}</span>
            <el-tag size="small" type="info">{{ data.type }}</el-tag>
            <el-switch v-model="data.enabled" size="small" @click.stop />
            <el-button link size="small" @click.stop="addChild(data)">加子</el-button>
            <el-button link size="small" @click.stop="insertBefore(data)">前插</el-button>
            <el-button link size="small" @click.stop="insertAfter(data)">后插</el-button>
            <el-button link size="small" @click.stop="copyStep(data)">复制</el-button>
            <el-button link size="small" type="danger" @click.stop="removeStep(data)">删除</el-button>
          </div>
        </template>
      </el-tree>

      <div class="config">
        <div class="section-title">步骤配置</div>
        <StepConfigPanel v-if="selected" :step="selected" :definitions="definitions" />
        <el-empty v-else description="点击步骤节点进行配置" :image-size="60" />
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import StepConfigPanel from './StepConfigPanel.vue'
import { saveScenario } from '@/api/apiTest'
import type { Scenario, ScenarioStep, ApiDefinition, ModuleNode } from '@/types/models'

const props = defineProps<{ modelValue: boolean; scenario: Scenario | null; definitions: ApiDefinition[]; modules: ModuleNode[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'saved'): void }>()

const editing = ref<Scenario | null>(null)
const selected = ref<ScenarioStep | null>(null)
const saving = ref(false)

const title = computed(() => (editing.value?.id ? '编辑场景' : '新建场景'))

const moduleOptions = computed(() => {
  const opts: { id: string; name: string }[] = []
  const walk = (nodes: ModuleNode[]) => {
    for (const n of nodes) {
      opts.push({ id: n.id, name: n.name })
      if (n.children?.length) walk(n.children)
    }
  }
  walk(props.modules)
  return opts
})

watch(() => props.modelValue, (v) => {
  if (v && props.scenario) {
    editing.value = JSON.parse(JSON.stringify(props.scenario))
    selected.value = null
  }
})

function stampId(): string {
  return 'st-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)
}

function newNode(name = ''): ScenarioStep {
  return { id: stampId(), name, type: 'REQUEST', enabled: true, config: { ref: '' } }
}

function onNodeClick(data: ScenarioStep) {
  selected.value = data
}

function findParent(nodes: ScenarioStep[], id: string): ScenarioStep[] | null {
  for (const n of nodes) {
    if (n.id === id) return nodes
    if (n.children) {
      const p = findParent(n.children, id)
      if (p) return p
    }
  }
  return null
}

function addRoot() {
  if (!editing.value) return
  editing.value.steps.push(newNode('新步骤'))
}

function addChild(data: ScenarioStep) {
  if (!data.children) data.children = []
  data.children.push(newNode('子步骤'))
}

function insertBefore(data: ScenarioStep) {
  if (!editing.value) return
  const arr = findParent(editing.value.steps, data.id) ?? editing.value.steps
  const idx = arr.findIndex((s) => s.id === data.id)
  arr.splice(idx, 0, newNode('新步骤'))
}

function insertAfter(data: ScenarioStep) {
  if (!editing.value) return
  const arr = findParent(editing.value.steps, data.id) ?? editing.value.steps
  const idx = arr.findIndex((s) => s.id === data.id)
  arr.splice(idx + 1, 0, newNode('新步骤'))
}

function copyStep(data: ScenarioStep) {
  if (!editing.value) return
  const arr = findParent(editing.value.steps, data.id) ?? editing.value.steps
  const idx = arr.findIndex((s) => s.id === data.id)
  const copy = JSON.parse(JSON.stringify(data)) as ScenarioStep
  copy.id = stampId()
  const walk = (nodes: ScenarioStep[]) => { for (const n of nodes) { n.id = stampId(); if (n.children?.length) walk(n.children) } }
  if (copy.children) walk(copy.children)
  arr.splice(idx + 1, 0, copy)
}

function removeStep(data: ScenarioStep) {
  if (!editing.value) return
  const arr = findParent(editing.value.steps, data.id) ?? editing.value.steps
  const idx = arr.findIndex((s) => s.id === data.id)
  arr.splice(idx, 1)
  if (selected.value?.id === data.id) selected.value = null
}

function onDrop(dragging: any, drop: any, dropType: string) {
  if (!editing.value) return
  const dragId = dragging.data.id as string
  const dropId = drop.data.id as string
  if (dragId === dropId) return
  const dragArr = findParent(editing.value.steps, dragId) ?? editing.value.steps
  const dragIdx = dragArr.findIndex((s) => s.id === dragId)
  if (dragIdx < 0) return
  const moved = dragArr.splice(dragIdx, 1)[0]

  const targetArr = findParent(editing.value.steps, dropId) ?? editing.value.steps
  const dropIdx = targetArr.findIndex((s) => s.id === dropId)
  if (dropType === 'before') targetArr.splice(dropIdx, 0, moved)
  else if (dropType === 'after') targetArr.splice(dropIdx + 1, 0, moved)
  else {
    const target = drop.data as ScenarioStep
    if (!target.children) target.children = []
    target.children.push(moved)
  }
}

async function onSave() {
  if (!editing.value) return
  if (!editing.value.name.trim()) { ElMessage.warning('请填写场景名称'); return }
  saving.value = true
  await saveScenario(editing.value)
  saving.value = false
  ElMessage.success('已保存')
  emit('update:modelValue', false)
  emit('saved')
}
</script>

<style scoped>
.editor { display: flex; flex-direction: column; gap: 12px; }
.form { margin-bottom: 4px; }
.steps-head { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-weight: 600; }
.tree-node { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; }
.node-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.config { margin-top: 4px; display: flex; flex-direction: column; gap: 8px; }
</style>
