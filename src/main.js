import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from '@/store/store';
import vuetify from './plugins/vuetify';
import { axios } from '@/assets/scripts/api.service.js';

import { register } from 'register-service-worker';
import * as firebase from 'firebase/app';
import 'firebase/messaging';

Vue.prototype.$documentTitle = 'LoadNinja';

Vue.prototype.$http = axios;
const token = localStorage.getItem('token');
if (token) {
  Vue.prototype.$http.defaults.headers.common['Authorization'] =
    'Token ' + token;
}

Vue.config.productionTip = false;

if (process.env.NODE_ENV === 'production') {
  const firebaseConfig = {
    apiKey: process.env.VUE_APP_FCM_APIKEY,
    authDomain: process.env.VUE_APP_FCM_AUTHDOMAIN,
    databaseURL: process.env.VUE_APP_FCM_DATABASEURL,
    projectId: process.env.VUE_APP_FCM_PROJECTID,
    storageBucket: process.env.VUE_APP_FCM_STORAGEBUCKET,
    messagingSenderId: process.env.VUE_APP_FCM_MESSAGINGSENDERID,
    appId: process.env.VUE_APP_FCM_APPID
  };
  Vue.prototype.$firebaseApp = firebase.initializeApp(firebaseConfig);
  Vue.prototype.$messaging = firebase.messaging();

  console.log('Registering service worker.');
  register(`${process.env.BASE_URL}firebase-messaging-sw.js`, {
    ready() {
      console.log(
        'firebase-messaging-sw.js service worker successfully registered'
      );
    },
    registered() {
      console.log(
        'firebase-messaging-sw.js service worker has been registered.'
      );
    }
  });
}

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app');
