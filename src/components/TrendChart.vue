<template>
  <div ref="chartRef" style="height: 320px"></div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { TrendPoint } from '@/types/models'
import { useAppStore } from '@/stores/app'

const props = defineProps<{ data: TrendPoint[] }>()
const appStore = useAppStore()
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function cssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

function render() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  const axisColor = cssVar('--text-3', '#94a3b8')
  const splitColor = cssVar('--border', '#e2e8f0')
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['用例数', '接口数'], textStyle: { color: cssVar('--text-2', '#475569') } },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: props.data.map((d) => d.date), axisLabel: { color: axisColor }, axisLine: { lineStyle: { color: splitColor } } },
    yAxis: { type: 'value', axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: splitColor } } },
    series: [
      { name: '用例数', type: 'line', smooth: true, data: props.data.map((d) => d.cases), itemStyle: { color: cssVar('--accent', '#2563eb') } },
      { name: '接口数', type: 'line', smooth: true, data: props.data.map((d) => d.apis), itemStyle: { color: cssVar('--info', '#64748b') } },
    ],
  })
}
watch(() => props.data, render)
watch(() => appStore.theme, () => nextTick(render))
onMounted(render)
onBeforeUnmount(() => chart?.dispose())
</script>
