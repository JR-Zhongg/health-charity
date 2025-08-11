<template>
  <div class="container-wide">
    <h1>Admin Dashboard</h1>
    <p>Only admins can see this page.</p>

    <section class="box">
      <h2>Users</h2>
      <!-- 
        这里暂时显示一条提示信息。
        获取所有用户列表需要后端功能（如 Firebase Cloud Functions）支持。  
      -->
      <p>User list functionality requires a backend implementation.</p>
      <!-- 
        如果你未来实现了获取用户列表的功能，可以取消下面的注释
        <ul>
          <li v-for="u in users" :key="u.uid">
            <strong>{{ u.displayName || u.email }}</strong> — {{ u.email }} (Role: {{ u.role }})
          </li>
        </ul>
      -->
    </section>
  </div>
</template>

<script setup lang="ts">
// useAuth composable 不提供所有用户的列表，所以我们不再从这里获取 users
// import { useAuth } from '../composables/useAuth'
// const { users } = useAuth() 
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
