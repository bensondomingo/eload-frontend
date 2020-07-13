<template>
  <v-container>
    <h1 class="display-1">dummy page -- {{ $router.currentRoute.name}}</h1>
    <v-progress-circular :size="70" :width="7" color="purple" v-if="loading" indeterminate></v-progress-circular>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'DummyView',
  data: () => ({
    loading: true,
    redirect: null
  }),

  computed: {
    ...mapGetters(['isStaff', 'userDataFetched'])
  },

  methods: {
    routerPush() {
      this.loading = false;
      this.$router.push({ path: this.redirect });
    }
  },

  created() {
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
              this.routerPush();
            })
            .catch(err => console.log(err));
        } else this.routerPush();
      })
      .catch(err => {
        console.log(err);
      });
  },

  _created() {
    const redirect = this.$router.currentRoute.query.redirect;
    const currentPath = this.$router.currentRoute.path;

    console.log(redirect);
    console.log(currentPath);
    this.redirect = currentPath == redirect ? null : redirect;

    if (this.userDataFetched) {
      this.routerPush();
      return;
    }
    // 1. Fetch User data
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
              this.routerPush();
            })
            .catch(err => console.log(err));
        } else this.routerPush();
      })
      .catch(err => {
        console.log(err);
      });
  }
  // beforeRouteEnter(to, from, next) {}
};
</script>

<style>
</style>