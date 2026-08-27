<template>
  <div>
    <div v-for="(kv, i) in modelValue" :key="i" class="kv-row">
      <el-input v-model="kv.key" placeholder="Key" />
      <el-input v-model="kv.value" placeholder="Value" />
      <el-checkbox v-model="kv.enabled" />
      <el-icon @click="remove(i)"><Delete /></el-icon>
    </div>
    <el-button link type="primary" @click="add">{{ t('common.add') }}</el-button>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { KeyValue } from '@/types/models'
const props = defineProps<{ modelValue: KeyValue[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: KeyValue[]): void }>()
const { t } = useI18n()
function add() { emit('update:modelValue', [...props.modelValue, { key: '', value: '', enabled: true }]) }
function remove(i: number) { emit('update:modelValue', props.modelValue.filter((_, idx) => idx !== i)) }
</script>
