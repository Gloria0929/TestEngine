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
        <el-input v-model="kv.key" placeholder="key" />
        <el-input v-model="kv.value" placeholder="value" />
        <el-input v-model="kv.desc" placeholder="描述（选填）" />
        <el-button text @click="remove(i)" title="删除该行">
          <el-icon>
            <Close />
          </el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { Close } from "@element-plus/icons-vue";
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

.at-kv-head,
.at-kv-row {
  display: grid;
  grid-template-columns: 1fr 0.9fr 1.2fr 24px;
  gap: 8px;
  align-items: center;
}

.at-kv-head {
  font-size: 12px;
  color: var(--text-3);
  padding: 0 0 6px;
}

.at-kv-head span {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  box-sizing: border-box;
}

.at-kv-row {
  margin-bottom: 8px;
}

.at-kv-row .bg-in {
  width: 100%;
}

.at-kv-del {
  min-height: auto !important;
  height: 24px !important;
  width: 24px !important;
  padding: 0 !important;
  margin: 0 !important;
  color: var(--el-text-color-placeholder, #a8abb2) !important;
}

.at-kv-del:hover {
  color: var(--el-color-danger, #f56c6c) !important;
}
</style>