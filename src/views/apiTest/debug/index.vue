<template>
  <div class="at-dbg">
    <!-- 左侧边栏：接口收藏 + 调试记录 -->
    <aside class="at-dbg-side">
      <!-- 收藏夹 -->
      <div class="side-block">
        <div class="side-head">
          <span class="side-title">接口收藏</span>
          <el-icon class="side-op" title="新建文件夹" @click="onCreateFolder">
            <FolderAdd />
          </el-icon>
        </div>
        <div class="side-body">
          <div v-for="f in folders" :key="f.id" class="side-folder">
            <div class="folder-row" @click="toggleFolder(f.id)">
              <el-icon class="arrow" :class="{ open: openedFolders.has(f.id) }">
                <CaretRight />
              </el-icon>
              <el-icon class="folder-icon">
                <Folder />
              </el-icon>
              <span class="row-name" :title="f.name">{{ f.name }}</span>
              <span class="row-count">{{ f.items.length }}</span>
              <span class="row-ops">
                <el-icon title="重命名" @click.stop="onRenameFolder(f)">
                  <EditPen />
                </el-icon>
                <el-icon title="删除文件夹" @click.stop="onDeleteFolder(f)">
                  <Delete />
                </el-icon>
              </span>
            </div>
            <template v-if="openedFolders.has(f.id)">
              <div v-for="item in f.items" :key="item.id" class="item-row" @click="openSaved(item)">
                <span class="m-badge" :class="item.method.toLowerCase()">{{ item.method }}</span>
                <span class="row-name" :title="item.name || item.url">{{ item.name || item.url }}</span>
                <span class="row-ops">
                  <el-icon title="重命名" @click.stop="onRenameItem(f, item)">
                    <EditPen />
                  </el-icon>
                  <el-icon title="删除" @click.stop="onDeleteItem(f, item)">
                    <Delete />
                  </el-icon>
                </span>
              </div>
              <div v-if="!f.items.length" class="side-hint">暂无接口，发送后点「保存」</div>
            </template>
          </div>
          <div v-if="!folders.length" class="side-hint">点击右上角图标新建文件夹</div>
        </div>
      </div>
      <!-- 调试记录 -->
      <div class="side-block">
        <div class="side-head">
          <span class="side-title">调试记录</span>
          <el-icon v-if="history.length" class="side-op" title="清空记录" @click="onClearHistory">
            <Delete />
          </el-icon>
        </div>
        <div class="side-body">
          <div v-for="h in history" :key="h.id" class="item-row" @click="openHistory(h)">
            <span class="m-badge" :class="h.method.toLowerCase()">{{ h.method }}</span>
            <span class="row-name" :title="h.url">{{ h.url || "未命名" }}</span>
          </div>
          <div v-if="!history.length" class="side-hint">发送请求后自动记录</div>
        </div>
      </div>
    </aside>

    <!-- 右侧主区 -->
    <div class="at-dbg-main">
      <!-- 标签页栏 -->
      <div class="at-tabbar">
        <div class="at-tabs">
          <div v-for="(tab, i) in tabs" :key="i" class="at-tab" :class="{ active: i === activeTabIdx }"
            @click="switchTab(i)">
            <span class="at-tab-method">{{ tab.method }}</span>
            <span class="at-tab-name" :title="tab.name || '未命名'">{{ tab.name || '未命名' }}</span>
            <el-button text @click.stop="closeTab(i)" title="关闭">
              <el-icon>
                <Close />
              </el-icon>
            </el-button>
          </div>
          <el-button text class="at-tab-add" @click="addTab" title="新建标签">
            <el-icon>
              <Plus />
            </el-icon>
          </el-button>
        </div>
      </div>

      <!-- 请求行：方法 + URL + 发送/清空 -->
      <div class="at-reqline">
        <el-select v-model="activeTab.method" style="width:118px" size="default">
          <el-option v-for="m in methods" :key="m" :label="m" :value="m" />
        </el-select>
        <el-input v-model="activeTab.url" style="flex:1" size="default"
          :placeholder="showBody ? '请输入请求 URL，POST/PUT 请求可带请求体' : '请输入请求 URL，如 /api/v1/users?page=1'"
          @keydown.enter="send" />
        <el-button type="primary" size="default" :disabled="sending" @click="send">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4Z" />
          </svg>
          {{ sending ? "发送中…" : "发送" }}
        </el-button>
        <el-button size="default" @click="openSave">保存</el-button>
        <el-button size="default" @click="clear">清空</el-button>
      </div>

      <!-- 左右两栏 -->
      <div class="at-dbg-cols">
        <!-- 请求配置 -->
        <div class="at-dbg-panel">
          <h4>请求配置</h4>
          <div class="at-seg">
            <el-button text :class="{ on: seg === 'query' }" @click="seg = 'query'">Params</el-button>
            <el-button text :class="{ on: seg === 'auth' }" @click="seg = 'auth'">Authorization</el-button>
            <el-button text :class="{ on: seg === 'headers' }" @click="seg = 'headers'">Headers</el-button>
            <el-button text :class="{ on: seg === 'body' }" @click="seg = 'body'">Body</el-button>
          </div>

          <div v-show="seg === 'query'">
            <div class="at-kv-wrap">
              <div class="at-kv-head">
                <span>参数名</span><span>参数值</span><span>描述</span><span style="width:24px"></span>
              </div>
              <div class="at-kv-row" v-for="(r, i) in activeTab.query" :key="i">
                <el-input v-model="r.key" placeholder="key" />
                <el-input v-model="r.value" placeholder="value" />
                <el-input v-model="r.desc" placeholder="描述（选填）" />
                <el-button text @click="removeKv(activeTab.query, i)">
                  <el-icon>
                    <Close />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- Authorization -->
          <div v-show="seg === 'auth'" class="at-auth">
            <div class="at-auth-row">
              <el-text>Type</el-text>
              <el-select v-model="activeTab.authType" style="width:160px">
                <el-option label="No Auth" value="none" />
                <el-option label="Basic Auth" value="basic" />
                <el-option label="Bearer Token" value="bearer" />
                <el-option label="Cookie" value="cookie" />
              </el-select>
            </div>
            <template v-if="activeTab.authType === 'basic'">
              <div class="at-auth-row">
                <el-text>Username</el-text>
                <el-input v-model="activeTab.authUser" style="flex:1" placeholder="用户名" />
              </div>
              <div class="at-auth-row">
                <el-text>Password</el-text>
                <el-input v-model="activeTab.authPass" style="flex:1" type="password" placeholder="密码" show-password />
              </div>
            </template>
            <div v-if="activeTab.authType === 'bearer'" class="at-auth-row">
              <el-text>Token</el-text>
              <el-input v-model="activeTab.authToken" style="flex:1" placeholder="Bearer token" />
            </div>
            <div v-if="activeTab.authType === 'cookie'" class="at-auth-row">
              <el-text>Cookie</el-text>
              <el-input v-model="activeTab.authCookie" style="flex:1" placeholder="Cookie 字符串" />
            </div>
          </div>

          <!-- 请求头 -->
          <div v-show="seg === 'headers'">
            <div class="at-kv-wrap">
              <div class="at-kv-head">
                <span>Header 名</span><span class="k2">值</span><span class="k3">描述</span><span style="width:24px"></span>
              </div>
              <div class="at-kv-row" v-for="(r, i) in activeTab.headers" :key="i">
                <el-input v-model="r.key" placeholder="key" />
                <el-input v-model="r.value" placeholder="value" />
                <el-input v-model="r.desc" placeholder="描述（选填）" />
                <el-button text @click="removeKv(activeTab.headers, i)" title="删除该行">
                  <el-icon>
                    <Close />
                  </el-icon>
                </el-button>
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
                <span class="at-resp-code" :class="statusCodeCls">{{ statusText }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  executeRequest,
  fetchDebugRequests,
  fetchDebugCollections,
  createDebugFolder,
  renameDebugFolder,
  deleteDebugFolder,
  saveDebugItem,
  renameDebugItem,
  deleteDebugItem,
} from "@/api/apiTest";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Close,
  Plus,
  Folder,
  FolderAdd,
  CaretRight,
  EditPen,
  Delete,
} from "@element-plus/icons-vue";
import type { HttpMethod, BodyType, DebugRequest, DebugFolder } from "@/types/models";
import BodyEditor from "./components/BodyEditor.vue";

const route = useRoute();

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
    pushHistory(tab);
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

// ===== 左侧边栏：收藏夹 + 调试记录 =====
const folders = ref<DebugFolder[]>([]);
const openedFolders = reactive(new Set<string>());

interface HistoryItem {
  id: string;
  method: HttpMethod;
  url: string;
  name: string;
  time: string;
}
const HISTORY_KEY = "at-dbg-history";
const history = ref<HistoryItem[]>([]);

function loadHistory() {
  try {
    history.value = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    history.value = [];
  }
}

function pushHistory(tab: TabData) {
  if (!tab.url.trim()) return;
  const item: HistoryItem = {
    id: `${Date.now()}`,
    method: tab.method,
    url: tab.url,
    name: tab.name,
    time: new Date().toLocaleString(),
  };
  // 去重：相同 method+url 提到最前
  history.value = history.value.filter(
    (h) => !(h.method === item.method && h.url === item.url),
  );
  history.value.unshift(item);
  if (history.value.length > 50) history.value.length = 50;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value));
}

function onClearHistory() {
  ElMessageBox.confirm("确定清空全部调试记录？", "提示", { type: "warning" })
    .then(() => {
      history.value = [];
      localStorage.removeItem(HISTORY_KEY);
    })
    .catch(() => { });
}

function toggleFolder(id: string) {
  if (openedFolders.has(id)) openedFolders.delete(id);
  else openedFolders.add(id);
}

function openSaved(item: DebugRequest) {
  const tab = createEmptyTab();
  loadToTab(tab, item);
  tabs.value.push(tab);
  activeTabIdx.value = tabs.value.length - 1;
  last.value = null;
}

function openHistory(h: HistoryItem) {
  const tab = createEmptyTab();
  tab.name = h.name;
  tab.method = h.method;
  tab.url = h.url;
  tabs.value.push(tab);
  activeTabIdx.value = tabs.value.length - 1;
  last.value = null;
}

function askName(title: string, initial = ""): Promise<string> {
  return ElMessageBox.prompt("请输入名称", title, {
    inputValue: initial,
    inputPattern: /\S+/,
    inputErrorMessage: "名称不能为空",
  }).then(({ value }) => value.trim());
}

async function onCreateFolder() {
  const name = await askName("新建文件夹");
  const f = await createDebugFolder(name);
  folders.value.push(f);
  openedFolders.add(f.id);
  ElMessage.success("文件夹已创建");
}

async function onRenameFolder(f: DebugFolder) {
  const name = await askName("重命名文件夹", f.name);
  await renameDebugFolder(f.id, name);
  f.name = name;
}

function onDeleteFolder(f: DebugFolder) {
  ElMessageBox.confirm(
    `确定删除文件夹「${f.name}」？其中 ${f.items.length} 个已保存接口将一并删除。`,
    "删除确认",
    { type: "warning" },
  )
    .then(async () => {
      await deleteDebugFolder(f.id);
      folders.value = folders.value.filter((x) => x.id !== f.id);
      ElMessage.success("已删除");
    })
    .catch(() => { });
}

async function onRenameItem(f: DebugFolder, item: DebugRequest) {
  const name = await askName("重命名接口", item.name);
  await renameDebugItem(f.id, item.id, name);
  item.name = name;
  // 同步已打开的对应 Tab 名称
  for (const t of tabs.value) {
    if (t.id === item.id) t.name = name;
  }
}

function onDeleteItem(f: DebugFolder, item: DebugRequest) {
  ElMessageBox.confirm(`确定删除接口「${item.name || item.url}」？`, "删除确认", {
    type: "warning",
  })
    .then(async () => {
      await deleteDebugItem(f.id, item.id);
      f.items = f.items.filter((x) => x.id !== item.id);
      ElMessage.success("已删除");
    })
    .catch(() => { });
}

// 保存当前请求到收藏夹
const saveVisible = ref(false);
const saveFolderId = ref("");
const saveNewFolder = ref("");
const saveName = ref("");

function openSave() {
  const tab = activeTab.value;
  if (!tab.url.trim()) {
    ElMessage.warning("请先填写请求 URL 再保存");
    return;
  }
  saveFolderId.value = folders.value[0]?.id || "";
  saveNewFolder.value = "";
  saveName.value = tab.name || `${tab.method} ${tab.url}`;
  saveVisible.value = true;
}

async function confirmSave() {
  const name = saveName.value.trim();
  if (!name || !saveFolderId.value) return;
  let folderId = saveFolderId.value;
  if (folderId === "__new__") {
    const new_name = saveNewFolder.value.trim();
    if (!new_name) {
      ElMessage.warning("请填写新文件夹名称");
      return;
    }
    const f = await createDebugFolder(new_name);
    folders.value.push(f);
    openedFolders.add(f.id);
    folderId = f.id;
  }
  const tab = activeTab.value;
  const saved = await saveDebugItem(folderId, { ...buildRequest(tab), name });
  const folder = folders.value.find((x) => x.id === folderId);
  folder?.items.push(saved);
  saveVisible.value = false;
  ElMessage.success("已保存到收藏夹");
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
  loadHistory();
  fetchDebugCollections()
    .then((list) => {
      folders.value = list;
      if (list.length) openedFolders.add(list[0].id);
    })
    .catch(() => { });
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
  }).catch(() => { }).finally(() => {
    // 从接口定义页“执行”跳转：预填一个新 Tab（放在保存请求加载之后，避免被覆盖）
    const defId = route.query.definitionId as string | undefined;
    if (defId) {
      const tab = createEmptyTab();
      tab.id = "";
      tab.name = (route.query.name as string) || "接口执行";
      tab.method = ((route.query.method as string) || "GET") as HttpMethod;
      tab.url = (route.query.path as string) || "";
      tabs.value.push(tab);
      activeTabIdx.value = tabs.value.length - 1;
    }
  });
});
</script>

<style>
.at-dbg {
  display: flex;
  gap: 12px;
  height: 100%;
  align-items: stretch;
}

/* ===== 左侧边栏 ===== */
.at-dbg-side {
  width: 232px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.side-block {
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 10px;
  background: var(--el-bg-color, #fff);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.side-block:first-child {
  flex: 1.3;
}

.side-block:last-child {
  flex: 1;
}

.side-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
  background: var(--el-fill-color-lighter, #f5f7fa);
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  flex-shrink: 0;
}

.side-op {
  color: var(--el-text-color-secondary, #909399);
  cursor: pointer;
  font-size: 14px;
}

.side-op:hover {
  color: var(--el-color-primary, #409eff);
}

.side-body {
  flex: 1;
  overflow: auto;
  padding: 4px 0;
}

.side-hint {
  padding: 10px 12px;
  font-size: 11.5px;
  color: var(--el-text-color-placeholder, #a8abb2);
}

.folder-row,
.item-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  font-size: 12.5px;
  color: var(--el-text-color-regular, #606266);
  cursor: pointer;
  line-height: 1.4;
}

.folder-row:hover,
.item-row:hover {
  background: var(--el-fill-color-light, #f5f7fa);
}

.folder-icon {
  color: var(--el-color-warning, #e6a23c);
  flex-shrink: 0;
}

.arrow {
  font-size: 11px;
  color: var(--el-text-color-secondary, #909399);
  transition: transform 0.15s;
  flex-shrink: 0;
}

.arrow.open {
  transform: rotate(90deg);
}

.m-badge {
  font-size: 10px;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  padding: 1px 4px;
  border-radius: 3px;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

.m-badge.get {
  color: #2e7d32;
  background: #e8f5e9;
}

.m-badge.post {
  color: #e65100;
  background: #fff3e0;
}

.m-badge.put {
  color: #1565c0;
  background: #e3f2fd;
}

.m-badge.delete {
  color: #c62828;
  background: #fce4ec;
}

.m-badge.patch {
  color: #6a1b9a;
  background: #f3e5f5;
}

.m-badge.options,
.m-badge.head {
  color: #546e7a;
  background: #eceff1;
}

.row-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-count {
  font-size: 10.5px;
  color: var(--el-text-color-secondary, #909399);
  background: var(--el-fill-color, #f0f2f5);
  border-radius: 8px;
  padding: 0 6px;
  line-height: 16px;
  flex-shrink: 0;
}

.row-ops {
  display: none;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.row-ops .el-icon {
  color: var(--el-text-color-secondary, #909399);
  font-size: 13px;
}

.row-ops .el-icon:hover {
  color: var(--el-color-primary, #409eff);
}

.folder-row:hover .row-ops,
.item-row:hover .row-ops {
  display: inline-flex;
}

/* 右侧主区 */
.at-dbg-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  align-items: flex-end;
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
  min-width: 40px;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 标签栏「+」按钮：与标签同高（关闭按钮 32px + 标签上下内边距 5px×2），使图标与 X 垂直居中对齐 */
.at-tabs .at-tab-add {
  height: 42px;
  padding: 5px 8px;
  margin: 0;
  border-radius: 6px 6px 0 0;
  color: var(--el-text-color-secondary, #909399);
  align-self: flex-end;
}

.at-tabs .at-tab-add:hover {
  color: var(--el-color-primary, #409eff);
  background: var(--el-fill-color-light, #fafafa);
}

.at-reqline {
  display: flex;
  gap: 8px;
  align-items: center;
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

.at-seg .el-button {
  background: none;
  border: none;
  padding: 7px 14px;
  font-size: 12.5px;
  font-family: inherit;
  color: var(--el-text-color-regular, #606266);
  border-bottom: 2px solid transparent;
  border-radius: 0;
  min-height: auto;
}

.at-seg .el-button.on {
  color: var(--el-color-primary, #409eff);
  border-bottom-color: var(--el-color-primary, #409eff);
  font-weight: 600;
}

.at-kv-wrap {
  padding: 10px 12px 12px;
}

.at-kv-head,
.at-kv-row {
  display: grid;
  grid-template-columns: 1fr 0.9fr 1.2fr 24px;
  gap: 8px;
  align-items: center;
}

.at-kv-head {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  padding: 0 0 6px;
}

.at-kv-head span {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  box-sizing: border-box;
}

.at-kv-row {
  margin-bottom: 8px;
}

.at-kv-row .bg-in {
  width: 100%;
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

.at-auth-row .el-text {
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

/* 保存接口弹窗表单 */
.save-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sf-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sf-row label {
  width: 84px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  text-align: right;
}

@media (max-width: 900px) {
  .at-dbg {
    flex-direction: column;
  }

  .at-dbg-side {
    width: 100%;
    flex-direction: row;
  }

  .side-block {
    flex: 1 !important;
    max-height: 200px;
  }

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