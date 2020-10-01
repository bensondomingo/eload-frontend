<template>
  <v-container>
    <h1 class="display-1">Profile</h1>
    <ul>
      <li v-for="(value, key) in user" :key="key">{{ value }}</li>
    </ul>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'Profile',
  data: () => ({}),
  computed: {
    ...mapGetters(['user'])
  }
};
</script>

<style></style>
