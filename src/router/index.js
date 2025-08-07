import { createRouter, createWebHistory } from 'vue-router';
import UrlManagement from '../views/UrlManagement.vue';

const routes = [
  {
    path: '/',
    name: 'UrlManagement',
    component: UrlManagement,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
