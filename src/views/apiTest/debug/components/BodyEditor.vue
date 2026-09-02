<template>
  <div class="body-editor">
    <div class="body-toolbar">
      <el-radio-group :model-value="bodyType" @update:model-value="(v: BodyType) => emit('update:bodyType', v)">
        <el-radio-button v-for="b in bodyTypes" :key="b" :value="b">
          {{ b }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <div v-if="bodyType === 'none'" class="body-none">
      该请求不携带请求体（Body）
    </div>

    <el-input v-else-if="bodyType === 'raw'" :model-value="body" type="textarea" :rows="12"
      placeholder='{"key": "value"}' @update:model-value="(v: string) => emit('update:body', v)" />

    <div v-else class="at-kv-wrap">
      <div class="at-kv-head">
        <span>参数名</span><span class="k2">参数值</span><span class="k3">描述</span><span style="width:24px"></span>
      </div>
      <div class="at-kv-row" v-for="(kv, i) in bodyParams" :key="i">
        <input class="bg-in" v-model="kv.key" placeholder="键" />
        <input class="bg-in k2" v-model="kv.value" placeholder="值" />
        <input class="bg-in k3" v-model="kv.desc" placeholder="描述（选填）" />
        <button class="at-kv-del" @click="remove(i)" title="删除该行">&times;</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import type { BodyType } from "@/types/models";

interface KvRow {
  key: string;
  value: string;
  desc: string;
  enabled?: boolean;
}

const props = defineProps<{
  bodyType: BodyType;
  body: string;
  bodyParams: KvRow[];
}>();

const emit = defineEmits<{
  (e: "update:bodyType", v: BodyType): void;
  (e: "update:body", v: string): void;
  (e: "update:bodyParams", v: KvRow[]): void;
}>();

const bodyTypes: BodyType[] = [
  "none",
  "form-data",
  "x-www-form-urlencoded",
  "raw",
];

function add() {
  emit("update:bodyParams", [
    ...props.bodyParams,
    { key: "", value: "", desc: "", enabled: true },
  ]);
}

function remove(i: number) {
  const next = props.bodyParams.filter((_, idx) => idx !== i);
  if (!next.length) next.push({ key: "", value: "", desc: "", enabled: true });
  emit("update:bodyParams", next);
}

onMounted(() => {
  ensureOneRow();
});

// 切换到 form-data / x-www-form-urlencoded 时确保至少有一行
watch(
  () => props.bodyType,
  (t) => {
    if (t === "form-data" || t === "x-www-form-urlencoded") {
      ensureOneRow();
    }
  },
);

function ensureOneRow() {
  if (props.bodyParams.length === 0) add();
}

// 自动添加新行：最后一行有值时自动追加空行
watch(
  () => props.bodyParams,
  (val) => {
    const last = val[val.length - 1];
    if (last && (last.key.trim() || last.value.trim() || last.desc.trim())) {
      emit("update:bodyParams", [
        ...val,
        { key: "", value: "", desc: "", enabled: true },
      ]);
    }
  },
  { deep: true },
);
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

.at-kv-wrap {
  padding: 10px 12px 12px;
}

.at-kv-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-3);
  padding: 0 0 6px;
}

.at-kv-head span {
  flex: 1;
  padding: 0 10px;
  border: 1px solid transparent;
  box-sizing: border-box;
}

.at-kv-head span.k2 {
  flex: 0.9;
}

.at-kv-head span.k3 {
  flex: 1.2;
}

.at-kv-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.at-kv-row .bg-in {
  flex: 1;
  height: 32px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 4px;
  padding: 0 8px;
  font-size: 12.5px;
  font-family: inherit;
  color: var(--el-text-color-primary, #303133);
  background: var(--el-bg-color, #fff);
  outline: none;
  transition: border-color 0.18s ease;
}

.at-kv-row .bg-in:focus {
  border-color: var(--el-color-primary, #409eff);
}

.at-kv-row .k2 {
  flex: 0.9;
}

.at-kv-row .k3 {
  flex: 1.2;
}

.at-kv-del {
  background: none;
  border: none;
  padding: 0 4px;
  font-size: 16px;
  cursor: pointer;
  color: var(--el-text-color-placeholder, #a8abb2);
  line-height: 1;
}

.at-kv-del:hover {
  color: var(--el-color-danger, #f56c6c);
}
</style>