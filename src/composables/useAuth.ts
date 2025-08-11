// src/composables/useAuth.ts
import { ref, computed } from 'vue'

export type Role = 'user' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  password: string // 课堂作业用纯文本即可；真实项目请使用哈希
  role: Role
}

interface RegisterPayload {
  name: string
  email: string
  password: string
  role?: Role
}

interface LoginPayload {
  email: string
  password: string
}

const STORAGE_USERS = 'hc_users'
const STORAGE_CURRENT = 'hc_current_user'

const users = ref<User[]>(loadUsers())
const currentUser = ref<User | null>(loadCurrent())

// 如果没有任何用户，则创建一个默认 admin
if (users.value.length === 0) {
  users.value.push({
    id: Date.now(),
    name: 'Admin',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin'
  })
  saveUsers()
}

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
function saveUsers() {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users.value))
}
function loadCurrent(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
function saveCurrent() {
  if (currentUser.value) {
    localStorage.setItem(STORAGE_CURRENT, JSON.stringify(currentUser.value))
  } else {
    localStorage.removeItem(STORAGE_CURRENT)
  }
}

// ------- validators -------
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateRegister(p: RegisterPayload) {
  const errors: string[] = []
  if (!p.name?.trim()) errors.push('Name is required.')
  if (!p.email?.trim()) errors.push('Email is required.')
  else if (!emailRe.test(p.email)) errors.push('Email format is invalid.')
  if (!p.password || p.password.length < 6) errors.push('Password must be at least 6 characters.')
  if (users.value.some(u => u.email === p.email)) errors.push('Email is already registered.')
  return errors
}

function validateLogin(p: LoginPayload) {
  const errors: string[] = []
  if (!p.email?.trim()) errors.push('Email is required.')
  else if (!emailRe.test(p.email)) errors.push('Email format is invalid.')
  if (!p.password) errors.push('Password is required.')
  return errors
}

// ------- API -------
function register(payload: RegisterPayload) {
  const errors = validateRegister(payload)
  if (errors.length) {
    return { success: false, errors }
  }

  const user: User = {
    id: Date.now(),
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password, // demo 用明文
    role: payload.role ?? 'user'
  }

  users.value.push(user)
  saveUsers()
  return { success: true, user }
}

function login(payload: LoginPayload) {
  const errors = validateLogin(payload)
  if (errors.length) {
    return { success: false, errors }
  }
  const email = payload.email.trim().toLowerCase()
  const user = users.value.find(u => u.email === email && u.password === payload.password)
  if (!user) {
    return { success: false, errors: ['Email or password is incorrect.'] }
  }
  currentUser.value = user
  saveCurrent()
  return { success: true, user }
}

function logout() {
  currentUser.value = null
  saveCurrent()
}

const isAuthenticated = computed(() => !!currentUser.value)

function hasRole(role: Role) {
  return currentUser.value?.role === role
}

function hasAnyRole(roles: Role[]) {
  if (!currentUser.value) return false
  return roles.includes(currentUser.value.role)
}

export function useAuth() {
  return {
    users,
    currentUser,
    isAuthenticated,
    register,
    login,
    logout,
    hasRole,
    hasAnyRole,
  }
}
