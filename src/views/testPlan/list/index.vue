<template>
  <div class="plan-page">
    <!-- 左侧模块树 -->
    <div class="plan-tree">
      <div class="tree-title">测试计划</div>
      <el-menu :default-active="query.group || '全部'">
        <el-menu-item index="全部" @click="onGroup('全部')">
          <span>全部测试计划</span>
          <span class="tree-count">{{ totalCount }}</span>
        </el-menu-item>
        <el-menu-item
          v-for="g in groups"
          :key="g"
          :index="g"
          @click="onGroup(g)"
        >
          <span>{{ g }}</span>
          <span class="tree-count">{{ groupCount(g) }}</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 右侧主体 -->
    <div class="plan-main">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="query.keyword"
            placeholder="通过 ID / 名称 / 标签搜索"
            clearable
            style="width: 260px"
            @change="load"
            @keyup.enter="load"
          >
            <template #prefix
              ><el-icon><Search /></el-icon
            ></template>
          </el-input>
          <el-select
            v-model="query.status"
            placeholder="状态"
            clearable
            style="width: 130px"
            @change="load"
          >
            <el-option label="未开始" value="DRAFT" />
            <el-option label="进行中" value="RUNNING" />
            <el-option label="已完成" value="DONE" />
          </el-select>
        </div>
        <el-button type="primary" @click="openEdit()">
          <el-icon><Plus /></el-icon>
          <span>新建</span>
        </el-button>
      </div>

      <el-table :data="rows" v-loading="loading">
        <el-table-column prop="id" label="ID" width="110" />
        <el-table-column prop="name" label="测试计划名称" min-width="220">
          <template #default="{ row }">
            <span class="plan-name" @click="onExecute(row)">{{
              row.name
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag
              :type="statusTag(row.status).type"
              size="small"
              effect="light"
            >
              {{ statusTag(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="创建人" width="140" />
        <el-table-column label="进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)"
              >编辑</el-button
            >
            <el-button link type="primary" @click="onExecute(row)"
              >执行</el-button
            >
            <el-button link type="primary" @click="onReport(row)"
              >报告</el-button
            >
            <el-button link type="primary" @click="onCopy(row)">复制</el-button>
            <el-button link type="danger" @click="onDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div v-if="total > 0" class="pager">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          :page-size="page.pageSize"
          v-model:current-page="page.pageNum"
          @current-change="(p: number) => onPage(p, page.pageSize)"
        />
      </div>
    </div>

    <el-dialog
      v-model="editVisible"
      :title="editingId ? '编辑测试计划' : '新建测试计划'"
      width="520px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item prop="name" label="名称"
          ><el-input v-model="form.name"
        /></el-form-item>
        <el-form-item prop="group" label="计划组">
          <el-select
            v-model="form.group"
            style="width: 100%"
            allow-create
            filterable
          >
            <el-option v-for="g in groups" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item prop="owner" label="创建人"
          ><el-input v-model="form.owner"
        /></el-form-item>
        <el-form-item prop="startTime" label="开始时间"
          ><el-input v-model="form.startTime" placeholder="如 2026-08-25"
        /></el-form-item>
        <el-form-item prop="endTime" label="结束时间"
          ><el-input v-model="form.endTime" placeholder="如 2026-08-28"
        /></el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="未开始" value="DRAFT" />
            <el-option label="进行中" value="RUNNING" />
            <el-option label="已完成" value="DONE" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSave"
          >保存</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import {
  fetchPlans,
  createPlan,
  updatePlan,
  deletePlan,
  copyPlan,
} from "@/api/testPlan";
import type { TestPlan } from "@/types/models";

const router = useRouter();
const rows = ref<TestPlan[]>([]);
const allPlans = ref<TestPlan[]>([]);
const loading = ref(false);
const total = ref(0);
const page = reactive({ pageNum: 1, pageSize: 10 });
const query = reactive<{ keyword: string; status: string; group: string }>({
  keyword: "",
  status: "",
  group: "全部",
});

// 计划组（从全量数据聚合，用一次全量查询获得分组与计数）
const groups = computed(() =>
  Array.from(new Set(allPlans.value.map((p) => p.group).filter(Boolean))),
);
const totalCount = computed(() => allPlans.value.length);
function groupCount(g: string) {
  return allPlans.value.filter((p) => p.group === g).length;
}

function statusTag(s: TestPlan["status"]) {
  return {
    DRAFT: { label: "未开始", type: "info" },
    RUNNING: { label: "进行中", type: "primary" },
    DONE: { label: "已完成", type: "success" },
  }[s] as { label: string; type: "info" | "primary" | "success" };
}

function onGroup(g: string) {
  query.group = g;
  page.pageNum = 1;
  load();
}
function onPage(p: number, s: number) {
  page.pageNum = p;
  page.pageSize = s;
  load();
}
function onExecute(row: TestPlan) {
  router.push({
    path: "/test-plan/execute/" + row.id,
    query: { name: row.name },
  });
}
function onReport(row: TestPlan) {
  router.push(`/test-plan/report/${row.id}`);
}
async function onCopy(row: TestPlan) {
  await copyPlan(row.id);
  ElMessage.success("已复制");
  load();
}
async function onDelete(row: TestPlan) {
  await ElMessageBox.confirm("确认删除？删除后可在回收站恢复", "确认", {
    type: "warning",
  });
  await deletePlan(row.id);
  ElMessage.success("已删除");
  load();
}

async function loadAll() {
  const res = await fetchPlans({ pageNum: 1, pageSize: 999 } as never);
  allPlans.value = res.list;
}

async function load() {
  loading.value = true;
  try {
    const params = { ...query, pageNum: page.pageNum, pageSize: page.pageSize };
    const res = await fetchPlans(params as never);
    rows.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

const editVisible = ref(false);
const saving = ref(false);
const editingId = ref("");
const formRef = ref<FormInstance>();
const form = reactive<TestPlan>({
  id: "",
  projectId: "p-1",
  name: "",
  status: "DRAFT",
  owner: "",
  startTime: "",
  endTime: "",
  progress: 0,
  passRate: 0,
  group: "未规划计划",
});
const rules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  owner: [{ required: true, message: "请输入创建人", trigger: "blur" }],
};

function openEdit(row?: TestPlan) {
  editingId.value = row?.id ?? "";
  if (row) {
    Object.assign(form, row);
  } else {
    Object.assign(form, {
      id: "",
      projectId: "p-1",
      name: "",
      status: "DRAFT",
      owner: "",
      startTime: "",
      endTime: "",
      progress: 0,
      passRate: 0,
      group: query.group === "全部" ? "未规划计划" : query.group,
    });
  }
  editVisible.value = true;
}
async function onSave() {
  await formRef.value!.validate();
  saving.value = true;
  if (editingId.value) {
    await updatePlan(editingId.value, { ...form });
  } else {
    await createPlan({ ...form });
  }
  saving.value = false;
  ElMessage.success("操作成功");
  editVisible.value = false;
  await loadAll();
  load();
}
onMounted(async () => {
  await loadAll();
  load();
});
</script>

<style scoped>
.plan-page {
  display: flex;
  height: 100%;
}
.plan-tree {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  padding: 12px 8px;
}
.tree-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1);
  padding: 0 12px 12px;
}
.tree-count {
  margin-left: auto;
  color: var(--text-3);
  font-size: 12px;
}
.plan-tree :deep(.el-menu) {
  border-right: none;
}
.plan-tree :deep(.el-menu-item) {
  height: 40px;
}
.plan-main {
  flex: 1;
  padding: 16px;
  overflow: auto;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.plan-name {
  color: var(--el-color-primary);
  cursor: pointer;
}
.plan-name:hover {
  text-decoration: underline;
}
.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.plan-main :deep(.el-table__fixed-right),
.plan-main :deep(.el-table__fixed-right .el-table__cell) {
  background-color: var(--el-bg-color);
}
</style>
