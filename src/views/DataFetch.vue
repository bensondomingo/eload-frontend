<template>
  <v-container>
    <v-dialog v-model="loading" persistent width="300">
      <v-card color="primary" dark>
        <v-card-text v-if="!error">
          Loading your data
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
        <v-alert
          v-else
          border="left"
          type="error"
          dismissible
        >Something went wrong while loading your data. Close this alert to retry.</v-alert>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'DummyView',
  data: () => ({
    loading: true,
    redirect: null,
    error: false
  }),

  computed: {
    ...mapGetters(['isStaff', 'userDataFetched'])
  },

  methods: {
    routerPush() {
      this.loading = false;
      this.$router.replace({ path: this.redirect || 'home' });
    }
  },

  created() {
    this.loading = true;
    this.redirect = this.$router.currentRoute.query.redirect;

    this.$store
      .dispatch('fetchUser')
      .then(userObj => {
        console.log(userObj);
        // 2. If staff, fetch retailers
        if (this.isStaff) {
          this.$store
            .dispatch('fetchRetailers')
            .then(retailers => {
              console.log(retailers);
              // this.routerPush();
              this.routerPush();
            })
            .catch(err => console.log(err));
        } else this.routerPush();
      })
      .catch(err => {
        console.log(err);
        if (err.response) {
          if (err.response.status === 401) {
            this.$store.commit('auth_signout');
            this.$store.commit('reset_state');
            localStorage.setItem('token', '');
            this.$http.defaults.headers.common['Authorization'] = '';
            this.$router.push({ name: 'login' });
          } else {
            console.log(err.response);
          }
        } else {
          this.loading = false;
          this.error = true;
        }
      });
  }
};
</script>

<style>
</style>