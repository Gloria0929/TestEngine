// src/utils/storage.ts
const PREFIX = 'te_'
export const storage = {
  get<T>(key: string): T | null {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return raw as unknown as T
    }
  },
  set<T>(key: string, value: T): void {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  },
  remove(key: string): void {
    localStorage.removeItem(PREFIX + key)
  },
}
