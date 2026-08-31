<template>
  <div class="log-page">
    <div class="page-header">
      <div class="header-meta">
        <h1 class="page-title">操作日志</h1>
        <p class="page-desc">查看项目内关键资源的历史操作记录</p>
      </div>
    </div>

    <el-card shadow="never" class="filter-panel">
      <div class="filter-grid">
        <div class="filter-item">
          <el-date-picker
            v-model="filterTimeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%"
            @change="onFilter"
          />
        </div>
        <div class="filter-item">
          <el-select
            v-model="filterScope"
            placeholder="操作范围"
            clearable
            style="width: 100%"
            @change="onFilter"
          >
            <el-option v-for="s in scopes" :key="s" :label="s" :value="s" />
          </el-select>
        </div>
        <div class="filter-item">
          <el-select
            v-model="filterAction"
            placeholder="操作类型"
            clearable
            style="width: 100%"
            @change="onFilter"
          >
            <el-option v-for="a in actions" :key="a" :label="a" :value="a" />
          </el-select>
        </div>
        <div class="filter-item">
          <el-input
            v-model="filterUser"
            placeholder="操作人"
            clearable
            style="width: 100%"
            @change="onFilter"
          >
            <template #prefix
              ><el-icon><User /></el-icon
            ></template>
          </el-input>
        </div>
        <div class="filter-item wide">
          <el-input
            v-model="filterObject"
            placeholder="搜索对象 / 资源"
            clearable
            style="width: 100%"
            @change="onFilter"
          >
            <template #prefix
              ><el-icon><Search /></el-icon
            ></template>
          </el-input>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="content-card">
      <DataTable
        :columns="columns"
        :data="rows"
        :loading="loading"
        :total="total"
        :page="page"
        @page-change="onPage"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Search, User } from "@element-plus/icons-vue";
import DataTable, { type DataColumn } from "@/components/DataTable.vue";
import { fetchOperationLogs } from "@/api/project";
import type { PageQuery } from "@/types";
import type { OperationLog } from "@/types/models";

const scopes = ["用例", "场景", "接口", "缺陷", "项目", "环境"];
const actions = ["新增", "删除", "修改", "执行", "评审", "导出"];

const rows = ref<OperationLog[]>([]);
const loading = ref(false);
const total = ref(0);
const page = reactive({ pageNum: 1, pageSize: 10 });
const filterScope = ref("");
const filterAction = ref("");
const filterObject = ref("");
const filterUser = ref("");
const filterTimeRange = ref<[Date, Date] | null>(null);

const columns: DataColumn[] = [
  { prop: "time", label: "时间", width: 160 },
  { prop: "scope", label: "范围", width: 120 },
  { prop: "action", label: "操作", width: 120 },
  { prop: "object", label: "对象", minWidth: 120 },
  { prop: "user", label: "操作人", width: 140 },
];

function onPage(p: number, s: number) {
  page.pageNum = p;
  page.pageSize = s;
  load();
}
function onFilter() {
  page.pageNum = 1;
  load();
}

async function load() {
  loading.value = true;
  try {
    const params: PageQuery = {
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      scope: filterScope.value || undefined,
      action: filterAction.value || undefined,
      object: filterObject.value || undefined,
      user: filterUser.value || undefined,
    };
    const res = (await fetchOperationLogs(params)) ?? {
      list: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
    };
    rows.value = res.list ?? [];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.log-page {
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
.filter-panel {
  border-radius: var(--radius);
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.filter-item {
  min-width: 0;
}
.filter-item.wide {
  grid-column: span 2;
}
.content-card {
  border-radius: var(--radius);
}
@media (max-width: 1200px) {
  .filter-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .filter-item.wide {
    grid-column: span 2;
  }
}
@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
  .filter-item.wide {
    grid-column: span 1;
  }
}
</style>
