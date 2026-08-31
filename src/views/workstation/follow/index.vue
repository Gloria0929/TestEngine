<template>
  <el-row :gutter="16">
    <el-col v-for="f in list" :key="f.id" :span="8">
      <el-card shadow="never">
        <div class="f-type">{{ f.type }}</div>
        <div class="f-name">{{ f.name }}</div>
        <div class="f-meta">{{ f.owner }} · {{ f.updateTime }}</div>
        <el-button link type="danger" @click="unfollow(f.id)">{{ '取消关注' }}</el-button>
      </el-card>
    </el-col>
  </el-row>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchFollows } from '@/api/workstation'
import type { FollowItem } from '@/types/models'

const list = ref<FollowItem[]>([])
async function unfollow(id: string) {
  list.value = list.value.filter((x) => x.id !== id)
  ElMessage.success('操作成功')
}
onMounted(async () => { list.value = await fetchFollows() })
</script>
