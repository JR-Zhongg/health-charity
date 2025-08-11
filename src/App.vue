<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <Navbar />
  <main class="main-content">
    <RouterView />
  </main>
  <Footer />
</template>

<style scoped>
.main-content {
  min-height: calc(100vh - 120px);
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
