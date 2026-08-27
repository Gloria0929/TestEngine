// src/stores/notification.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from '@/types/models'
import { fetchNotifications, markRead, markAllRead } from '@/api/workstation'

export const useNotificationStore = defineStore('notification', () => {
  const list = ref<Notification[]>([])
  const unreadCount = computed(() => list.value.filter((n) => !n.read).length)

  async function load() { list.value = await fetchNotifications() }
  async function markOne(id: string) {
    await markRead(id)
    list.value = list.value.map((n) => (n.id === id ? { ...n, read: true } : n))
  }
  async function markAll() {
    await markAllRead()
    list.value = list.value.map((n) => ({ ...n, read: true }))
  }

  return { list, unreadCount, load, markOne, markAll }
})
