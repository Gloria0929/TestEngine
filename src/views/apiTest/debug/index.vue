<template>
  <div class="at-dbg">
    <!-- 标签页栏 -->
    <div class="at-tabbar">
      <div class="at-tabs">
        <div v-for="(tab, i) in tabs" :key="i" class="at-tab" :class="{ active: i === activeTabIdx }"
          @click="switchTab(i)">
          <span class="at-tab-method">{{ tab.method }}</span>
          <input class="at-tab-name" v-model="tab.name" placeholder="未命名" @click.stop
            @keydown.enter="($event.target as HTMLInputElement).blur()" />
          <button class="at-tab-close" @click.stop="closeTab(i)" title="关闭">&times;</button>
        </div>
        <button class="at-tab-add" @click="addTab" title="新建标签">+</button>
      </div>
    </div>

    <!-- 请求行：方法 + URL + 发送/清空 -->
    <div class="at-reqline">
      <select class="bg-sel" style="width: 118px; height: 36px" v-model="activeTab.method">
        <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
      </select>
      <input class="bg-in" style="
          flex: 1;
          height: 36px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 13px;
        " v-model="activeTab.url" :placeholder="showBody
          ? '请输入请求 URL，POST/PUT 请求可带请求体'
          : '请输入请求 URL，如 /api/v1/users?page=1'
          " @keydown.enter="send" />
      <button class="bg-btn bg-btn-pri at-send" :disabled="sending" @click="send">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 2 11 13" />
          <path d="M22 2 15 22l-4-9-9-4Z" />
        </svg>
        {{ sending ? "发送中…" : "发送" }}
      </button>
      <button class="bg-btn" @click="clear">清空</button>
    </div>

    <!-- 左右两栏 -->
    <div class="at-dbg-cols">
      <!-- 请求配置 -->
      <div class="at-dbg-panel">
        <h4>请求配置</h4>
        <div class="at-seg">
          <button :class="{ on: seg === 'query' }" @click="seg = 'query'">
            Params
          </button>
          <button :class="{ on: seg === 'auth' }" @click="seg = 'auth'">
            Authorization
          </button>
          <button :class="{ on: seg === 'headers' }" @click="seg = 'headers'">
            Headers
          </button>
          <button :class="{ on: seg === 'body' }" @click="seg = 'body'">
            Body
          </button>
        </div>

        <!-- Query 参数 -->
        <div v-show="seg === 'query'">
          <div class="at-kv-wrap">
            <div class="at-kv-head">
              <span style="width: 24px"></span>
            </div>
            <div class="at-kv-row" v-for="(r, i) in activeTab.query" :key="i">
              <input class="bg-in" v-model="r.key" placeholder="键" />
              <input class="bg-in k2" v-model="r.value" placeholder="值" />
              <input class="bg-in k3" v-model="r.desc" placeholder="描述（选填）" />
              <button class="at-kv-del" @click="removeKv(activeTab.query, i)" title="删除该行">
                &times;
              </button>
            </div>
          </div>
        </div>

        <!-- Authorization -->
        <div v-show="seg === 'auth'" class="at-auth">
          <div class="at-auth-row">
            <label>Type</label>
            <select class="bg-sel" v-model="activeTab.authType" style="width:160px;height:32px;">
              <option value="none">No Auth</option>
              <option value="basic">Basic Auth</option>
              <option value="bearer">Bearer Token</option>
              <option value="cookie">Cookie</option>
            </select>
          </div>
          <template v-if="activeTab.authType === 'basic'">
            <div class="at-auth-row">
              <label>Username</label>
              <input class="bg-in" v-model="activeTab.authUser" placeholder="用户名" style="flex:1;height:32px;" />
            </div>
            <div class="at-auth-row">
              <label>Password</label>
              <input class="bg-in" v-model="activeTab.authPass" type="password" placeholder="密码"
                style="flex:1;height:32px;" />
            </div>
          </template>
          <div v-if="activeTab.authType === 'bearer'" class="at-auth-row">
            <label>Token</label>
            <input class="bg-in" v-model="activeTab.authToken" placeholder="Bearer token" style="flex:1;height:32px;" />
          </div>
          <div v-if="activeTab.authType === 'cookie'" class="at-auth-row">
            <label>Cookie</label>
            <input class="bg-in" v-model="activeTab.authCookie" placeholder="Cookie 字符串" style="flex:1;height:32px;" />
          </div>
        </div>

        <!-- 请求头 -->
        <div v-show="seg === 'headers'">
          <div class="at-kv-wrap">
            <div class="at-kv-head">
              <span style="width: 24px"></span>
            </div>
            <div class="at-kv-row" v-for="(r, i) in activeTab.headers" :key="i">
              <input class="bg-in" v-model="r.key" placeholder="键" />
              <input class="bg-in k2" v-model="r.value" placeholder="值" />
              <input class="bg-in k3" v-model="r.desc" placeholder="描述（选填）" />
              <button class="at-kv-del" @click="removeKv(activeTab.headers, i)" title="删除该行">
                &times;
              </button>
            </div>
          </div>
        </div>

        <!-- 请求体 -->
        <div v-show="seg === 'body'" class="at-body-wrap">
          <BodyEditor :body-type="activeTab.bodyType" :body="activeTab.body" :body-params="activeTab.bodyParams"
            @update:body-type="activeTab.bodyType = $event" @update:body="activeTab.body = $event"
            @update:body-params="activeTab.bodyParams = $event" />
        </div>
      </div>

      <!-- 响应结果 -->
      <div class="at-dbg-panel">
        <h4>响应结果</h4>
        <div class="at-resp">
          <div v-if="sending" class="at-spin">
            <span class="dot"></span>正在发送请求…
          </div>
          <div v-else-if="!last" class="at-resp-empty">
            发送请求后，响应将显示在这里
          </div>
          <template v-else>
            <div class="at-resp-head">
              <span class="at-resp-code" :class="statusCodeCls">{{
                statusText
              }}</span>
              <span class="at-resp-meta">耗时 {{ last.time }} ms</span>
              <span v-if="last.matched" class="at-resp-mock">命中 Mock：{{ last.mockName || "" }}</span>
              <span v-else class="at-resp-meta">默认响应</span>
            </div>
            <pre class="at-resp-pre" v-html="highlightedResponseBody"></pre>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { executeRequest, fetchDebugRequests } from "@/api/apiTest";
import { ElMessage } from "element-plus";
import type { HttpMethod, BodyType, DebugRequest } from "@/types/models";
import BodyEditor from "./components/BodyEditor.vue";

interface KvRow {
  key: string;
  value: string;
  desc: string;
  enabled?: boolean;
}

interface TabData {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  query: KvRow[];
  headers: KvRow[];
  body: string;
  bodyType: BodyType;
  bodyParams: KvRow[];
  authType: "none" | "basic" | "bearer" | "cookie";
  authUser: string;
  authPass: string;
  authToken: string;
  authCookie: string;
}

interface ExecuteResult {
  status: number;
  time: number;
  response: unknown;
  matched?: boolean;
  mockName?: string | null;
}

const methods: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
  "HEAD",
];

function createEmptyTab(): TabData {
  return {
    id: "",
    name: "",
    method: "GET",
    url: "",
    query: [{ key: "", value: "", desc: "" }],
    headers: [{ key: "", value: "", desc: "" }],
    body: "{}",
    bodyType: "raw",
    bodyParams: [],
    authType: "none",
    authUser: "",
    authPass: "",
    authToken: "",
    authCookie: "",
  };
}

const tabs = ref<TabData[]>([createEmptyTab()]);
const activeTabIdx = ref(0);
const seg = ref<"query" | "auth" | "headers" | "body">("query");
const last = ref<ExecuteResult | null>(null);
const sending = ref(false);

const activeTab = computed(() => tabs.value[activeTabIdx.value]);

const showBody = computed(() =>
  ["POST", "PUT", "PATCH"].includes(activeTab.value.method),
);

const statusCodeCls = computed(() => {
  const s = last.value?.status ?? 0;
  if (s >= 200 && s < 300) return "r-ok";
  if (s >= 300 && s < 400) return "r-warn";
  return "r-err";
});

const statusText = computed(() => {
  const s = last.value?.status ?? 0;
  if (s === 0) return "网络错误";
  const map: Record<number, string> = {
    200: "OK",
    201: "Created",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    404: "Not Found",
    500: "Internal Server Error",
  };
  return `HTTP ${s} ${map[s] || ""}`;
});

const responseBody = computed(() => {
  const r = last.value?.response;
  return typeof r === "string" ? r : JSON.stringify(r, null, 2);
});

function highlightJson(json: string): string {
  return json.replace(
    /("(?:\\.|[^"\\])*")\s*:|("(?:\\.|[^"\\])*")|(true|false|null)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],:]|\s+)/g,
    (match, key, str, literal, number, _punc) => {
      if (key) return `<span class="j-key">${key}</span>:`;
      if (str) return `<span class="j-str">${str}</span>`;
      if (literal) return `<span class="j-lit">${literal}</span>`;
      if (number) return `<span class="j-num">${number}</span>`;
      return match;
    },
  );
}

const highlightedResponseBody = computed(() => {
  const raw = responseBody.value;
  try {
    JSON.parse(raw);
    return highlightJson(raw);
  } catch {
    return raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
});

function removeKv(list: KvRow[], i: number) {
  list.splice(i, 1);
  if (!list.length) list.push({ key: "", value: "", desc: "" });
}

// 自动添加新行
watch(
  () => activeTab.value.query,
  (val) => {
    const last = val[val.length - 1];
    if (last && (last.key.trim() || last.value.trim() || last.desc.trim())) {
      val.push({ key: "", value: "", desc: "" });
    }
  },
  { deep: true },
);

watch(
  () => activeTab.value.headers,
  (val) => {
    const last = val[val.length - 1];
    if (last && (last.key.trim() || last.value.trim() || last.desc.trim())) {
      val.push({ key: "", value: "", desc: "" });
    }
  },
  { deep: true },
);

// Tab 操作
function addTab() {
  tabs.value.push(createEmptyTab());
  activeTabIdx.value = tabs.value.length - 1;
  last.value = null;
}

function switchTab(i: number) {
  activeTabIdx.value = i;
  last.value = null;
}

function closeTab(i: number) {
  if (tabs.value.length <= 1) {
    tabs.value = [createEmptyTab()];
    activeTabIdx.value = 0;
    last.value = null;
    return;
  }
  tabs.value.splice(i, 1);
  if (activeTabIdx.value >= tabs.value.length) {
    activeTabIdx.value = tabs.value.length - 1;
  }
  last.value = null;
}

function buildRequest(tab: TabData): DebugRequest {
  const auth: Record<string, string> = {};
  if (tab.authType === "basic") {
    auth.username = tab.authUser;
    auth.password = tab.authPass;
  } else if (tab.authType === "bearer") {
    auth.token = tab.authToken;
  } else if (tab.authType === "cookie") {
    auth.cookie = tab.authCookie;
  }
  return {
    id: tab.id,
    name: tab.name,
    method: tab.method,
    url: tab.url,
    protocol: "HTTP",
    headers: tab.headers.map((r) => ({ key: r.key, value: r.value, enabled: true })),
    query: tab.query.map((r) => ({ key: r.key, value: r.value, enabled: true })),
    bodyType: tab.bodyType,
    body: tab.body,
    bodyParams: tab.bodyParams.map((r) => ({ key: r.key, value: r.value, enabled: r.enabled ?? true })),
    authType: tab.authType,
    auth,
  };
}

function loadToTab(tab: TabData, r: DebugRequest) {
  tab.id = r.id;
  tab.name = r.name;
  tab.method = r.method;
  tab.url = r.url;
  tab.query = r.query.map((q) => ({ key: q.key, value: q.value, desc: "" }));
  if (!tab.query.length) tab.query.push({ key: "", value: "", desc: "" });
  tab.headers = r.headers.map((h) => ({ key: h.key, value: h.value, desc: "" }));
  if (!tab.headers.length) tab.headers.push({ key: "", value: "", desc: "" });
  tab.bodyType = r.bodyType;
  tab.body = r.body || "{}";
  tab.bodyParams = (r.bodyParams || []).map((p) => ({ key: p.key, value: p.value, desc: "", enabled: p.enabled }));
  tab.authType = r.authType;
  tab.authUser = r.auth?.username || "";
  tab.authPass = r.auth?.password || "";
  tab.authToken = r.auth?.token || "";
  tab.authCookie = r.auth?.cookie || "";
}

async function send() {
  if (sending.value) return;
  const tab = activeTab.value;
  const u = tab.url.trim();
  if (!u) {
    ElMessage.warning("请输入请求 URL");
    return;
  }
  sending.value = true;
  try {
    const req = buildRequest(tab);
    const res = await executeRequest(req);
    last.value = {
      status: res.status,
      time: res.time,
      response: res.body,
    };
  } catch (e: any) {
    last.value = {
      status: 0,
      time: 0,
      response: JSON.stringify(
        { code: -1, message: String(e.message || e) },
        null,
        2,
      ),
    };
  } finally {
    sending.value = false;
  }
}

function clear() {
  const tab = activeTab.value;
  tab.url = "";
  tab.query = [{ key: "", value: "", desc: "" }];
  tab.headers = [{ key: "", value: "", desc: "" }];
  tab.body = "{}";
  tab.bodyType = "raw";
  tab.bodyParams = [];
  tab.authType = "none";
  tab.authUser = "";
  tab.authPass = "";
  tab.authToken = "";
  tab.authCookie = "";
  last.value = null;
}

onMounted(() => {
  fetchDebugRequests().then((list) => {
    if (list.length > 0) {
      tabs.value = [];
      for (const r of list) {
        const tab = createEmptyTab();
        loadToTab(tab, r);
        tabs.value.push(tab);
      }
      activeTabIdx.value = 0;
    }
  }).catch(() => { });
});
</script>

<style>
.at-dbg {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

/* 标签页栏 */
.at-tabbar {
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  padding-bottom: 0;
}

.at-tabs {
  display: flex;
  flex: 1;
  overflow-x: auto;
  gap: 2px;
  min-width: 0;
}

.at-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px 5px 10px;
  border-radius: 6px 6px 0 0;
  border: 1px solid transparent;
  background: var(--el-fill-color-lighter, #f5f7fa);
  cursor: pointer;
  white-space: nowrap;
  font-size: 12px;
  transition: background 0.15s;
  max-width: 200px;
}

.at-tab:hover {
  background: var(--el-fill-color-light, #fafafa);
}

.at-tab.active {
  background: var(--el-bg-color, #fff);
  border-color: var(--el-border-color-lighter, #ebeef5);
  border-bottom-color: var(--el-bg-color, #fff);
}

.at-tab-method {
  font-weight: 600;
  font-size: 11px;
  color: var(--el-color-primary, #409eff);
  flex-shrink: 0;
}

.at-tab-name {
  border: none;
  background: transparent;
  font-size: 12px;
  font-family: inherit;
  color: var(--el-text-color-primary, #303133);
  outline: none;
  min-width: 40px;
  max-width: 110px;
  padding: 0 2px;
}

.at-tab-name:focus {
  border-bottom: 1px dashed var(--el-color-primary, #409eff);
}

.at-tab-close {
  background: none;
  border: none;
  padding: 0 2px;
  font-size: 14px;
  cursor: pointer;
  color: var(--el-text-color-placeholder, #a8abb2);
  line-height: 1;
  border-radius: 3px;
  flex-shrink: 0;
}

.at-tab-close:hover {
  color: var(--el-color-danger, #f56c6c);
  background: rgba(245, 108, 108, 0.1);
}

.at-tab-add {
  background: none;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px 6px 0 0;
  padding: 4px 10px;
  font-size: 16px;
  cursor: pointer;
  color: var(--el-text-color-secondary, #909399);
  line-height: 1;
  flex-shrink: 0;
  height: 28px;
  display: flex;
  align-items: center;
}

.at-tab-add:hover {
  color: var(--el-color-primary, #409eff);
  border-color: var(--el-color-primary, #409eff);
  background: var(--el-fill-color-light, #fafafa);
}

.at-reqline {
  display: flex;
  gap: 8px;
  align-items: center;
}

.at-send {
  gap: 6px;
}

.at-dbg-cols {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 12px;
  align-items: stretch;
  flex: 1;
  min-height: 0;
}

.at-dbg-panel {
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.at-dbg-panel h4 {
  margin: 0;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
  background: var(--el-fill-color-lighter, #f5f7fa);
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  display: flex;
  align-items: center;
  gap: 8px;
}

.at-dbg-panel h4 .hint {
  font-weight: 400;
  font-size: 11.5px;
  color: var(--el-text-color-secondary, #909399);
}

.at-seg {
  display: flex;
  gap: 2px;
  padding: 8px 12px 0;
}

.at-seg button {
  background: none;
  border: none;
  padding: 7px 14px;
  font-size: 12.5px;
  font-family: inherit;
  color: var(--el-text-color-regular, #606266);
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.at-seg button.on {
  color: var(--el-color-primary, #409eff);
  border-bottom-color: var(--el-color-primary, #409eff);
  font-weight: 600;
}

.at-kv-wrap {
  padding: 10px 12px 12px;
}

.at-kv-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  padding: 0 0 6px;
}

.at-kv-head span {
  flex: 1;
  padding: 0 10px;
  border: 1px solid transparent;
  box-sizing: border-box;
}

.at-kv-head span.k2 {
  flex: 0.9;
}

.at-kv-head span.k3 {
  flex: 1.2;
}

.at-kv-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.at-kv-row .bg-in {
  flex: 1;
  height: 32px;
}

.at-kv-row .k2 {
  flex: 0.9;
}

.at-kv-row .k3 {
  flex: 1.2;
}

.at-kv-del {
  background: none;
  border: none;
  padding: 0 4px;
  font-size: 16px;
  cursor: pointer;
  color: var(--el-text-color-placeholder, #a8abb2);
  line-height: 1;
}

.at-kv-del:hover {
  color: var(--el-color-danger, #f56c6c);
}

.at-add {
  background: none;
  border: 1px dashed var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 12.5px;
  font-family: inherit;
  color: var(--el-color-primary, #409eff);
  cursor: pointer;
  margin: 2px 12px 12px;
}

.at-add:hover {
  border-color: var(--el-color-primary, #409eff);
}

/* Authorization */
.at-auth {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.at-auth-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.at-auth-row label {
  width: 72px;
  font-size: 12.5px;
  color: var(--el-text-color-secondary, #909399);
  flex-shrink: 0;
}

/* Body editor wrap */
.at-body-wrap {
  flex: 1;
  overflow: auto;
}

.at-body {
  padding: 10px 12px 12px;
}

.at-body textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 150px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  background: var(--el-fill-color-light, #fafafa);
  color: var(--el-text-color-primary, #303133);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  padding: 10px;
  outline: none;
  resize: vertical;
  transition: border-color 0.18s ease;
}

.at-body textarea:focus {
  border-color: var(--el-color-primary, #409eff);
}

/* 响应区 */
.at-resp {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.at-resp-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  flex-wrap: wrap;
}

.at-resp-code {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 5px;
  font-size: 12.5px;
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.at-resp-code.r-ok {
  background: #e8f5e9;
  color: #2e7d32;
}

.at-resp-code.r-warn {
  background: #fff3e0;
  color: #e65100;
}

.at-resp-code.r-err {
  background: #fce4ec;
  color: #c62828;
}

.at-resp-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
}

.at-resp-mock {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  background: #f3e8fd;
  color: #8b5cf6;
  font-size: 11.5px;
}

.at-resp-pre {
  margin: 0;
  padding: 14px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--el-text-color-primary, #303133);
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 420px;
  overflow: auto;
  flex: 1;
}

.at-resp-empty {
  padding: 75px 16px;
  text-align: center;
  color: var(--el-text-color-placeholder, #a8abb2);
  font-size: 13px;
}

.at-spin {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary, #909399);
}

.at-spin .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-primary, #409eff);
  animation: at-spin-dot 0.9s infinite alternate;
}

@keyframes at-spin-dot {
  from {
    opacity: 0.25;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1.2);
  }
}

@media (max-width: 900px) {
  .at-dbg-cols {
    grid-template-columns: 1fr;
  }
}

/* JSON 语法高亮 */
.j-key {
  color: #0550ae;
}

.j-str {
  color: #0a3069;
}

.j-lit {
  color: #cf222e;
}

.j-num {
  color: #0550ae;
}
</style>