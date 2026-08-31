<template>
  <div class="message-page">
    <div class="page-header">
      <div class="header-meta">
        <h1 class="page-title">消息管理</h1>
        <p class="page-desc">配置项目通知机器人，并为不同事件选择接收渠道</p>
      </div>
    </div>

    <el-card shadow="never" class="robot-panel">
      <template #header>
        <div class="panel-title">机器人列表</div>
      </template>
      <div class="robot-grid">
        <div
          v-for="robot in robots"
          :key="robot.id"
          class="robot-card"
          :class="{
            active: selectedRobot?.id === robot.id,
            disabled: !robot.enabled,
          }"
          @click="selectRobot(robot)"
        >
          <div class="robot-main">
            <div class="robot-icon">
              <el-icon :size="22"
                ><component :is="robotIcon(robot.type)"
              /></el-icon>
            </div>
            <div class="robot-info">
              <div class="robot-name">{{ robot.type }}</div>
              <div class="robot-receiver" :title="robot.receivers.join(', ')">
                {{
                  robot.receivers.length
                    ? robot.receivers.join(", ")
                    : "未配置接收人"
                }}
              </div>
            </div>
          </div>
          <div class="robot-actions">
            <el-switch
              :model-value="robot.enabled"
              size="small"
              @click.stop
              @change="
                (v: string | number | boolean) => onToggle(robot, Boolean(v))
              "
            />
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
        </div>
        <div class="robot-card custom" @click="onAddRobot">
          <el-icon :size="18"><Plus /></el-icon>
          <span>自定义机器人</span>
        </div>
      </div>
      <el-empty v-if="!loading && robots.length === 0" description="暂无机器人，请检查接口或刷新" />
    </el-card>

    <el-card shadow="never" class="task-panel">
      <template #header>
        <div class="panel-title">通知事件</div>
      </template>
      <el-table :data="taskTable" v-loading="loading" :border="true">
        <el-table-column
          prop="eventName"
          label="事件"
          min-width="180"
          fixed="left"
        />
        <el-table-column prop="eventDesc" label="触发场景" min-width="240" />
        <el-table-column
          v-for="robot in enabledRobots"
          :key="robot.id"
          :label="robot.type"
          width="110"
          align="center"
        >
          <template #default="{ row }">
            <el-switch
              :model-value="row.robots[robot.id]"
              size="small"
              @change="
                (v: string | number | boolean) =>
                  toggleEvent(row, robot.id, Boolean(v))
              "
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="`配置：${current?.type}`"
      width="480px"
    >
      <el-form label-width="90px">
        <el-form-item label="接收人">
          <el-input
            v-model="receiverText"
            type="textarea"
            :rows="3"
            placeholder="多个接收人以逗号或换行分隔"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  ChatDotRound,
  Message,
  OfficeBuilding,
  Cellphone,
  Paperclip,
  Link,
  Plus,
  ArrowRight,
} from "@element-plus/icons-vue";
import { fetchMessageConfigs, updateMessageConfig } from "@/api/project";
import type { MessageConfig } from "@/types/models";

const robots = ref<MessageConfig[]>([]);
const loading = ref(false);
const selectedRobot = ref<MessageConfig | null>(null);
const dialogVisible = ref(false);
const current = ref<MessageConfig | null>(null);
const receiverText = ref("");

const events = [
  {
    key: "case-review",
    name: "用例评审",
    desc: "用例评审创建、完成、转交时触发",
  },
  { key: "test-plan", name: "测试计划", desc: "测试计划执行开始、完成时触发" },
  { key: "api-test", name: "接口测试", desc: "接口测试执行完成时触发" },
  { key: "bug-status", name: "缺陷状态", desc: "缺陷创建、分配、关闭时触发" },
  { key: "system-notice", name: "系统通知", desc: "系统级公告、告警时触发" },
];

const taskTable = ref(
  events.map((e) => ({
    eventKey: e.key,
    eventName: e.name,
    eventDesc: e.desc,
    robots: {} as Record<string, boolean>,
  })),
);

const enabledRobots = computed(() => robots.value.filter((r) => r.enabled));

function robotIcon(type: string) {
  if (type.includes("站内信")) return ChatDotRound;
  if (type.includes("邮件")) return Message;
  if (type.includes("企业微信")) return OfficeBuilding;
  if (type.includes("钉钉")) return Cellphone;
  if (type.includes("飞书")) return Paperclip;
  return Link;
}

function selectRobot(robot: MessageConfig) {
  selectedRobot.value = robot;
  current.value = robot;
  receiverText.value = robot.receivers.join(", ");
  dialogVisible.value = true;
}

async function onToggle(robot: MessageConfig, v: boolean) {
  await updateMessageConfig(robot.id, { enabled: v });
  ElMessage.success("已更新");
  load();
}

function toggleEvent(row: any, robotId: string, v: boolean) {
  row.robots[robotId] = v;
  ElMessage.success("已更新");
}

function onAddRobot() {
  ElMessage.info("自定义机器人功能开发中");
}

async function onSave() {
  if (!current.value) return;
  const receivers = receiverText.value
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
  await updateMessageConfig(current.value.id, { receivers });
  ElMessage.success("已保存");
  dialogVisible.value = false;
  load();
}

async function load() {
  loading.value = true;
  try {
    robots.value = (await fetchMessageConfigs()) ?? [];
    console.log('[message] loaded robots:', robots.value);
    if (!selectedRobot.value && robots.value.length)
      selectedRobot.value = robots.value[0];
    // 默认事件全部关闭，真实场景应由后端返回
    for (const row of taskTable.value) {
      for (const r of robots.value) {
        if (row.robots[r.id] === undefined) row.robots[r.id] = false;
      }
    }
  } catch (e) {
    console.error('[message] 加载机器人失败', e);
    ElMessage.error('加载机器人失败，请检查网络或刷新重试');
    robots.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.message-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 24px;
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-1);
  margin: 0;
}
.page-desc {
  font-size: 13px;
  color: var(--text-2);
  margin: 4px 0 0;
}
.panel-title {
  font-weight: 600;
  color: var(--text-1);
}
.robot-panel {
  border-radius: var(--radius);
}
.robot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}
.robot-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  cursor: pointer;
  transition: var(--transition);
}
.robot-card:hover {
  border-color: var(--secondary);
}
.robot-card.active {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.04);
}
.robot-card.disabled {
  opacity: 0.6;
}
.robot-main {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}
.robot-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  background: var(--el-color-primary-light-9);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.robot-info {
  overflow: hidden;
}
.robot-name {
  font-weight: 600;
  color: var(--text-1);
  font-size: 14px;
}
.robot-receiver {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.robot-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.arrow {
  color: var(--text-3);
  font-size: 14px;
}
.robot-card:hover .arrow {
  color: var(--accent);
}
.robot-card.custom {
  border-style: dashed;
  justify-content: center;
  gap: 8px;
  color: var(--text-2);
  font-size: 14px;
}
.robot-card.custom:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(var(--accent-rgb), 0.03);
}
.task-panel {
  border-radius: var(--radius);
}
</style>
