<template>
  <v-app>
    <Navbar />
    <v-content background="#cbf3f0">
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Navbar from '@/components/Navbar';
export default {
  name: 'App',
  components: { Navbar },
  data() {
    return {
      transactions: []
    };
  }
};
</script>
