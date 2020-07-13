<template>
  <v-app>
    <Navbar @logout="logout" />
    <v-content>
      <router-view></router-view>
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
      transactions: [],
      showLogin: false
    };
  },

  methods: {
    logout() {
      this.$store
        .dispatch('logout')
        .then(resp => {
          console.log(resp);
          this.$router.push({ name: 'landing' });
          this.$store.commit('reset_state');
          localStorage.setItem('token', '');
          this.$http.defaults.headers.common['Authorization'] = '';
        })
        .catch(err => {
          console.log(
            err,
            'Request cannot be performed right now. Please check your network connection.'
          );
        });
    }
  }
};
</script>
