<template>
  <div class="container-wide">
    <h1>Admin: Contact Messages</h1>
    <p class="tip">Only admins can access this page.</p>

    <section class="panel">
      <button class="btn-danger" @click="onReset">Delete All Messages</button>
    </section>

    <section class="panel">
      <h2>Messages ({{ messages.length }})</h2>

      <table class="table" v-if="messages.length">
        <thead>
          <tr>
            <th width="60">ID</th>
            <th width="160">Name</th>
            <th width="200">Email</th>
            <th>Message</th>
            <th width="140">Created</th>
            <th width="100">Read</th>
            <th width="130">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in messages" :key="m.id">
            <td>{{ m.id }}</td>
            <td>{{ m.name }}</td>
            <td>{{ m.email }}</td>
            <td class="msg">{{ m.message }}</td>
            <td>{{ formatDate(m.createdAt) }}</td>
            <td>
              <span
                :class="['badge', m.read ? 'badge-green' : 'badge-gray']"
              >
                {{ m.read ? 'Read' : 'Unread' }}
              </span>
            </td>
            <td class="actions-td">
              <button class="link" @click="toggleRead(m)">
                Mark {{ m.read ? 'Unread' : 'Read' }}
              </button>
              <button class="link-danger" @click="onDelete(m.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="empty">No messages.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useContacts, markRead, deleteMessage, resetMessages } from '../composables/useContacts'

const router = useRouter()
const { currentUser, isAuthenticated } = useAuth()
const { messages } = useContacts()

const isAdmin = computed(() => currentUser.value?.role === 'admin')

// 防御性判断（路由守卫已经拦了，这里再兜底）
if (!isAuthenticated.value || !isAdmin.value) {
  router.replace('/')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}

function toggleRead(m: { id: number; read: boolean }) {
  markRead(m.id, !m.read)
}

function onDelete(id: number) {
  if (!confirm('Delete this message?')) return
  deleteMessage(id)
}

function onReset() {
  if (!confirm('Delete ALL messages?')) return
  resetMessages()
}
</script>

<style scoped>
.container-wide {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 80px;
  box-sizing: border-box;
}
.tip {
  color: #777;
  margin-bottom: 1rem;
}
.panel {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e4e4e4;
  border-radius: 6px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}
.table thead tr {
  background: #f7f7f7;
}
.table th,
.table td {
  border: 1px solid #e4e4e4;
  padding: 8px 10px;
  text-align: left;
  vertical-align: top;
}
.msg {
  white-space: pre-wrap;
}
.actions-td {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.link {
  border: none;
  background: transparent;
  color: #0c63e4;
  cursor: pointer;
}
.link-danger {
  border: none;
  background: transparent;
  color: #c00;
  cursor: pointer;
}
.btn-danger {
  padding: 8px 14px;
  background: #c00;
  color: #fff;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.empty {
  text-align: center;
  color: #777;
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
}
.badge-green {
  background: #e6f4ea;
  color: #137333;
}
.badge-gray {
  background: #f1f3f4;
  color: #5f6368;
}
</style>
