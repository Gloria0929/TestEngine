<!-- src/views/error/403.vue -->
<template>
  <div class="error-page">
    <h1>403</h1>
    <p>{{ t('error.forbidden') }}</p>
    <el-button type="primary" @click="router.push('/')">{{ t('common.backHome') }}</el-button>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
const router = useRouter()
const { t } = useI18n()
</script>
<style scoped>.error-page { text-align: center; padding-top: 120px; } h1 { font-size: 72px; color: var(--text-3); }</style>
