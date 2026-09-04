<template>
  <aside ref="root" class="mf-block" :style="{ marginTop: marginTop + 'px' }">
    <div class="mf-head">
      <el-icon class="mf-ficon">
        <FolderOpened />
      </el-icon>
      <span class="mf-title">{{ config.title }}</span>
      <el-icon class="mf-op" title="新建文件夹" @click="onCreate">
        <FolderAdd />
      </el-icon>
    </div>
    <div class="mf-body">
      <!-- 目录列表 -->
      <div v-for="f in folders" :key="f.id" class="mf-folder">
        <div class="mf-item" :class="{ active: activeFolderId === f.id }" @click="toggle(f)">
          <el-icon class="mf-caret" :class="{ open: opened.has(f.id) }">
            <CaretRight />
          </el-icon>
          <el-icon class="mf-ficon">
            <Folder />
          </el-icon>
          <span class="mf-label" :title="f.name">{{ f.name }}</span>
          <span class="mf-count">{{ countOf(f.id) }}</span>
          <span class="mf-ops">
            <el-icon title="重命名" @click.stop="onRename(f)">
              <EditPen />
            </el-icon>
            <el-icon title="删除文件夹" @click.stop="onDelete(f)">
              <Delete />
            </el-icon>
          </span>
        </div>
        <template v-if="opened.has(f.id)">
          <div v-for="it in itemsOf(f.id)" :key="it.id" class="mf-item mf-sub" :class="{ clickable: it.openPath }"
            @click="openItem(it)">
            <span class="mf-label" :title="it.name">{{ it.name }}</span>
          </div>
          <div v-if="!itemsOf(f.id).length" class="mf-hint">暂无记录</div>
        </template>
      </div>

      <!-- 未分类 -->
      <div class="mf-item" :class="{ active: activeFolderId === 'none' }" @click="goFolder('none')">
        <el-icon class="mf-ficon">
          <Files />
        </el-icon>
        <span class="mf-label">未分类</span>
        <span class="mf-count">{{ countOf("none") }}</span>
      </div>
      <div v-if="!folders.length" class="mf-hint">点击右上角图标新建文件夹</div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { CaretRight, Delete, EditPen, Files, Folder, FolderAdd, FolderOpened } from "@element-plus/icons-vue";
import { fetchFolders, createFolder, renameFolder, removeFolder } from "@/api/collections";
import { useCollectionsStore } from "@/stores/collections";
import type { ModuleFolderConfig, FolderItem } from "@/config/moduleFolders";
import type { ModuleFolder } from "@/types/models";

const props = defineProps<{ config: ModuleFolderConfig }>();

const route = useRoute();
const router = useRouter();
const collectionsStore = useCollectionsStore();

const folders = ref<ModuleFolder[]>([]);
const items = ref<FolderItem[]>([]);
const opened = ref(new Set<string>());

// 与右侧内容区过滤条/卡片（tc-bar/tp-bar/bg-bar/log-bar/review-card）顶部水平对齐
const root = ref<HTMLElement>();
const marginTop = ref(0);
const BAR_SELECTOR = ".tc-bar, .tp-bar, .bg-bar, .log-bar, .review-card";

function realign() {
  const bar = document.querySelector(BAR_SELECTOR);
  const row = root.value?.parentElement;
  if (!bar || !row) {
    marginTop.value = 0;
    return;
  }
  marginTop.value = Math.max(0, bar.getBoundingClientRect().top - row.getBoundingClientRect().top);
}

const activeFolderId = computed(() => {
  const v = route.query.folderId;
  if (!v) return "";
  return String(v);
});

async function loadFolders() {
  try {
    folders.value = (await fetchFolders(props.config.module)) as any;
  } catch {
    folders.value = [];
  }
}

async function loadItems() {
  try {
    items.value = await props.config.loadItems();
  } catch {
    items.value = [];
  }
}

function reload() {
  loadFolders();
  loadItems();
}

onMounted(() => {
  reload();
  requestAnimationFrame(realign);
  window.addEventListener("resize", realign);
});
onUnmounted(() => window.removeEventListener("resize", realign));
watch(() => route.path, () => nextTick(realign));
watch(() => props.config.module, () => {
  reload();
  nextTick(realign);
});
watch(() => collectionsStore.refreshTick, reload);

function toggle(f: ModuleFolder) {
  goFolder(f.id);
  if (!opened.value.has(f.id)) opened.value = new Set([...opened.value, f.id]);
}

function goFolder(id: string) {
  router.push({ path: props.config.listPath, query: id ? { folderId: id } : {} });
}

function itemsOf(folderId: string) {
  return items.value.filter((i) => i.folderId === folderId);
}

function countOf(folderId: string) {
  if (folderId === "none") return items.value.filter((i) => !i.folderId).length;
  return items.value.filter((i) => i.folderId === folderId).length;
}

function openItem(it: FolderItem) {
  if (it.openPath) router.push(it.openPath);
}

async function onCreate() {
  try {
    const { value } = await ElMessageBox.prompt("请输入文件夹名称", "新建文件夹", {
      inputPattern: /\S+/,
      inputErrorMessage: "名称不能为空",
    });
    await createFolder(props.config.module, value.trim());
    ElMessage.success("已创建");
    loadFolders();
  } catch {
    /* 取消 */
  }
}

async function onRename(f: ModuleFolder) {
  try {
    const { value } = await ElMessageBox.prompt("请输入新的文件夹名称", "重命名", {
      inputValue: f.name,
      inputPattern: /\S+/,
      inputErrorMessage: "名称不能为空",
    });
    await renameFolder(props.config.module, f.id, value.trim());
    ElMessage.success("已重命名");
    loadFolders();
  } catch {
    /* 取消 */
  }
}

async function onDelete(f: ModuleFolder) {
  try {
    await ElMessageBox.confirm(`确认删除文件夹「${f.name}」？其中的记录将移回未分类`, "确认", { type: "warning" });
    await removeFolder(props.config.module, f.id);
    ElMessage.success("已删除");
    if (activeFolderId.value === f.id) goFolder("");
    reload();
  } catch {
    /* 取消 */
  }
}
</script>

<style scoped>
.mf-block {
  width: 200px;
  flex-shrink: 0;
  align-self: flex-start;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.mf-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 11px 12px;
  border-bottom: 1px solid var(--border);
}

.mf-title {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  font-size: 13.5px;
  color: var(--text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mf-ficon {
  font-size: 15px;
  color: var(--accent);
  flex: none;
}

.mf-op {
  font-size: 14px;
  color: var(--text-3);
  cursor: pointer;
  flex: none;
  transition: color 0.15s var(--ease);
}

.mf-op:hover {
  color: var(--accent);
}

.mf-body {
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: calc(100vh - 220px);
  overflow-y: auto;
}

.mf-sep {
  height: 1px;
  margin: 5px 6px;
  background: var(--border);
}

.mf-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 8px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-2);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s var(--ease), color 0.15s var(--ease);
}

.mf-item:hover {
  background: var(--hover);
  color: var(--text-1);
}

.mf-item.active {
  background: rgba(var(--accent-rgb), 0.08);
  color: var(--accent);
  font-weight: 600;
}

.mf-sub {
  padding-left: 30px;
}

.mf-sub:not(.clickable) {
  cursor: default;
  color: var(--text-3);
}

.mf-caret {
  font-size: 12px;
  color: var(--text-3);
  flex: none;
  transition: transform 0.18s var(--ease);
}

.mf-caret.open {
  transform: rotate(90deg);
}

.mf-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mf-count {
  font-size: 11.5px;
  color: var(--text-3);
  flex: none;
}

.mf-ops {
  display: none;
  align-items: center;
  gap: 4px;
  flex: none;
}

.mf-ops .el-icon {
  font-size: 13px;
  color: var(--text-3);
}

.mf-ops .el-icon:hover {
  color: var(--accent);
}

.mf-item:hover .mf-ops {
  display: inline-flex;
}

.mf-item:hover .mf-count {
  display: none;
}

.mf-hint {
  padding: 6px 8px 6px 30px;
  font-size: 12px;
  color: var(--text-3);
}
</style>
