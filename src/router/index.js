import Vue from 'vue';
import VueRouter from 'vue-router';
import Landing from '@/views/Landing.vue';
import DataFetch from '@/views/DataFetch.vue';
import Home from '@/views/Home.vue';
import Dashboard from '@/views/Dashboard.vue';
import Profile from '@/views/Profile.vue';
import Login from '@/views/Login.vue';
import Products from '@/views/Products.vue';
import NotFound from '@/views/404NotFound.vue';

import store from '@/store/store.js';

Vue.use(VueRouter);
const routes = [
  {
    path: '',
    name: 'landing',
    component: Landing
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    // component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
    meta: {
      requiresAuth: true,
      requireUserData: true
    }
  },
  {
    path: '/datafetch',
    name: 'datafetch',
    component: DataFetch,
    meta: {
      requiresAuth: true,
      requireUserData: false
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    // component: () =>
    //   import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      requireUserData: true
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    // component: () =>
    //   import(/* webpackChunkName: "profile" */ '@/views/Profile.vue'),
    meta: {
      requiresAuth: true,
      requireUserData: true
    }
  },
  {
    path: '/auth/login',
    name: 'login',
    component: Login
    // component: () => import(/* webpackChunkName: "login" */ '@/views/Login.vue')
  },
  {
    path: '/minda/products',
    name: 'products',
    component: Products
    // component: () =>
    //   import(/* webpackChunkName: "login" */ '@/views/Products.vue')
  },
  {
    path: '*',
    name: 'notFound',
    component: NotFound
    // component: () =>
    //   import(/* webpackChunkName: "notfound" */ '@/views/404NotFound.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes
});

router.beforeEach((to, from, next) => {
  console.log(from);
  console.log(to);

  const isAuthenticated = store.getters.isAuthenticated;
  const userDataFetched = store.getters.userDataFetched;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requireUserData = to.matched.some(
    record => record.meta.requireUserData
  );

  console.log('authenticated: ', isAuthenticated);
  console.log(('userDataFetched: ', userDataFetched));

  if (requiresAuth && requireUserData) {
    // Profile, Dashboard
    if (isAuthenticated && userDataFetched) {
      next();
    } else if (isAuthenticated && !userDataFetched) {
      next({ name: 'datafetch', query: { redirect: to.fullPath } });
    } else {
      next({ name: 'login', query: { redirect: to.fullPath } });
    }
  } else if (requiresAuth) {
    // DataFetch
    if (isAuthenticated) {
      next();
    } else {
      next({ name: 'login', query: { redirect: to.fullPath } });
    }
  } else {
    next();
  }
});

export default router;
