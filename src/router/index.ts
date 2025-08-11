import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 视图
import HomeView from '../views/HomeView.vue'
import HealthResourcesView from '../views/HealthResourcesView.vue'
import CommunityView from '../views/CommunityView.vue'
import ContactView from '../views/ContactView.vue'
import AboutView from '../views/AboutView.vue'
import CarerSupportView from '../views/CarerSupportView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import AdminResourcesView from '../views/AdminResourcesView.vue'
import AdminContactsView from '../views/AdminContactsView.vue' // 👈 新增

// 类型
import type { Role } from '../composables/useAuth'
import { useAuth } from '../composables/useAuth'

// 为 RouteMeta 增强类型
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: Role[]
    guestOnly?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },

  { path: '/resources', name: 'resources', component: HealthResourcesView },
  { path: '/community', name: 'community', component: CommunityView },
  { path: '/contact', name: 'contact', component: ContactView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/carer-support', name: 'carer-support', component: CarerSupportView },

  // Auth
  { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },

  // Admin only
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboardView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/resources',
    name: 'admin-resources',
    component: AdminResourcesView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/contacts',
    name: 'admin-contacts',
    component: AdminContactsView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },

  // 404 -> 重定向首页（可改成自定义 404 页）
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 返回式守卫（无需 next，ESLint 更友好）
router.beforeEach((to) => {
  const { isAuthenticated, hasAnyRole } = useAuth()

  // 访客专用（login/register），已登录则回首页
  if (to.meta.guestOnly && isAuthenticated.value) {
    return { name: 'home' }
  }

  // 需要登录
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 需要特定角色
  if (to.meta.roles && to.meta.roles.length > 0) {
    const roles = to.meta.roles as Role[]
    if (!hasAnyRole(roles)) {
      return { name: 'home' }
    }
  }

  return true
})

export default router
