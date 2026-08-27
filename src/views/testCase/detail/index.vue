<template>
  <div v-if="detail">
    <el-card shadow="never" class="mb">
      <h3>{{ detail.name }}</h3>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="等级">{{ detail.level }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detail.status }}</el-descriptions-item>
        <el-descriptions-item label="执行人">{{ detail.executor }}</el-descriptions-item>
        <el-descriptions-item label="前置条件" :span="3">{{ detail.precondition }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card shadow="never">
      <template #header>步骤与预期</template>
      <el-table :data="detail.steps">
        <el-table-column type="index" width="60" />
        <el-table-column prop="description" label="步骤描述" />
        <el-table-column prop="expected" label="预期结果" />
      </el-table>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchCase } from '@/api/testCase'
import type { TestCase } from '@/types/models'
const route = useRoute()
const detail = ref<TestCase | null>(null)
onMounted(async () => { detail.value = await fetchCase(route.params.id as string) })
</script>
<style scoped>.mb { margin-bottom: 16px; }</style>
