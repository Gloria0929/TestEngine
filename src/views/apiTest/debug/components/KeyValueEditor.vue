<template>
  <div class="kv-editor">
    <div class="kv-head">
      <span class="col-check" />
    </div>
    <div v-for="(kv, i) in modelValue" :key="i" class="kv-row">
      <el-checkbox v-model="kv.enabled" class="col-check" />
      <el-input v-model="kv.key" placeholder="键" style="flex:1" />
      <el-input v-model="kv.value" placeholder="值" style="flex:1" />
      <el-icon class="col-action" @click="remove(i)">
        <Delete />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import type { KeyValue } from "@/types/models";
const props = withDefaults(
  defineProps<{ modelValue: KeyValue[]; showAdd?: boolean }>(),
  {
    showAdd: true,
  },
);
const emit = defineEmits<{ (e: "update:modelValue", v: KeyValue[]): void }>();
function add() {
  emit("update:modelValue", [
    ...props.modelValue,
    { key: "", value: "", enabled: true },
  ]);
}
function remove(i: number) {
  emit(
    "update:modelValue",
    props.modelValue.filter((_, idx) => idx !== i),
  );
}
onMounted(() => {
  if (props.modelValue.length === 0) add();
});

// 自动添加新行：最后一行有值时自动追加空行
watch(
  () => props.modelValue,
  (val) => {
    const last = val[val.length - 1];
    if (last && (last.key.trim() || last.value.trim())) {
      emit("update:modelValue", [
        ...val,
        { key: "", value: "", enabled: true },
      ]);
    }
  },
  { deep: true },
);
</script>

<style scoped>
.kv-editor {
  display: flex;
  flex-direction: column;
}

.kv-head,
.kv-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kv-head {
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 4px;
}

.kv-row {
  margin-bottom: 8px;
}

.col-check {
  width: 24px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.col-action {
  width: 24px;
  flex-shrink: 0;
  cursor: pointer;
  color: var(--text-3);
  transition: color 0.2s;
}

.col-action:hover {
  color: var(--el-color-danger);
}
</style>
