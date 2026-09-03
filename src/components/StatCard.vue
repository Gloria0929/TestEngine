<template>
  <el-card shadow="never" class="stat-card">
    <div class="stat-icon"><el-icon>
        <component :is="icon" />
      </el-icon></div>
    <div class="stat-body">
      <div class="value">{{ value }}</div>
      <div class="label">{{ label }}</div>
    </div>
    <div v-if="delta" class="delta">{{ delta }}</div>
  </el-card>
</template>
<script setup lang="ts">
defineProps<{ label: string; value: number | string; delta?: string; icon?: string }>()
</script>
<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  background: var(--el-color-primary-light-9);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.value {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-1);
  line-height: 1.2;
}

.label {
  font-size: 13px;
  color: var(--text-2);
}

.delta {
  font-size: 12px;
  color: var(--accent);
  font-weight: 600;
  margin-left: auto;
}
</style>
