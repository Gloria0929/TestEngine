<template>
  <div class="debug">
    <div class="req-list">
      <div class="req-list-head">
        <el-input v-model="searchReq" placeholder="搜索请求" size="small" />
      </div>
      <el-menu>
        <el-menu-item
          v-for="r in filteredReqs"
          :key="r.id"
          :index="r.id"
          @click="openTab(r)"
        >
          <span class="method" :class="r.method.toLowerCase()">{{
            r.method
          }}</span
          >{{ r.name }}
        </el-menu-item>
      </el-menu>
    </div>

    <div class="work">
      <div class="tab-bar">
        <div
          v-for="t in openedTabs"
          :key="t.id"
          class="req-tab"
          :class="{ active: t.id === activeId }"
          @click="activeId = t.id"
        >
          <span class="method" :class="t.method.toLowerCase()">{{
            t.method
          }}</span>
          <span class="req-tab-name">{{ t.name }}</span>
          <el-icon class="req-tab-close" @click.stop="closeTab(t.id)"
            ><Close
          /></el-icon>
        </div>
        <el-button link type="primary" class="tab-add" @click="newTab"
          >+</el-button
        >
      </div>

      <div class="urlbar">
        <el-select v-model="req.method" style="width: 120px">
          <el-option v-for="m in methods" :key="m" :label="m" :value="m" />
        </el-select>
        <el-input v-model="req.url" placeholder="输入 URL，支持 ${变量}" />
        <el-button @click="onImportCurl">导入 cURL</el-button>
        <el-button type="primary" :loading="executing" @click="onExecute"
          >发送</el-button
        >
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
          <BodyEditor
            v-model:body-type="req.bodyType"
            v-model:body="req.body"
            v-model:body-params="req.bodyParams"
          />
        </el-tab-pane>
        <el-tab-pane label="鉴权" name="auth">
          <div class="auth-panel">
            <el-select v-model="req.authType" style="width: 200px">
              <el-option
                v-for="a in authTypes"
                :key="a.value"
                :label="a.label"
                :value="a.value"
              />
            </el-select>
            <template v-if="req.authType === 'basic'">
              <el-input v-model="req.auth.username" placeholder="用户名" />
              <el-input
                v-model="req.auth.password"
                placeholder="密码"
                type="password"
                show-password
              />
            </template>
            <template v-else-if="req.authType === 'bearer'">
              <el-input
                v-model="req.auth.token"
                placeholder="Token，支持 ${变量}"
              />
            </template>
            <template v-else-if="req.authType === 'cookie'">
              <el-input
                v-model="req.auth.cookie"
                type="textarea"
                :rows="3"
                placeholder="name=value; other=value"
              />
            </template>
            <div v-else class="auth-none">无需鉴权</div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="变量" name="vars">
          <div class="vars-tip">
            发送前会将 URL / Header / Body / Query 中的 ${变量}
            替换为下方启用的值
          </div>
          <KeyValueEditor v-model="vars" />
        </el-tab-pane>
      </el-tabs>

      <div class="response">
        <div class="resp-summary">
          <el-tag v-if="resp" :type="statusType" effect="dark" size="small">{{
            resp.status === 0 ? "ERR" : resp.status
          }}</el-tag>
          <span v-if="resp" class="resp-meta">耗时 {{ resp.time }} ms</span>
          <span v-if="resp" class="resp-meta"
            >大小 {{ formatBytes(respSize) }}</span
          >
          <span v-if="!resp" class="resp-meta">尚未发送请求</span>
        </div>
        <el-tabs v-model="respTab">
          <el-tab-pane label="响应体" name="body">
            <pre class="code" v-html="highlightedBody"></pre>
          </el-tab-pane>
          <el-tab-pane label="响应头" name="headers">
            <el-table :data="respHeaders" size="small" :border="true">
              <el-table-column prop="key" label="Key" min-width="200" />
              <el-table-column prop="value" label="Value" min-width="260" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="控制台" name="console">
            <pre class="code">{{ (resp?.console ?? []).join("\n") }}</pre>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import KeyValueEditor from "./components/KeyValueEditor.vue";
import BodyEditor from "./components/BodyEditor.vue";
import {
  fetchDebugRequests,
  executeRequest,
  saveDebugRequest,
  importCurl,
} from "@/api/apiTest";
import { interpolate, interpolateKvs } from "@/utils/interpolate";
import type {
  DebugRequest,
  ExecuteResponse,
  HttpMethod,
  KeyValue,
} from "@/types/models";

const methods: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
  "HEAD",
  "CONNECT",
];
const authTypes = [
  { value: "none", label: "none（无）" },
  { value: "basic", label: "Basic Auth" },
  { value: "bearer", label: "Bearer Token" },
  { value: "cookie", label: "Cookie" },
] as const;

const reqs = ref<DebugRequest[]>([]);
const searchReq = ref("");
const openedTabs = ref<DebugRequest[]>([blankReq()]);
const activeId = ref(openedTabs.value[0].id);
const req = computed<DebugRequest>(
  () =>
    openedTabs.value.find((t) => t.id === activeId.value) ??
    openedTabs.value[0],
);
const vars = ref<KeyValue[]>([
  { key: "token", value: "demo-token-123", enabled: true },
]);
const activeTab = ref("headers");
const respTab = ref("body");
const resp = ref<ExecuteResponse | null>(null);
const executing = ref(false);

const filteredReqs = computed(() =>
  reqs.value.filter((r) => r.name.includes(searchReq.value)),
);

function blankReq(): DebugRequest {
  return {
    id: "tab-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    name: "新请求",
    method: "GET",
    url: "",
    protocol: "HTTP",
    headers: [],
    query: [],
    bodyType: "none",
    body: "",
    bodyParams: [],
    authType: "none",
    auth: {},
  };
}

function openTab(r: DebugRequest) {
  if (!openedTabs.value.some((t) => t.id === r.id)) {
    openedTabs.value.push(JSON.parse(JSON.stringify(r)) as DebugRequest);
  }
  activeId.value = r.id;
  resp.value = null;
}

function newTab() {
  const t = blankReq();
  openedTabs.value.push(t);
  activeId.value = t.id;
  resp.value = null;
}

function closeTab(id: string) {
  const idx = openedTabs.value.findIndex((t) => t.id === id);
  if (idx < 0) return;
  openedTabs.value.splice(idx, 1);
  if (openedTabs.value.length === 0) {
    const t = blankReq();
    openedTabs.value.push(t);
    activeId.value = t.id;
  } else if (activeId.value === id) {
    activeId.value =
      openedTabs.value[Math.min(idx, openedTabs.value.length - 1)].id;
  }
  resp.value = null;
}

function kvToRecord(list: KeyValue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const kv of list)
    if (kv.enabled && kv.key.trim()) out[kv.key.trim()] = kv.value;
  return out;
}

function buildPayload(): DebugRequest {
  const v = kvToRecord(vars.value);
  return {
    ...req.value,
    url: interpolate(req.value.url, v),
    headers: interpolateKvs(req.value.headers, v),
    query: interpolateKvs(req.value.query, v),
    body: interpolate(req.value.body, v),
    bodyParams: interpolateKvs(req.value.bodyParams, v),
    auth: Object.fromEntries(
      Object.entries(req.value.auth).map(([k, val]) => [
        k,
        interpolate(val, v),
      ]),
    ),
  };
}

async function onExecute() {
  executing.value = true;
  try {
    resp.value = await executeRequest(buildPayload());
  } catch (e) {
    ElMessage.error("发送失败");
  } finally {
    executing.value = false;
  }
}

async function onSave() {
  const saved = await saveDebugRequest({ ...req.value });
  Object.assign(req.value, saved);
  ElMessage.success("已保存");
  reqs.value = await fetchDebugRequests();
}

async function onImportCurl() {
  try {
    const { value } = await ElMessageBox.prompt("粘贴 cURL 命令", "导入 cURL", {
      inputType: "textarea",
      inputPlaceholder:
        "curl -X POST https://example.com/api -H 'Content-Type: application/json' -d '{\"a\":1}'",
    });
    const prevId = req.value.id;
    const parsed = await importCurl(value);
    Object.assign(req.value, parsed);
    req.value.id = prevId;
    ElMessage.success("导入成功");
  } catch {
    /* 用户取消 */
  }
}

const statusType = computed(() => {
  const s = resp.value?.status ?? 0;
  if (s >= 200 && s < 300) return "success";
  if (s >= 400 && s < 500) return "warning";
  if (s >= 500) return "danger";
  return "info";
});

const respSize = computed(() => new Blob([resp.value?.body ?? ""]).size);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlightJson(text: string): string {
  // 匹配 JSON 字符串（含 key）、数字、布尔/null
  const re =
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?)|\b(true|false|null)\b/g;
  return text.replace(re, (match, str, colon, _num, bool) => {
    const cls = colon
      ? "json-key"
      : str
        ? "json-string"
        : bool
          ? "json-bool"
          : "json-num";
    return `<span class="${cls}">${escapeHtml(match)}</span>`;
  });
}

const highlightedBody = computed(() => {
  const body = resp.value?.body ?? "";
  if (!body) return "";
  try {
    return highlightJson(JSON.stringify(JSON.parse(body), null, 2));
  } catch {
    return escapeHtml(body);
  }
});

const respHeaders = computed(() =>
  Object.entries(resp.value?.headers ?? {}).map(([key, value]) => ({
    key,
    value,
  })),
);

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + " MB";
  if (n >= 1024) return (n / 1024).toFixed(1) + " KB";
  return n + " B";
}

onMounted(async () => {
  reqs.value = await fetchDebugRequests();
  if (reqs.value.length) {
    // 用第一个请求替换初始空白便签
    openedTabs.value = [
      JSON.parse(JSON.stringify(reqs.value[0])) as DebugRequest,
    ];
    activeId.value = openedTabs.value[0].id;
  }
});
</script>

<style scoped>
.debug {
  display: flex;
  height: 100%;
}
.req-list {
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid var(--el-border-color);
  padding: 8px;
  display: flex;
  flex-direction: column;
}
.req-list-head {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.work {
  flex: 1;
  padding: 12px;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
.tab-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--el-border-color);
  overflow-x: auto;
}
.req-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-2);
  white-space: nowrap;
  border: 1px solid transparent;
}
.req-tab:hover {
  background: var(--el-fill-color-light);
}
.req-tab.active {
  color: var(--el-color-primary);
  background: var(--el-fill-color-light);
  border-color: var(--el-border-color);
  border-bottom-color: transparent;
}
.req-tab-name {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.req-tab-close {
  font-size: 12px;
  color: var(--text-3);
}
.req-tab-close:hover {
  color: var(--el-color-danger);
}
.tab-add {
  flex-shrink: 0;
  font-size: 18px;
  padding: 0 8px;
}
.urlbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.urlbar .el-input {
  flex: 1;
}
.method {
  font-weight: 600;
  margin-right: 8px;
}
.method.get {
  color: var(--el-color-success);
}
.method.post {
  color: var(--el-color-warning);
}
.method.put {
  color: var(--el-color-primary);
}
.method.delete {
  color: var(--el-color-danger);
}
.method.patch {
  color: var(--el-color-info);
}

.auth-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 480px;
}
.auth-none {
  padding: 24px;
  text-align: center;
  color: var(--text-3);
  font-size: 13px;
}
.vars-tip {
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 8px;
}

.response {
  margin-top: 12px;
}
.resp-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.resp-meta {
  font-size: 13px;
  color: var(--text-2);
}
.response pre,
.code {
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  font-family: var(--el-font-family-mono, monospace);
  font-size: 13px;
}
.code {
  min-height: 40px;
  max-height: 45vh;
  overflow: auto;
  background: var(--el-fill-color-light);
  padding: 12px;
  border-radius: 4px;
}
.code :deep(.json-key) {
  color: var(--el-color-primary);
}
.code :deep(.json-string) {
  color: var(--el-color-success);
}
.code :deep(.json-num) {
  color: var(--el-color-warning);
}
.code :deep(.json-bool) {
  color: var(--el-color-danger);
}
</style>
