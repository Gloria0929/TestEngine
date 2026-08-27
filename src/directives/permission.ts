// src/directives/permission.ts
import type { Directive } from 'vue'
import { useUserStore } from '@/stores/user'

export const permission: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    const userStore = useUserStore()
    if (!userStore.hasPermission(binding.value)) {
      el.parentNode?.removeChild(el)
    }
  },
}
