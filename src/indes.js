import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import HealthResourcesView from '../views/HealthResourcesView.vue';
import CommunityView from '../views/CommunityView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/resources', name: 'resources', component: HealthResourcesView },
  { path: '/community', name: 'community', component: CommunityView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
