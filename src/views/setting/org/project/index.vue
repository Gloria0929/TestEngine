<template>
  <div class="project">
    <el-table :data="projects" v-loading="loading">
      <el-table-column prop="name" label="项目名称" min-width="200" />
      <el-table-column prop="description" label="描述" min-width="240" />
      <el-table-column prop="members" label="成员数" min-width="100" />
      <el-table-column prop="caseCount" label="用例数" min-width="100" />
      <el-table-column label="管理" min-width="100">
        <template #default>
          <el-button link type="primary" disabled>管理</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchProjects } from '@/api/project'
import type { Project } from '@/types/models'

const projects = ref<Project[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    projects.value = await fetchProjects({ orgId: '100001' })
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>
