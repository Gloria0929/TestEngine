<template>
  <div class="config-panel">
    <div class="row type-row">
      <span class="label">步骤类型</span>
      <el-select v-model="step.type" style="flex: 1">
        <el-option v-for="t in stepTypes" :key="t" :label="t" :value="t" />
      </el-select>
    </div>

    <div v-if="step.type === 'REQUEST'" class="rows">
      <div class="row">
        <span class="label">引用接口</span>
        <el-select v-model="step.config.ref" placeholder="选择接口" clearable style="flex: 1">
          <el-option v-for="d in definitions" :key="d.id" :label="`${d.method} ${d.path}`" :value="d.id" />
        </el-select>
      </div>
      <div class="row">
        <span class="label">引用模式</span>
        <el-select v-model="step.config.refMode" style="flex: 1">
          <el-option label="完全引用" value="full" />
          <el-option label="步骤引用" value="step" />
        </el-select>
      </div>
    </div>

    <div v-else-if="step.type === 'LOOP'" class="rows">
      <div class="row">
        <span class="label">循环类型</span>
        <el-select v-model="step.config.loopType" style="flex: 1">
          <el-option label="次数循环" value="count" />
          <el-option label="遍历循环" value="forEach" />
        </el-select>
      </div>
      <div class="row">
        <span class="label">循环次数</span>
        <el-input-number v-model="step.config.count" :min="1" style="flex: 1" />
      </div>
    </div>

    <div v-else-if="step.type === 'CONDITION'" class="rows">
      <div class="row">
        <span class="label">条件表达式</span>
        <el-input v-model="step.config.expression" placeholder="如 ${resp.status} == 200" style="flex: 1" />
      </div>
    </div>

    <div v-else-if="step.type === 'SCRIPT'" class="rows">
      <div class="row">
        <span class="label">脚本类型</span>
        <el-select v-model="step.config.scriptType" style="flex: 1">
          <el-option label="JavaScript" value="js" />
          <el-option label="Groovy" value="groovy" />
        </el-select>
      </div>
      <div class="row">
        <span class="label">脚本内容</span>
        <el-input v-model="step.config.content" type="textarea" :rows="4" style="flex: 1" />
      </div>
    </div>

    <div v-else-if="step.type === 'WAIT'" class="rows">
      <div class="row">
        <span class="label">等待秒数</span>
        <el-input-number v-model="step.config.seconds" :min="0" style="flex: 1" />
      </div>
    </div>

    <div v-else class="empty-tip">该步骤类型无配置项</div>
  </div>
</template>

<script setup lang="ts">
import type { ScenarioStep, ApiDefinition } from '@/types/models'

defineProps<{ step: ScenarioStep; definitions: ApiDefinition[] }>()

const stepTypes: ScenarioStep['type'][] = ['REQUEST', 'LOOP', 'CONDITION', 'ONCE', 'SCRIPT', 'WAIT']
</script>

<style scoped>
.config-panel { display: flex; flex-direction: column; gap: 10px; }
.rows { display: flex; flex-direction: column; gap: 10px; }
.row { display: flex; align-items: center; gap: 10px; }
.type-row { padding-bottom: 10px; border-bottom: 1px solid var(--border); }
.label { width: 70px; flex-shrink: 0; color: var(--text-2); }
.empty-tip { color: var(--text-3); font-size: 13px; }
</style>
