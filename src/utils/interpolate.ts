// src/utils/interpolate.ts
import type { KeyValue } from '@/types/models'

// 变量替换：将字符串中的 ${name} 替换为 vars 中的值，未定义的变量保留原样（与 Postman 行为一致）
export function interpolate(input: string, vars: Record<string, string>): string {
  if (!input) return input
  return input.replace(/\$\{([^}]+)\}/g, (raw, name: string) => {
    const key = name.trim()
    const value = vars[key]
    return value !== undefined ? value : raw
  })
}

// 对 KeyValue 列表的 key/value 做变量替换，保留 enabled 等其它字段
export function interpolateKvs(list: KeyValue[], vars: Record<string, string>): KeyValue[] {
  return list.map((kv) => ({
    ...kv,
    key: interpolate(kv.key, vars),
    value: interpolate(kv.value, vars),
  }))
}
