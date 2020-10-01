<template>
  <v-app v-scroll="onScroll">
    <Navbar @logout="logout" />
    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
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
      showLogin: false,
      pageBottom: true
    };
  },

  methods: {
    onScroll() {
      const bottom =
        window.pageYOffset + window.innerHeight >=
        document.documentElement.offsetHeight - 10;

      if (this.pageBottom != bottom) {
        this.pageBottom = bottom;
        this.$store.commit('scrolledToBottom', bottom);
      }
    },

    logout() {
      this.$store
        .dispatch('logout')
        .then(resp => {
          console.log(resp);
          this.$store.commit('reset_state');
          console.log(this.$store.getters.isAuthenticated);
          this.$http.defaults.headers.common['Authorization'] = '';
          this.$router.push({ name: 'login' });
        })
        .catch(err => {
          console.log(
            err,
            'Request cannot be performed right now. Please check your network connection.'
          );
        });

      // Delete FCM token before logging out
      // const fcmToken = this.$store.getters.fcmToken;
      // console.log('Deleting FCM Token ', fcmToken);
      // this.$messaging
      //   .deleteToken(fcmToken.token)
      //   .then(resp => {
      //     console.log(resp);
      //     this.$http
      //       .delete(`/fcm/api/fcmdevices/${fcmToken.id}/`)
      //       .then(resp => {
      //         console.log(resp);
      //         this.$store.commit('SET_FCM_CONFIG', '');
      //       })
      //       .catch(err => console.log(err));
      //   })
      //   .catch(err => console.log(err));
    }
  }
};
</script>
