import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 视图页面
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
import AdminContactsView from '../views/AdminContactsView.vue'
import ContactForm from '../views/ContactForm.vue'
import ResourcesTableView from '../views/ResourcesTableView.vue'
import AdminSimpleTableView from '../views/AdminSimpleTableView.vue'
import MapView from '../views/MapView.vue'
import BookingView from '../views/BookingView.vue';

// 类型支持
import type { Role } from '../composables/useAuth'
import { useAuth } from '../composables/useAuth'

// 为 RouteMeta 增强类型（添加类型支持）
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: Role[]
    guestOnly?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/map', name: 'map', component: MapView },

  { path: '/resources', name: 'resources', component: HealthResourcesView },
  { path: '/community', name: 'community', component: CommunityView },
  { path: '/contact', name: 'contact', component: ContactView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/carer-support', name: 'carer-support', component: CarerSupportView },

  // ✅ D.3 用户可访问表格
  {
    path: '/resources-table',
    name: 'resources-table',
    component: ResourcesTableView,
    meta: { requiresAuth: false }
  },

  // ✅ D.3 管理员表格（简化版本）
  {
    path: '/admin/simple-table',
    name: 'admin-simple-table',
    component: AdminSimpleTableView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },

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
  {
    path: '/admin/contact-form',
    name: 'admin-contact-form',
    component: ContactForm,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/booking',
    name: 'booking',
    component: BookingView,
    meta: { requiresAuth: true } // 只有登录用户才能访问
  },

  // fallback
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 登录状态守卫
router.beforeEach(async (to) => {
  const { authReady, waitForAuthReady, isAuthenticated, hasAnyRole } = useAuth()

  if (!authReady.value) {
    await waitForAuthReady()
  }

  if (to.meta.guestOnly && isAuthenticated.value) {
    return { name: 'home' }
  }

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.roles && to.meta.roles.length > 0) {
    if (!hasAnyRole(to.meta.roles as Role[])) {
      return { name: 'home' }
    }
  }

  return true
})

export default router
