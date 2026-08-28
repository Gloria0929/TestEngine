<template>
  <div class="project-info">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="basic">
        <el-form label-width="120px" class="form">
          <el-form-item label="项目名称">
            <el-input v-model="basic.name" />
          </el-form-item>
          <el-form-item label="项目描述">
            <el-input v-model="basic.description" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveBasic">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="计划报告策略" name="planReport">
        <el-form label-width="120px" class="form">
          <el-form-item label="自动生成报告">
            <el-switch v-model="planReport.autoGenerate" />
          </el-form-item>
          <el-form-item label="完成后通知">
            <el-switch v-model="planReport.notifyOnFinish" />
          </el-form-item>
          <el-form-item label="报告保留天数">
            <el-input-number v-model="planReport.keepDays" :min="1" :max="365" />
          </el-form-item>
          <el-form-item label="报告格式">
            <el-select v-model="planReport.format" style="width: 200px">
              <el-option label="HTML" value="HTML" />
              <el-option label="PDF" value="PDF" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveLocal">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="缺陷同步" name="bugSync">
        <el-form label-width="120px" class="form">
          <el-form-item label="启用同步">
            <el-switch v-model="bugSync.enabled" />
          </el-form-item>
          <el-form-item label="同步地址">
            <el-input v-model="bugSync.url" placeholder="缺陷系统地址" />
          </el-form-item>
          <el-form-item label="同步字段">
            <el-checkbox-group v-model="bugSync.fields">
              <el-checkbox value="title">标题</el-checkbox>
              <el-checkbox value="severity">严重程度</el-checkbox>
              <el-checkbox value="status">状态</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveLocal">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="用例应用开关" name="caseSwitch">
        <el-form label-width="120px" class="form">
          <el-form-item label="用例模板">
            <el-switch v-model="caseSwitch.template" />
          </el-form-item>
          <el-form-item label="用例导入">
            <el-switch v-model="caseSwitch.caseImport" />
          </el-form-item>
          <el-form-item label="用例导出">
            <el-switch v-model="caseSwitch.caseExport" />
          </el-form-item>
          <el-form-item label="脑图编辑">
            <el-switch v-model="caseSwitch.mindmap" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveLocal">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="接口应用设置" name="apiSetting">
        <el-form label-width="120px" class="form">
          <el-form-item label="默认 BaseURL">
            <el-input v-model="apiSetting.baseUrl" placeholder="http://" />
          </el-form-item>
          <el-form-item label="超时(ms)">
            <el-input-number v-model="apiSetting.timeout" :min="100" :step="100" />
          </el-form-item>
          <el-form-item label="启用 Mock">
            <el-switch v-model="apiSetting.enableMock" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveLocal">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchProject, updateProject } from '@/api/project'

const PROJECT_ID = 'p-1'
const activeTab = ref('basic')
const basic = reactive({ name: '', description: '' })

const planReport = reactive({ autoGenerate: true, notifyOnFinish: true, keepDays: 30, format: 'HTML' })
const bugSync = reactive({ enabled: true, url: '', fields: ['title', 'severity', 'status'] })
const caseSwitch = reactive({ template: true, caseImport: true, caseExport: true, mindmap: true })
const apiSetting = reactive({ baseUrl: '', timeout: 15000, enableMock: true })

async function saveBasic() {
  await updateProject(PROJECT_ID, { name: basic.name, description: basic.description })
  ElMessage.success('已保存')
}
function saveLocal() {
  ElMessage.success('已保存')
}

onMounted(async () => {
  const p = await fetchProject(PROJECT_ID)
  basic.name = p.name
  basic.description = p.description
})
</script>
<style scoped>
.form { max-width: 560px; }
</style>
