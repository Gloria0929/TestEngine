<template>
  <div class="pm-page">
    <div class="pm">
      <div class="pm-head">
        <p class="pm-sub">管理项目报告保留策略，追溯项目内各类资源的历史操作</p>
      </div>
      <div class="pm-tabs">
        <button class="pm-tab on" @click="$router.push('/project/info')">应用设置</button>
        <button class="pm-tab" @click="$router.push('/project/log')">日志</button>
      </div>

      <!-- 应用设置面板 -->
      <div>
        <p class="aset-sec-t">报告保留策略</p>
        <p class="aset-sec-d">分别配置各类执行报告的自动清理周期，超过保留天数的报告将被自动清理。</p>
        <div class="aset-tip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          <span>报告清理由系统每日定时任务执行，清理后的数据不可恢复，请谨慎设置保留天数。</span>
        </div>
        <div class="aset-card">
          <div v-for="it in ITEMS" :key="it.key" class="aset-row" :class="{ 'is-changed': draft[it.key] !== saved[it.key] }">
            <div class="aset-l">
              <div class="aset-ico" :style="{ background: it.bg, color: it.color }" v-html="it.icon" />
              <div>
                <p class="aset-n">{{ it.title }}</p>
                <p class="aset-d">{{ it.desc }}</p>
              </div>
            </div>
            <div class="aset-r">
              <input
                class="aset-in"
                type="number"
                min="1"
                max="365"
                step="1"
                v-model.number="draft[it.key]"
                @blur="onBlur(it.key)"
                @keydown.enter="saveItem(it.key)"
              />
              <span class="aset-unit">天</span>
              <button class="aset-btn" :class="{ 'is-active': draft[it.key] !== saved[it.key] }" :disabled="draft[it.key] === saved[it.key]" @click="saveItem(it.key)">保存</button>
            </div>
          </div>
        </div>
        <p class="aset-foot">可设置范围：1 - 365 天，默认 30 天。修改后需点击对应项的「保存」生效。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { ElMessage } from "element-plus";

const DEFAULT_DAYS = 30;
const clamp = (v: any) => { const n = parseInt(v, 10); return isNaN(n) ? DEFAULT_DAYS : Math.min(365, Math.max(1, n)); };

const ITEMS = [
  {
    key: "plan",
    title: "测试计划",
    desc: "测试计划执行报告的保留天数",
    color: "#3b82f6",
    bg: "#eff6ff",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M9 15l2 2 4-4"/></svg>',
  },
  {
    key: "api",
    title: "接口测试",
    desc: "接口测试执行报告的保留天数",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 15l6-6"/><path d="M11 6l1.5-1.5a4.24 4.24 0 1 1 6 6L17 12"/><path d="M13 18l-1.5 1.5a4.24 4.24 0 0 1-6-6L7 12"/></svg>',
  },
  {
    key: "task",
    title: "系统任务",
    desc: "定时任务执行报告的保留天数",
    color: "#f59e0b",
    bg: "#fff7ed",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  },
] as const;

const saved = reactive<Record<string, number>>({ plan: DEFAULT_DAYS, api: DEFAULT_DAYS, task: DEFAULT_DAYS });
const draft = reactive<Record<string, number>>({ plan: DEFAULT_DAYS, api: DEFAULT_DAYS, task: DEFAULT_DAYS });

function onBlur(key: string) {
  const v = clamp(draft[key]);
  draft[key] = v;
}

function saveItem(key: string) {
  const v = clamp(draft[key]);
  draft[key] = v;
  saved[key] = v;
  ElMessage.success("已保存");
}
</script>

<style scoped>
.pm-page {
  height: 100%;
}
.pm {
  max-width: 1120px;
}
.pm-head {
  margin-bottom: 20px;
}
.pm-sub {
  font-size: 13px;
  color: var(--el-text-color-secondary, #909399);
  margin: 0;
  line-height: 1.6;
}
.pm-tabs {
  display: flex;
  gap: 2px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  margin-bottom: 20px;
}
.pm-tab {
  position: relative;
  padding: 10px 18px;
  font-size: 14px;
  color: var(--el-text-color-secondary, #909399);
  cursor: pointer;
  background: none;
  border: none;
  font-family: inherit;
  transition: color 0.18s ease;
}
.pm-tab:hover {
  color: var(--el-color-primary, #409eff);
}
.pm-tab.on {
  color: var(--el-color-primary, #409eff);
  font-weight: 600;
}
.pm-tab.on::after {
  content: "";
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: var(--el-color-primary, #409eff);
}
.aset-sec-t {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
  margin: 0 0 4px;
  line-height: 1.5;
}
.aset-sec-d {
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
  margin: 0;
  line-height: 1.6;
}
.aset-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  margin-top: 12px;
  border-radius: 8px;
  background: var(--el-color-info-light-9, #f4f4f5);
  border: 1px solid var(--el-color-info-light-8, #e9e9eb);
  font-size: 12.5px;
  color: var(--el-text-color-regular, #606266);
  line-height: 1.6;
}
.aset-tip svg {
  flex: 0 0 15px;
  margin-top: 2px;
  color: var(--el-color-info, #909399);
}
.aset-card {
  margin-top: 14px;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  overflow: hidden;
}
.aset-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  transition: background-color 0.18s ease;
}
.aset-row:last-child {
  border-bottom: none;
}
.aset-row:hover {
  background: var(--el-fill-color-lighter, #fafafa);
}
.aset-row.is-changed {
  background: var(--el-color-primary-light-9, #ecf5ff);
}
.aset-l {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.aset-ico {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 38px;
  transition: transform 0.18s ease;
}
.aset-row:hover .aset-ico {
  transform: scale(1.04);
}
.aset-n {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
  margin: 0 0 3px;
  line-height: 1.4;
}
.aset-d {
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
  margin: 0;
  line-height: 1.5;
}
.aset-r {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}
.aset-in {
  width: 88px;
  height: 32px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-primary, #303133);
  font-size: 13.5px;
  font-family: inherit;
  text-align: center;
  padding: 0 8px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.aset-in::-webkit-outer-spin-button,
.aset-in::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.aset-in[type="number"] {
  -moz-appearance: textfield;
}
.aset-in:hover {
  border-color: var(--el-border-color-hover, #c0c4cc);
}
.aset-in:focus {
  outline: none;
  border-color: var(--el-color-primary, #409eff);
  box-shadow: 0 0 0 3px var(--el-color-primary-light-9, #ecf5ff);
}
.aset-unit {
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  min-width: 14px;
}
.aset-btn {
  height: 32px;
  padding: 0 15px;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--el-border-color, #dcdfe6);
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-regular, #606266);
  transition: all 0.18s ease;
}
.aset-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.aset-btn.is-active {
  background: var(--el-color-primary, #409eff);
  border-color: var(--el-color-primary, #409eff);
  color: #fff;
}
.aset-btn.is-active:hover {
  opacity: 0.88;
}
.aset-foot {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder, #a8abb2);
  line-height: 1.6;
}
@media (max-width: 720px) {
  .aset-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
  .aset-r {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>