<template>
  <div>
    <div class="toolbar">
      <el-radio-group v-model="range">
        <el-radio-button value="3d">近 3 天</el-radio-button>
        <el-radio-button value="7d">近 7 天</el-radio-button>
      </el-radio-group>
    </div>
    <el-row :gutter="16" class="stats">
      <el-col v-for="s in statCards" :key="s.label" :span="6">
        <StatCard v-bind="s" />
      </el-col>
    </el-row>
    <el-card shadow="never" class="chart">
      <TrendChart :data="trend" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import StatCard from "@/components/StatCard.vue";
import TrendChart from "@/components/TrendChart.vue";
import { fetchOverview, fetchTrend } from "@/api/workstation";
import type { OverviewStats } from "@/api/workstation";
import type { TrendPoint } from "@/types/models";

const range = ref("7d");
const overview = ref<OverviewStats>({
  caseCount: 0,
  reviewCount: 0,
  apiCount: 0,
  scenarioCount: 0,
});
const trend = ref<TrendPoint[]>([]);

const statCards = computed(() => [
  {
    label: "功能用例",
    value: overview.value.caseCount,
    delta: "+3.2%",
    icon: "Tickets",
  },
  {
    label: "用例评审",
    value: overview.value.reviewCount,
    delta: "+1.1%",
    icon: "Document",
  },
  {
    label: "接口 API",
    value: overview.value.apiCount,
    delta: "+5.0%",
    icon: "Connection",
  },
  {
    label: "场景",
    value: overview.value.scenarioCount,
    delta: "+2.4%",
    icon: "Share",
  },
]);

async function load() {
  const params = { projectId: "p-1", range: range.value };
  overview.value = await fetchOverview(params);
  trend.value = await fetchTrend(params);
}
onMounted(load);
watch(range, load);
</script>
<style scoped>
.toolbar {
  margin-bottom: 16px;
}

.stats {
  margin-bottom: 16px;
}

.chart {
  margin-bottom: 16px;
}
</style>
