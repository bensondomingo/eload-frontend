<template>
  <v-app v-scroll="onScroll">
    <Navbar @logout="logout" />
    <v-main>
      <v-container>
        <transition name="scroll-x-reverse-transition">
          <router-view></router-view>
        </transition>
        <v-snackbar
          v-model="snackbar"
          :color="notification.status.toLocaleLowerCase()"
          timeout="10000"
          class="pb-16"
        >
          {{ notification.title }}
          <template v-slot:action="{ attrs }">
            <v-btn v-bind="attrs" @click="snackbar = false" icon>
              <v-icon v-if="notification.status == 'SUCCESS'"
                >mdi-checkbox-marked-circle</v-icon
              >
              <v-icon v-else>mdi-alert-circle-outline</v-icon>
            </v-btn>
          </template>
        </v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Navbar from '@/components/Navbar';
import { mapGetters } from 'vuex';

export default {
  name: 'App',
  components: { Navbar },
  data() {
    return {
      transactions: [],
      showLogin: false,
      pageBottom: true,
      snackbar: false,
      notification: {
        title: '',
        status: 'SUCCESS'
      }
    };
  },

  computed: {
    ...mapGetters(['notificationTray'])
  },

  watch: {
    notificationTray(newValue) {
      // notificationTray is an array
      console.log('notificationTray ', this.notificationTray);
      if (!newValue.length) return;
      const newNotification = newValue.slice('-1').pop();
      this.notification = {
        title: newNotification.notification.title,
        status: newNotification.data.notification_status
      };
      this.snackbar = true;
    }
  },

  methods: {
    onScroll() {
      const bottom =
        window.pageYOffset + window.innerHeight >=
        document.documentElement.offsetHeight - 40;

      if (this.pageBottom != bottom) {
        this.pageBottom = bottom;
        this.$store.commit('scrolledToBottom', bottom);
      }
    },

    logout() {
      if (process.env.NODE_ENV === 'production') {
        // Production mode includes deleting fcmToken as part of logging out process
        const token = this.$store.getters.fcmToken;
        this.$messaging
          .deleteToken(token.token)
          .then(resp => {
            console.log('Token delete successful? ', resp);
            console.log('Deleting FCM token from db ...');
            this.$http
              .delete(`/fcm/api/fcmdevices/${token.id}/`)
              .then(resp => {
                console.log('Token ', token.token, ' successfully deleted');
                console.log(resp);

                // Log out user
                console.log('Loging out user ...');
                this.$store
                  .dispatch('logout')
                  .then(resp => {
                    console.log(resp);
                    this.$store.commit('reset_state');
                    console.log(this.$store.getters.isAuthenticated);
                    document.cookie = '';
                    this.$http.defaults.headers.common['Authorization'] = '';
                    this.$router.push({ name: 'login' });
                    console.log('Successful logout!');
                  })
                  .catch(err => {
                    console.log(
                      err,
                      'Request cannot be performed right now. Please check your network connection.'
                    );
                  });
              })
              .catch(err => {
                console.log(
                  'Something went wrong while trying to delete token ',
                  token.token
                );
                console.log(err);
              });
          })
          .catch(err => console.log(err));
      } else {
        // Log out user
        console.log('Loging out user ...');
        this.$store
          .dispatch('logout')
          .then(resp => {
            console.log(resp);
            this.$store.commit('reset_state');
            console.log(this.$store.getters.isAuthenticated);
            document.cookie = '';
            this.$http.defaults.headers.common['Authorization'] = '';
            this.$router.push({ name: 'login' });
            console.log('Successful logout!');
          })
          .catch(err => {
            console.log(
              err,
              'Request cannot be performed right now. Please check your network connection.'
            );
          });
      }
    }
  }
};
</script>
