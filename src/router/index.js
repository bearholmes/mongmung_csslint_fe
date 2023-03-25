import Vue from 'vue';
import VueRouter from 'vue-router';
import Top from '../views/Top.vue';
import NotFound from '../views/NotFound.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'top',
    component: Top,
  },
  {
    path: '*',
    template: '',
    component: NotFound,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes,
});

export default router;
