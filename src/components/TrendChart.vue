<template>
  <div ref="chartRef" style="height: 320px"></div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import type { TrendPoint } from '@/types/models'

const props = defineProps<{ data: TrendPoint[] }>()
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function render() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['用例数', '接口数'] },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: props.data.map((d) => d.date) },
    yAxis: { type: 'value' },
    series: [
      { name: '用例数', type: 'line', smooth: true, data: props.data.map((d) => d.cases), itemStyle: { color: '#1E40AF' } },
      { name: '接口数', type: 'line', smooth: true, data: props.data.map((d) => d.apis), itemStyle: { color: '#64748b' } },
    ],
  })
}
watch(() => props.data, render)
onMounted(render)
onBeforeUnmount(() => chart?.dispose())
</script>
