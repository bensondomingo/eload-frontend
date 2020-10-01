<template>
  <v-container>
    <h1 class="display-1">Landing Page</h1>
  </v-container>
</template>

<script>
import store from '@/store/store.js';
export default {
  name: 'Landing',

  beforeRouteEnter(to, from, next) {
    if (store.getters.isAuthenticated) next({ name: 'dashboard' });
    else next();
  }
};
</script>

<style></style>
