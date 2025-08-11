<template>
  <header class="navbar" role="navigation" aria-label="main navigation">
    <!-- 仅保留汉堡按钮（小屏显示） -->
    <button
      class="hamburger"
      :class="{ active: isOpen }"
      @click="toggle()"
      aria-label="Toggle navigation"
      :aria-expanded="isOpen"
      aria-controls="main-menu"
    >
      <span></span><span></span><span></span>
    </button>

    <!-- 菜单（大屏横向，小屏折叠纵向） -->
    <nav
      id="main-menu"
      class="menu"
      :class="{ open: isOpen }"
    >
      <div class="nav-left">
        <RouterLink to="/" class="nav-link" @click="closeIfMobile">Home</RouterLink>
        <RouterLink to="/resources" class="nav-link" @click="closeIfMobile">Health Resources</RouterLink>
        <RouterLink to="/community" class="nav-link" @click="closeIfMobile">Community Forum</RouterLink>
        <RouterLink to="/contact" class="nav-link" @click="closeIfMobile">Contact & Support</RouterLink>
        <RouterLink to="/about" class="nav-link" @click="closeIfMobile">About Us</RouterLink>
        <RouterLink to="/carer-support" class="nav-link" @click="closeIfMobile">Carer Support</RouterLink>
      </div>

      <div class="nav-right">
        <template v-if="isAuthenticated">
          <span class="welcome">Hi, {{ currentUser?.name }}</span>

          <template v-if="isAdmin">
            <RouterLink to="/admin" class="nav-link" @click="closeIfMobile">Admin</RouterLink>
            <RouterLink to="/admin/resources" class="nav-link" @click="closeIfMobile">Manage Resources</RouterLink>
            <RouterLink to="/admin/contacts" class="nav-link" @click="closeIfMobile">Messages</RouterLink>
          </template>

          <button class="logout" @click="onLogout">Logout</button>
        </template>

        <template v-else>
          <RouterLink to="/login" class="nav-link" @click="closeIfMobile">Login</RouterLink>
          <RouterLink to="/register" class="nav-link" @click="closeIfMobile">Register</RouterLink>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { currentUser, isAuthenticated, logout } = useAuth()

const isAdmin = computed(() => currentUser.value?.role === 'admin')
const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
function closeIfMobile() {
  if (window.matchMedia('(max-width: 768px)').matches) {
    isOpen.value = false
  }
}
function onLogout() {
  logout()
  router.push('/')
  closeIfMobile()
}
</script>

<style scoped>
:root {
  --nav-height: 80px;
  --nav-font-size: 1.1rem;
  --nav-horizontal-padding: 56px;
  --nav-gap: 1.25rem;

  --nav-bg: #fff;
  --nav-text: #333;
  --nav-text-active: #000;
  --nav-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

/* 容器 */
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;

  width: 100%;
  background: var(--nav-bg);
  box-shadow: var(--nav-shadow);

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--nav-horizontal-padding);
  height: var(--nav-height);
  box-sizing: border-box;
}

/* 汉堡按钮：大屏隐藏，小屏显示 */
.hamburger {
  display: none;
  width: 28px;
  height: 22px;
  position: relative;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}
.hamburger span {
  position: absolute;
  left: 0;
  width: 100%;
  height: 3px;
  background: #111;
  transition: transform 0.2s ease, opacity 0.2s ease, top 0.2s ease;
}
.hamburger span:nth-child(1) { top: 0; }
.hamburger span:nth-child(2) { top: 9px; }
.hamburger span:nth-child(3) { top: 18px; }
.hamburger.active span:nth-child(1) {
  top: 9px;
  transform: rotate(45deg);
}
.hamburger.active span:nth-child(2) {
  opacity: 0;
}
.hamburger.active span:nth-child(3) {
  top: 9px;
  transform: rotate(-45deg);
}

/* 菜单（大屏横向，小屏纵向折叠） */
.menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--nav-gap);
  height: var(--nav-height);
  flex: 1;
}
.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: var(--nav-gap);
  flex-wrap: nowrap;
}
.nav-link {
  text-decoration: none;
  color: var(--nav-text);
  font-weight: 700;
  font-size: var(--nav-font-size);
  white-space: nowrap;
}
.nav-link.router-link-active {
  color: var(--nav-text-active);
}
.welcome {
  font-weight: 600;
  margin-right: 8px;
  white-space: nowrap;
}
.logout {
  border: none;
  background: transparent;
  color: #c00;
  font-weight: 700;
  cursor: pointer;
}

/* ====== 小屏样式 ====== */
@media (max-width: 768px) {
  :root {
    --nav-height: 60px;
    --nav-font-size: 1rem;
    --nav-horizontal-padding: 16px;
  }

  .navbar {
    flex-direction: column;
    align-items: stretch;
    height: auto;
  }

  .hamburger {
    display: block;
    align-self: flex-end;
    margin: 14px var(--nav-horizontal-padding) 0;
  }

  /* menu 默认隐藏（高度为 auto 时撑开） */
  .menu {
    display: none;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    height: auto;
    padding: 0 var(--nav-horizontal-padding) 12px;
  }
  .menu.open {
    display: flex;
  }

  .nav-left,
  .nav-right {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: .75rem;
    margin-top: .5rem;
  }

  .nav-link {
    display: block;
    width: 100%;
    padding: .25rem 0;
  }
}
</style>
