<!-- src/views/error/404.vue -->
<template>
  <div class="error-page">
    <h1>404</h1>
    <p>{{ "页面不存在" }}</p>
    <el-button type="primary" @click="router.push('/')">{{
      "返回首页"
    }}</el-button>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>
<style scoped>
.error-page {
  text-align: center;
  padding-top: 120px;
}
h1 {
  font-size: 72px;
  color: var(--text-3);
}
</style>
