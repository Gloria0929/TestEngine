<template>
  <el-dialog v-model="visible" title="移动到目录" width="360px" :close-on-click-modal="false">
    <el-radio-group v-model="target" class="move-list">
      <el-radio value="">未分类</el-radio>
      <el-radio v-for="f in folders" :key="f.id" :value="f.id">{{ f.name }}</el-radio>
    </el-radio-group>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { ModuleFolder } from "@/types/models";

const props = defineProps<{
  folders: ModuleFolder[];
  /** 打开时选中的目录（记录当前所在目录） */
  current?: string;
}>();

const visible = defineModel<boolean>({ default: false });
const emit = defineEmits<{ confirm: [folderId: string] }>();

const target = ref("");
watch(visible, (v) => {
  if (v) target.value = props.current ?? "";
});

function onConfirm() {
  visible.value = false;
  emit("confirm", target.value);
}
</script>

<style scoped>
.move-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}
</style>
