<template>
  <div class="container-wide">
    <h1>Admin Dashboard</h1>
    <p>Only admins can see this page.</p>

    <section class="box">
      <h2>Users</h2>
      <ul>
        <li v-for="u in users" :key="u.id">
          <strong>{{ u.name }}</strong> — {{ u.email }} ({{ u.role }})
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
const { users } = useAuth()
</script>

<style scoped>
.container-wide {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 20px;
}
.box {
  margin-top: 1rem;
  border: 1px solid #e4e4e4;
  padding: 1rem;
  border-radius: 6px;
  background: #fff;
}
</style>
