// src/utils/security.ts
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
}

// 给对象里所有 string 字段做一次 escape（简单通用版）
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const clone = { ...obj }
  for (const k in clone) {
    const v = clone[k]
    if (typeof v === 'string') {
      clone[k] = escapeHtml(v) as unknown as T[Extract<keyof T, string>]
    }
  }
  return clone
}

// 防止开放重定向：只允许以 `/` 开头，且不是 `//`（跨域）
export function isSafeRedirect(path?: string | null): boolean {
  if (!path) return false
  return path.startsWith('/') && !path.startsWith('//')
}
