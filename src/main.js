import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from '@/store/store';
import vuetify from './plugins/vuetify';
import { axios } from '@/assets/scripts/api.service.js';

Vue.prototype.$http = axios;
const token = localStorage.getItem('token');
if (token) {
  Vue.prototype.$http.defaults.headers.common['Authorization'] =
    'Token ' + token;
}

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app');
