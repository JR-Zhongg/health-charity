<template>
  <header class="navbar" role="navigation" aria-label="main navigation">
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

    <nav id="main-menu" class="menu" :class="{ open: isOpen }">
      <div class="nav-left">
        <RouterLink to="/" class="nav-link" @click="closeIfMobile">Home</RouterLink>
        <RouterLink to="/resources" class="nav-link" @click="closeIfMobile">Health Resources</RouterLink>
        <RouterLink to="/resources-table" class="nav-link" @click="closeIfMobile">Resources Table</RouterLink>
        <RouterLink to="/community" class="nav-link" @click="closeIfMobile">Community Forum</RouterLink>
        <RouterLink to="/contact" class="nav-link" @click="closeIfMobile">Contact & Support</RouterLink>
        <RouterLink to="/map" class="nav-link" @click="closeIfMobile">Map</RouterLink>
        <RouterLink to="/booking" class="nav-link" @click="closeIfMobile">Booking</RouterLink>
        <RouterLink to="/admin/contact-form" class="nav-link" @click="closeIfMobile">Send Email</RouterLink>
      </div>

      <div class="nav-right">
        <!-- ✅ 1. Add the online status indicator -->
        <div
          class="online-status"
          :class="{ online: isOnline }"
          :title="isOnline ? 'You are online' : 'You are offline. Some features may be limited.'"
          aria-label="Network Status"
        ></div>

        <template v-if="isAuthenticated">
          <span class="welcome">Hi, {{ displayName }}</span>

          <template v-if="isAdmin">
            <!-- Admin Dropdown -->
            <details class="dropdown" @toggle="closeIfMobile">
              <summary class="nav-link">Admin Panel ▾</summary>
              <div class="dropdown-menu">
                <RouterLink to="/admin" class="dropdown-item" @click="closeIfMobile">Dashboard</RouterLink>
                <RouterLink to="/admin/resources" class="dropdown-item" @click="closeIfMobile">Manage Resources</RouterLink>
                <RouterLink to="/admin/contacts" class="dropdown-item" @click="closeIfMobile">Messages</RouterLink>
                <RouterLink to="/admin/contact-form" class="dropdown-item" @click="closeIfMobile">Send Email</RouterLink>
                <RouterLink to="/admin/simple-table" class="dropdown-item" @click="closeIfMobile">Simple Table</RouterLink>
              </div>
            </details>
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
import { useAuth } from '../composables/useAuth' // ✅ FIX: Use relative path
import { useOnlineStatus } from '../composables/useOnlineStatus' // ✅ 2. Import useOnlineStatus

const router = useRouter()
const { isAuthenticated, displayName, role, logout } = useAuth()
const { isOnline } = useOnlineStatus() // ✅ 3. Get the online status

const isAdmin = computed(() => role.value === 'admin')
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
  cursor: pointer;
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

/* ✅ 4. Add styles for the online status indicator */
.online-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #d1d5db; /* Gray for offline */
  transition: background-color 0.3s ease;
  margin-right: -8px; /* Adjust spacing */
}
.online-status.online {
  background-color: #22c55e; /* Green for online */
}

/* dropdown */
.dropdown {
  position: relative;
}
.dropdown summary {
  list-style: none;
  cursor: pointer;
}
.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 0;
  z-index: 999;
  min-width: 200px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.dropdown[open] .dropdown-menu {
  display: block;
}
.dropdown-item {
  display: block;
  padding: 8px 16px;
  text-decoration: none;
  color: var(--nav-text);
}
.dropdown-item:hover {
  background: #f8f8f8;
}

/* 小屏适配 */
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
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .nav-link {
    display: block;
    width: 100%;
    padding: 0.25rem 0;
  }

  .dropdown {
    width: 100%;
  }

  .dropdown-menu {
    position: static;
    box-shadow: none;
    border: none;
    padding: 0;
  }

  .dropdown-item {
    padding: 0.5rem 0;
  }
}
</style>
