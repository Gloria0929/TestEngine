<template>
  <div class="debug">
    <div class="req-list">
      <el-input v-model="searchReq" placeholder="搜索请求" size="small" />
      <el-menu>
        <el-menu-item v-for="r in filteredReqs" :key="r.id" :index="r.id" @click="selectReq(r)">
          <span class="method" :class="r.method.toLowerCase()">{{ r.method }}</span>{{ r.name }}
        </el-menu-item>
      </el-menu>
    </div>
    <div class="work">
      <div class="urlbar">
        <el-select v-model="req.method" style="width: 120px">
          <el-option v-for="m in methods" :key="m" :label="m" :value="m" />
        </el-select>
        <el-input v-model="req.url" placeholder="输入 URL，支持 ${变量}" />
        <el-button @click="onImportCurl">导入 cURL</el-button>
        <el-button type="primary" :loading="executing" @click="onExecute">发送</el-button>
        <el-button @click="onSave">保存</el-button>
      </div>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="请求头" name="headers">
          <KeyValueEditor v-model="req.headers" />
        </el-tab-pane>
        <el-tab-pane label="Query" name="query">
          <KeyValueEditor v-model="req.query" />
        </el-tab-pane>
        <el-tab-pane label="Body" name="body">
          <el-select v-model="req.bodyType"><el-option v-for="b in bodyTypes" :key="b" :label="b" :value="b" /></el-select>
          <el-input v-if="req.bodyType === 'raw'" v-model="req.body" type="textarea" :rows="8" />
        </el-tab-pane>
      </el-tabs>
      <div class="response">
        <el-tabs v-model="respTab">
          <el-tab-pane label="响应体" name="body"><pre>{{ resp?.body }}</pre></el-tab-pane>
          <el-tab-pane label="响应头" name="headers"><pre>{{ JSON.stringify(resp?.headers, null, 2) }}</pre></el-tab-pane>
          <el-tab-pane label="控制台" name="console"><pre>{{ (resp?.console ?? []).join('\n') }}</pre></el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import KeyValueEditor from './components/KeyValueEditor.vue'
import { fetchDebugRequests, executeRequest, saveDebugRequest, importCurl } from '@/api/apiTest'
import type { DebugRequest, ExecuteResponse, HttpMethod } from '@/types/models'

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'CONNECT']
const bodyTypes = ['none', 'form-data', 'x-www-form-urlencoded', 'raw']
const reqs = ref<DebugRequest[]>([])
const searchReq = ref('')
const req = reactive<DebugRequest>({ id: '', name: '新请求', method: 'GET', url: '', protocol: 'HTTP', headers: [], query: [], bodyType: 'none', body: '', authType: 'none', auth: {} })
const activeTab = ref('headers')
const respTab = ref('body')
const resp = ref<ExecuteResponse | null>(null)
const executing = ref(false)

const filteredReqs = computed(() => reqs.value.filter((r) => r.name.includes(searchReq.value)))
function selectReq(r: DebugRequest) { Object.assign(req, r) }
async function onExecute() { executing.value = true; resp.value = await executeRequest(req); executing.value = false }
async function onSave() { await saveDebugRequest({ ...req }); ElMessage.success('已保存'); reqs.value = await fetchDebugRequests() }
async function onImportCurl() {
  try {
    const { value } = await ElMessageBox.prompt('粘贴 cURL 命令', '导入 cURL', { inputType: 'textarea', inputPlaceholder: 'curl -X POST https://example.com/api -H \'Content-Type: application/json\' -d \'{"a":1}\'' })
    const parsed = await importCurl(value)
    Object.assign(req, parsed)
    ElMessage.success('导入成功')
  } catch { /* 用户取消 */ }
}
onMounted(async () => { reqs.value = await fetchDebugRequests() })
</script>
<style scoped>
.debug { display: flex; height: 100%; }
.req-list { width: 260px; flex-shrink: 0; border-right: 1px solid var(--el-border-color); padding: 8px; }
.work { flex: 1; padding: 12px; overflow: auto; }
.urlbar { display: flex; gap: 8px; margin-bottom: 12px; }
.urlbar .el-input { flex: 1; }
.method { font-weight: 600; margin-right: 8px; }
.method.get { color: var(--el-color-success); }
.method.post { color: var(--el-color-warning); }
.method.put { color: var(--el-color-primary); }
.method.delete { color: var(--el-color-danger); }
.method.patch { color: var(--el-color-info); }
.response { margin-top: 12px; }
.response pre { white-space: pre-wrap; word-break: break-all; }
</style>
