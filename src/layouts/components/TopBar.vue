<template>
  <div class="topbar">
    <div class="left">
      <el-icon class="collapse-btn" @click="appStore.toggleSidebar()">
        <Fold v-if="!appStore.sidebarCollapsed" /><Expand v-else />
      </el-icon>
      <el-select :model-value="currentProjectId" size="small" style="width: 200px" @update:model-value="onProjectChange">
        <el-option v-for="p in projects" :key="p.id" :label="p.name" :value="p.id" />
      </el-select>
    </div>
    <div class="right">
      <el-badge :value="notification.unreadCount" :hidden="notification.unreadCount === 0">
        <el-icon class="action" @click="showNotif = true"><Bell /></el-icon>
      </el-badge>
      <el-icon class="action" @click="appStore.toggleTheme()">
        <Moon v-if="appStore.theme === 'light'" /><Sunny v-else />
      </el-icon>
      <el-dropdown @command="onLang">
        <span class="action lang">{{ appStore.locale === 'zh-CN' ? '中' : 'EN' }}</span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
            <el-dropdown-item command="en-US">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown @command="onUser">
        <span class="user"><el-avatar :size="26">{{ userStore.user?.name?.slice(0, 1) }}</el-avatar></span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="personal">{{ t('topbar.personal') }}</el-dropdown-item>
            <el-dropdown-item command="logout" divided>{{ t('topbar.logout') }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-drawer v-model="showNotif" :title="t('topbar.notification')" size="360px">
      <div v-if="notification.list.length === 0" class="empty">{{ t('common.empty') }}</div>
      <div v-for="n in notification.list" :key="n.id" class="notif-item" :class="{ unread: !n.read }" @click="notification.markOne(n.id)">
        <div class="title">{{ n.title }}</div>
        <div class="content">{{ n.content }}</div>
      </div>
      <el-button v-if="notification.unreadCount > 0" size="small" @click="notification.markAll()">{{ t('topbar.markAllRead') }}</el-button>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { i18n } from '@/locales'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { fetchProjects } from '@/api/project'

const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const notification = useNotificationStore()

const showNotif = ref(false)
const projects = ref<Array<{ id: string; name: string }>>([])
const currentProjectId = ref('p-1')

async function onProjectChange(id: string) { currentProjectId.value = id }
function onLang(l: 'zh-CN' | 'en-US') {
  appStore.setLocale(l)
  i18n.global.locale.value = l
}
function onUser(cmd: string) {
  if (cmd === 'logout') userStore.logout().then(() => router.replace('/login'))
  else router.push('/personal/profile')
}

onMounted(async () => {
  i18n.global.locale.value = appStore.locale
  projects.value = await fetchProjects({ orgId: '100001' })
  await notification.load()
})
</script>
