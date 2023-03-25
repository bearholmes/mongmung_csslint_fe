import Vue from 'vue';
import App from './App.vue';
import router from './router/index.js';
import './assets/base.css';

new Vue({
  render: (h) => h(App),
  router,
}).$mount('#app');
