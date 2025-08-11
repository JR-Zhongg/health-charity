import { ref, computed } from 'vue'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FbUser,
} from 'firebase/auth'
import { auth } from '@/services/firebase'

export type Role = 'user' | 'admin'

// 这里放你的管理员邮箱白名单（演示用；严肃项目请用 custom claims）
const ADMIN_EMAILS = new Set<string>(['admin@demo.com'])

/** ---- 全局状态 ---- */
const currentUser = ref<FbUser | null>(null)
const authReady = ref(false)

// 等待 auth 初始化的等待队列
let waiters: Array<() => void> = []

export function waitForAuthReady(): Promise<void> {
  if (authReady.value) return Promise.resolve()
  return new Promise<void>((resolve) => {
    waiters.push(resolve)
  })
}

// 模块级单例监听：文件被首次导入时立即注册监听（不要放 onMounted）
onAuthStateChanged(auth, (u) => {
  currentUser.value = u
  if (!authReady.value) {
    authReady.value = true
    // 唤醒首屏等待
    waiters.forEach((fn) => fn())
    waiters = []
  }
})

/** ---- 计算属性 / 权限判断 ---- */
const isAuthenticated = computed(() => !!currentUser.value)
const displayName = computed(() => currentUser.value?.displayName || currentUser.value?.email || '')
const role = computed<Role>(() => {
  const email = currentUser.value?.email?.toLowerCase()
  return email && ADMIN_EMAILS.has(email) ? 'admin' : 'user'
})
function hasRole(r: Role) {
  return role.value === r
}
function hasAnyRole(roles: Role[]) {
  return roles.includes(role.value)
}

/** ---- 操作 API ---- */
async function register(email: string, password: string, name?: string) {
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(email)) throw new Error('Email format is invalid.')
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.')

  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (name && name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
  return cred.user
}

async function login(email: string, password: string) {
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(email)) throw new Error('Email format is invalid.')
  if (!password) throw new Error('Password is required.')
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

async function logout() {
  await signOut(auth)
}

/** 可选：拿 ID Token 给云函数/后端用 */
async function getIdToken(forceRefresh = false) {
  const u = currentUser.value
  if (!u) return null
  return await u.getIdToken(forceRefresh)
}

export function useAuth() {
  return {
    // state
    currentUser,
    isAuthenticated,
    displayName,
    role,
    authReady,

    // guards
    hasRole,
    hasAnyRole,
    waitForAuthReady,

    // actions
    register,
    login,
    logout,
    getIdToken,
  }
}
