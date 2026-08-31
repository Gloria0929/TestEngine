<template>
  <div class="file-page">
    <div class="page-header">
      <div class="header-meta">
        <h1 class="page-title">文件管理</h1>
        <p class="page-desc">管理项目文件、Jar 包、测试数据等资源</p>
      </div>
      <el-upload
        :auto-upload="false"
        :show-file-list="false"
        :on-change="onUpload"
      >
        <el-button type="primary" :icon="Upload">上传文件</el-button>
      </el-upload>
    </div>

    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="搜索文件"
          clearable
          style="width: 260px"
        >
          <template #prefix
            ><el-icon><Search /></el-icon
          ></template>
        </el-input>
        <el-select
          v-model="filterType"
          placeholder="文件类型"
          clearable
          style="width: 160px"
        >
          <el-option v-for="t in fileTypes" :key="t" :label="t" :value="t" />
        </el-select>
        <div class="spacer" />
        <el-radio-group v-model="viewMode">
          <el-radio-button value="list"
            ><el-icon><List /></el-icon
          ></el-radio-button>
          <el-radio-button value="grid"
            ><el-icon><Grid /></el-icon
          ></el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <div class="main-layout">
      <el-card shadow="never" class="aside-card">
        <div class="aside-title">存储库</div>
        <div class="repo-list">
          <div
            class="repo-item"
            :class="{ active: selectedRepo === 'all' }"
            @click="selectedRepo = 'all'"
          >
            <el-icon><FolderOpened /></el-icon>
            <span>全部文件</span>
            <span class="count">{{ files.length }}</span>
          </div>
          <div
            v-for="r in REPOS"
            :key="r"
            class="repo-item"
            :class="{ active: selectedRepo === r }"
            @click="selectedRepo = r"
          >
            <el-icon><Folder /></el-icon>
            <span>{{ r }}</span>
            <span class="count">{{ fileCountByRepo[r] ?? 0 }}</span>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="content-card" v-loading="loading">
        <el-table
          v-if="viewMode === 'list'"
          :data="pagedFiles"
          @selection-change="(s: any[]) => (selected = s)"
        >
          <el-table-column type="selection" width="48" />
          <el-table-column label="文件名" min-width="220">
            <template #default="{ row }">
              <div class="file-name">
                <div class="file-icon" :class="row.type?.toLowerCase()">
                  {{ row.type?.slice(0, 1) }}
                </div>
                <div>
                  <div class="name">{{ row.name }}</div>
                  <div class="repo">{{ row.repo }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="90" />
          <el-table-column label="大小" width="110">
            <template #default="{ row }">{{ formatSize(row.size) }}</template>
          </el-table-column>
          <el-table-column prop="time" label="更新时间" width="160" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                :icon="Download"
                @click="onDownload(row)"
                >下载</el-button
              >
              <el-button
                link
                type="danger"
                :icon="Delete"
                @click="onDelete(row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <div v-else class="grid-view">
          <div v-for="row in pagedFiles" :key="row.id" class="grid-item">
            <div class="file-icon large" :class="row.type?.toLowerCase()">
              {{ row.type?.slice(0, 1) }}
            </div>
            <div class="name" :title="row.name">{{ row.name }}</div>
            <div class="meta">{{ formatSize(row.size) }} · {{ row.time }}</div>
            <div class="actions">
              <el-icon @click="onDownload(row)"><Download /></el-icon>
              <el-icon @click="onDelete(row)"><Delete /></el-icon>
            </div>
          </div>
        </div>

        <el-empty
          v-if="!loading && filteredFiles.length === 0"
          :description="
            files.length === 0
              ? '暂无文件，请检查接口或点击上传'
              : '没有匹配的文件'
          "
        />

        <div class="pager" v-if="filteredFiles.length > 0">
          <el-pagination
            background
            layout="total, prev, pager, next"
            :total="filteredFiles.length"
            v-model:current-page="page.pageNum"
            :page-size="page.pageSize"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Upload,
  Search,
  List,
  Grid,
  Folder,
  FolderOpened,
  Download,
  Delete,
} from "@element-plus/icons-vue";
import type { UploadFile } from "element-plus";
import { fetchFiles, createFile, deleteFile } from "@/api/project";
import { now } from "@/utils/format";
import type { FileItem } from "@/types/models";

const REPOS = ["GitLab", "GitHub", "Gitee", "Gitea"];
const files = ref<FileItem[]>([]);
const loading = ref(false);
const keyword = ref("");
const filterType = ref("");
const selectedRepo = ref("all");
const viewMode = ref<"list" | "grid">("list");
const selected = ref<FileItem[]>([]);
const page = reactive({ pageNum: 1, pageSize: 10 });

const fileTypes = computed(() =>
  Array.from(new Set(files.value.map((f) => f.type))).sort(),
);
const fileCountByRepo = computed(() => {
  const map: Record<string, number> = {};
  for (const f of files.value) map[f.repo] = (map[f.repo] ?? 0) + 1;
  return map;
});

const filteredFiles = computed(() => {
  let list = files.value;
  if (selectedRepo.value !== "all")
    list = list.filter((f) => f.repo === selectedRepo.value);
  if (filterType.value) list = list.filter((f) => f.type === filterType.value);
  if (keyword.value) {
    const k = keyword.value.toLowerCase();
    list = list.filter((f) => f.name.toLowerCase().includes(k));
  }
  return list;
});

const pagedFiles = computed(() => {
  const start = (page.pageNum - 1) * page.pageSize;
  return filteredFiles.value.slice(start, start + page.pageSize);
});

function formatSize(size: number) {
  if (size >= 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + " MB";
  if (size >= 1024) return (size / 1024).toFixed(1) + " KB";
  return size + " B";
}

async function onUpload(file: UploadFile) {
  const ext = file.name.includes(".")
    ? file.name.split(".").pop()!.toUpperCase()
    : "FILE";
  const repo = selectedRepo.value === "all" ? "GitLab" : selectedRepo.value;
  await createFile({
    name: file.name,
    type: ext,
    size: file.size ?? 0,
    repo,
    time: now(),
  });
  ElMessage.success("上传成功");
  load();
}

function onDownload(row: FileItem) {
  ElMessage.success(`开始下载 ${row.name}`);
}

async function onDelete(row: FileItem) {
  await ElMessageBox.confirm(`确定删除文件 ${row.name}？`, "提示", {
    type: "warning",
  });
  await deleteFile(row.id);
  ElMessage.success("已删除");
  load();
}

async function load() {
  loading.value = true;
  try {
    files.value = (await fetchFiles()) ?? [];
    console.log('[file] loaded files:', files.value);
  } catch (e) {
    console.error('加载文件失败', e);
    ElMessage.error('加载文件失败，请检查网络或刷新重试');
    files.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.file-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 24px;
  box-shadow: var(--shadow-sm);
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-1);
  margin: 0;
}
.page-desc {
  font-size: 13px;
  color: var(--text-2);
  margin: 4px 0 0;
}
.toolbar-card {
  border-radius: var(--radius);
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}
.spacer {
  flex: 1;
}
.main-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.aside-card {
  width: 220px;
  flex-shrink: 0;
  border-radius: var(--radius);
}
.aside-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 12px;
}
.repo-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.repo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-2);
  transition: var(--transition);
  font-size: 14px;
}
.repo-item:hover {
  background: rgba(var(--accent-rgb), 0.08);
  color: var(--accent);
}
.repo-item.active {
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent);
  font-weight: 600;
}
.repo-item .count {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-3);
  background: var(--app-bg);
  padding: 2px 8px;
  border-radius: 10px;
}
.repo-item.active .count {
  color: var(--accent);
  background: rgba(var(--accent-rgb), 0.12);
}
.content-card {
  flex: 1;
  border-radius: var(--radius);
  min-height: 420px;
}
.file-name {
  display: flex;
  align-items: center;
  gap: 12px;
}
.file-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  background: var(--el-color-primary-light-9);
}
.file-icon.large {
  width: 44px;
  height: 44px;
  font-size: 16px;
}
.file-name .name {
  font-weight: 500;
  color: var(--text-1);
}
.file-name .repo {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
}
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}
.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface);
  transition: var(--transition);
  cursor: pointer;
}
.grid-item:hover {
  box-shadow: var(--shadow);
  border-color: var(--secondary);
}
.grid-item .name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-1);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.grid-item .meta {
  font-size: 11px;
  color: var(--text-3);
}
.grid-item .actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  color: var(--text-2);
}
.grid-item .actions .el-icon {
  cursor: pointer;
  transition: var(--transition);
}
.grid-item .actions .el-icon:hover {
  color: var(--accent);
}
.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
</style>
