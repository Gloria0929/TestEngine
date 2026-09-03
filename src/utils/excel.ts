// src/utils/excel.ts
import * as XLSX from 'xlsx'
import type { TestCase } from '@/types/models'

export function parseCases(file: File): Promise<Partial<TestCase>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws)
        resolve(rows.map((r) => ({ name: r['用例名称'] ?? '', level: (r['等级'] ?? 'P1') as TestCase['level'], moduleId: r['模块'] ?? '', precondition: r['前置条件'] ?? '', steps: [], tags: (r['标签'] ?? '').split(',').filter(Boolean) })))
      } catch (err) { reject(err) }
    }
    reader.readAsArrayBuffer(file)
  })
}
