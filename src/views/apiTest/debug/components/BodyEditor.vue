<template>
  <div class="body-editor">
    <div class="body-toolbar">
      <el-radio-group
        :model-value="bodyType"
        @update:model-value="(v: BodyType) => emit('update:bodyType', v)"
      >
        <el-radio-button v-for="b in bodyTypes" :key="b" :value="b">
          {{ b }}
        </el-radio-button>
      </el-radio-group>
      <el-button
        v-if="bodyType === 'form-data' || bodyType === 'x-www-form-urlencoded'"
        type="primary"
        text
        @click="addRow"
        >+ 新建</el-button
      >
    </div>

    <div v-if="bodyType === 'none'" class="body-none">
      该请求不携带请求体（Body）
    </div>

    <el-input
      v-else-if="bodyType === 'raw'"
      :model-value="body"
      type="textarea"
      :rows="12"
      placeholder='{"key": "value"}'
      @update:model-value="(v: string) => emit('update:body', v)"
    />

    <KeyValueEditor
      v-else
      :model-value="bodyParams"
      :show-add="false"
      @update:model-value="(v: KeyValue[]) => emit('update:bodyParams', v)"
    />
  </div>
</template>

<script setup lang="ts">
import KeyValueEditor from "./KeyValueEditor.vue";
import type { BodyType, KeyValue } from "@/types/models";

const props = defineProps<{
  bodyType: BodyType;
  body: string;
  bodyParams: KeyValue[];
}>();

const emit = defineEmits<{
  (e: "update:bodyType", v: BodyType): void;
  (e: "update:body", v: string): void;
  (e: "update:bodyParams", v: KeyValue[]): void;
}>();

const bodyTypes: BodyType[] = [
  "none",
  "form-data",
  "x-www-form-urlencoded",
  "raw",
];

function addRow() {
  emit("update:bodyParams", [
    ...props.bodyParams,
    { key: "", value: "", enabled: true },
  ]);
}
</script>

<style scoped>
.body-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px;
}
.body-none {
  padding: 24px;
  text-align: center;
  color: var(--text-3);
  font-size: 13px;
}
</style>
