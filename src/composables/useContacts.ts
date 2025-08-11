// src/composables/useContacts.ts
import { ref } from 'vue'
import { sanitizeObject } from '@/utils/security' // 若没有 @ 别名，请改为相对路径 ../utils/security

export type ContactMessage = {
  id: number
  name: string
  email: string
  message: string
  createdAt: string
  read: boolean
}

type NewMessage = Omit<ContactMessage, 'id' | 'createdAt' | 'read'>

const STORAGE_KEY = 'hc_contact_messages'

// 一些基本长度限制（双保险：表单里也要再做一遍 maxlength）
const MAX_NAME_LEN = 60
const MAX_EMAIL_LEN = 120
const MAX_MESSAGE_LEN = 500

const messages = ref<ContactMessage[]>(load())

function load(): ContactMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    // 这里简单信任存储的数据（因为我们写入前已做清洗）
    // 如果你想更严谨，可在此处再做一次字段校验/裁剪
    return Array.isArray(parsed) ? (parsed as ContactMessage[]) : []
  } catch {
    return []
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value))
  } catch {
    // 忽略存储错误（配额满等）
  }
}

function nextId() {
  return messages.value.length
    ? Math.max(...messages.value.map((m) => m.id)) + 1
    : 1
}

/**
 * 对用户输入进行裁剪 + 转义（XSS 保护）
 */
function normalize(payload: NewMessage): NewMessage {
  // 先转义
  const safe = sanitizeObject(payload)

  // 再做长度裁剪（防止极端情况）
  return {
    ...safe,
    name: safe.name.slice(0, MAX_NAME_LEN),
    email: safe.email.slice(0, MAX_EMAIL_LEN),
    message: safe.message.slice(0, MAX_MESSAGE_LEN)
  }
}

export function addMessage(payload: NewMessage) {
  const clean = normalize(payload)

  const m: ContactMessage = {
    id: nextId(),
    createdAt: new Date().toISOString(),
    read: false,
    ...clean
  }
  messages.value.push(m)
  save()
  return m
}

export function markRead(id: number, read = true) {
  const idx = messages.value.findIndex((m) => m.id === id)
  if (idx === -1) return false
  messages.value[idx].read = read
  save()
  return true
}

export function deleteMessage(id: number) {
  const idx = messages.value.findIndex((m) => m.id === id)
  if (idx === -1) return false
  messages.value.splice(idx, 1)
  save()
  return true
}

export function resetMessages() {
  messages.value = []
  save()
}

export function useContacts() {
  return {
    messages,
    addMessage,
    markRead,
    deleteMessage,
    resetMessages
  }
}
