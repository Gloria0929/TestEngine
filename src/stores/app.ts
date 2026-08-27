// src/stores/app.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'

export const useAppStore = defineStore('app', () => {
  const theme = ref<'light' | 'dark'>(storage.get('theme') ?? 'light')
  const locale = ref<'zh-CN' | 'en-US'>(storage.get('locale') ?? 'zh-CN')
  const sidebarCollapsed = ref<boolean>(storage.get('sidebarCollapsed') ?? false)

  function applyTheme() { document.documentElement.classList.toggle('dark', theme.value === 'dark') }
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    storage.set('theme', theme.value)
    applyTheme()
  }
  function setLocale(l: 'zh-CN' | 'en-US') {
    locale.value = l
    storage.set('locale', l)
  }
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    storage.set('sidebarCollapsed', sidebarCollapsed.value)
  }

  return { theme, locale, sidebarCollapsed, applyTheme, toggleTheme, setLocale, toggleSidebar }
})
