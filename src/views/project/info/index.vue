<template>
  <div class="app-setting-page">
    <div class="page-header">
      <div class="header-meta">
        <h1 class="page-title">应用设置</h1>
        <p class="page-desc">配置项目级功能开关、同步策略与清理规则</p>
      </div>
    </div>

    <el-card shadow="never" v-loading="loading">
      <div class="setting-grid">
        <div
          v-for="item in settingList"
          :key="item.key"
          class="setting-card"
        >
          <div class="card-top">
            <div class="row-icon">
              <el-icon :size="18"><component :is="item.icon" /></el-icon>
            </div>
            <el-switch
              v-if="item.hasSwitch"
              :model-value="switches[item.key]"
              @change="(v: string | number | boolean) => onToggle(item.key, Boolean(v))"
            />
          </div>
          <div class="row-title">{{ item.title }}</div>
          <div class="row-desc">{{ item.desc }}</div>
          <div class="row-extra" v-if="item.statusText">{{ item.statusText }}</div>
          <div class="card-footer" v-if="item.configurable">
            <el-button type="primary" link @click="openConfig(item)">配置</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 基本信息 -->
    <el-dialog v-model="dialogs.basic" title="基本信息" width="560px">
      <el-form label-width="90px">
        <el-form-item label="项目名称">
          <el-input v-model="basic.name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="basic.description" type="textarea" :rows="3" maxlength="255" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogs.basic = false">取消</el-button>
        <el-button type="primary" @click="saveBasic">保存</el-button>
      </template>
    </el-dialog>

    <!-- 缺陷同步 -->
    <el-dialog v-model="dialogs.bugSync" title="缺陷同步" width="560px">
      <el-form label-width="100px">
        <el-form-item label="启用同步">
          <el-switch v-model="switches.bugSync" />
        </el-form-item>
        <el-form-item label="同步平台">
          <el-select v-model="bugSync.platform" placeholder="选择平台" style="width: 100%">
            <el-option label="Jira" value="Jira" />
            <el-option label="禅道" value="禅道" />
            <el-option label="TAPD" value="TAPD" />
          </el-select>
        </el-form-item>
        <el-form-item label="同步地址">
          <el-input v-model="bugSync.url" placeholder="缺陷系统地址" />
        </el-form-item>
        <el-form-item label="同步机制">
          <el-radio-group v-model="bugSync.mechanism">
            <el-radio value="increment">增量同步</el-radio>
            <el-radio value="full">全量同步</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogs.bugSync = false">取消</el-button>
        <el-button type="primary" @click="saveBugSync">保存</el-button>
      </template>
    </el-dialog>

    <!-- 报告清理 -->
    <el-dialog v-model="dialogs.cleanReport" title="报告清理" width="520px">
      <el-form label-width="120px">
        <el-form-item label="保留天数">
          <el-input-number v-model="cleanReport.keepDays" :min="1" :max="365" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogs.cleanReport = false">取消</el-button>
        <el-button type="primary" @click="saveCleanReport">保存</el-button>
      </template>
    </el-dialog>

    <!-- 接口设置 -->
    <el-dialog v-model="dialogs.apiSetting" title="接口应用设置" width="560px">
      <el-form label-width="120px">
        <el-form-item label="默认 BaseURL">
          <el-input v-model="apiSetting.baseUrl" placeholder="http://" />
        </el-form-item>
        <el-form-item label="超时(ms)">
          <el-input-number v-model="apiSetting.timeout" :min="100" :step="100" />
        </el-form-item>
        <el-form-item label="URL 可重复">
          <el-switch v-model="switches.apiUrlRepeatable" />
        </el-form-item>
        <el-form-item label="启用 Mock">
          <el-switch v-model="apiSetting.enableMock" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogs.apiSetting = false">取消</el-button>
        <el-button type="primary" @click="saveApiSetting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  InfoFilled,
  Link,
  DocumentCopy,
  Timer,
  Connection,
  FolderOpened,
  RefreshRight,
  Brush,
} from '@element-plus/icons-vue'
import { fetchProject, updateProject } from '@/api/project'

const PROJECT_ID = 'p-1'
const loading = ref(false)

const basic = reactive({ name: '', description: '' })
const bugSync = reactive({ platform: 'Jira', url: '', mechanism: 'increment' as 'increment' | 'full' })
const cleanReport = reactive({ keepDays: 30 })
const apiSetting = reactive({ baseUrl: '', timeout: 15000, enableMock: true })

// 所有开关的唯一状态源，key 与 settingList 的 key 一一对应
const switches = reactive<Record<string, boolean>>({
  bugSync: true,
  caseRelated: true,
  planCleanReport: true,
  apiCleanReport: true,
  taskCleanReport: true,
  apiUrlRepeatable: false,
  casePublic: true,
  caseReReview: false,
})

const dialogs = reactive({
  basic: false,
  bugSync: false,
  cleanReport: false,
  apiSetting: false,
})

const currentCleanType = ref('')

const settingList = computed(() => [
  {
    key: 'basic',
    title: '基本信息',
    desc: '项目名称、描述等基础信息',
    icon: InfoFilled,
    hasSwitch: false,
    configurable: true,
  },
  {
    key: 'bugSync',
    title: '缺陷同步',
    desc: '与外部缺陷系统同步缺陷状态与字段',
    icon: Link,
    hasSwitch: true,
    configurable: true,
    statusText: switches.bugSync ? `已启用 · ${bugSync.platform} · ${bugSync.mechanism === 'increment' ? '增量同步' : '全量同步'}` : '未启用',
  },
  {
    key: 'caseRelated',
    title: '用例关联需求',
    desc: '用例与需求平台关联，支持需求变更同步',
    icon: DocumentCopy,
    hasSwitch: true,
    configurable: false,
  },
  {
    key: 'planCleanReport',
    title: '测试计划报告清理',
    desc: '自动清理过期的测试计划执行报告',
    icon: Brush,
    hasSwitch: true,
    configurable: true,
    statusText: switches.planCleanReport ? `已启用 · 保留 ${cleanReport.keepDays} 天` : '未启用',
  },
  {
    key: 'apiUrlRepeatable',
    title: '接口 URL 可重复',
    desc: '允许同一项目下存在相同 URL 的接口定义',
    icon: Connection,
    hasSwitch: true,
    configurable: false,
  },
  {
    key: 'apiCleanReport',
    title: '接口测试报告清理',
    desc: '自动清理过期的接口测试执行报告',
    icon: Brush,
    hasSwitch: true,
    configurable: true,
    statusText: switches.apiCleanReport ? `已启用 · 保留 ${cleanReport.keepDays} 天` : '未启用',
  },
  {
    key: 'taskCleanReport',
    title: '任务报告清理',
    desc: '自动清理过期的定时任务执行报告',
    icon: Timer,
    hasSwitch: true,
    configurable: true,
    statusText: switches.taskCleanReport ? `已启用 · 保留 ${cleanReport.keepDays} 天` : '未启用',
  },
  {
    key: 'casePublic',
    title: '用例公共用例库',
    desc: '启用后可将用例共享到组织级公共用例库',
    icon: FolderOpened,
    hasSwitch: true,
    configurable: false,
  },
  {
    key: 'caseReReview',
    title: '用例重新提审',
    desc: '用例变更后自动触发重新评审流程',
    icon: RefreshRight,
    hasSwitch: true,
    configurable: false,
  },
])

function openConfig(item: typeof settingList.value[0]) {
  if (item.key === 'basic') dialogs.basic = true
  else if (item.key === 'bugSync') dialogs.bugSync = true
  else if (item.key === 'planCleanReport' || item.key === 'apiCleanReport' || item.key === 'taskCleanReport') {
    currentCleanType.value = item.key
    dialogs.cleanReport = true
  }
  else if (item.key === 'apiUrlRepeatable') dialogs.apiSetting = true
}

function onToggle(key: string, v: boolean) {
  switches[key] = v
  ElMessage.success('已更新')
}

async function saveBasic() {
  await updateProject(PROJECT_ID, { name: basic.name, description: basic.description })
  ElMessage.success('已保存')
  dialogs.basic = false
}
function saveBugSync() {
  ElMessage.success('已保存')
  dialogs.bugSync = false
}
function saveCleanReport() {
  ElMessage.success('已保存')
  dialogs.cleanReport = false
}
function saveApiSetting() {
  ElMessage.success('已保存')
  dialogs.apiSetting = false
}

async function load() {
  loading.value = true
  try {
    const p = await fetchProject(PROJECT_ID)
    basic.name = p.name
    basic.description = p.description
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<style scoped>
.app-setting-page {
  padding: 20px;
}
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}
.header-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-1);
}
.page-desc {
  margin: 0;
  font-size: 13px;
  color: var(--text-3);
}
.setting-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.setting-card {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.setting-card:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.row-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(var(--accent-rgb), 0.08);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.row-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
}
.row-desc {
  font-size: 13px;
  color: var(--text-3);
  line-height: 1.5;
  flex: 1;
}
.row-extra {
  font-size: 12px;
  color: var(--accent);
}
.card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 2px;
}
</style>
