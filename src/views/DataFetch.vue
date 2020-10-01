<template>
  <v-container>
    <v-dialog v-model="loading" persistent width="300">
      <v-card color="primary" dark>
        <v-card-text v-if="!error">
          Loading your data
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
        <v-alert v-else border="left" type="error" dismissible
          >Something went wrong while loading your data. Close this alert to
          retry.</v-alert
        >
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import Vue from 'vue';
import { mapMutations, mapGetters } from 'vuex';
import { register } from 'register-service-worker';
import * as firebase from 'firebase/app';
import 'firebase/messaging';

export default {
  name: 'DummyView',
  data: () => ({
    loading: true,
    redirect: null,
    error: false
  }),

  computed: {
    ...mapGetters([
      'isStaff',
      'userDataFetched',
      'fcmToken',
      'notificationTray',
      'newTransaction'
    ])
  },

  methods: {
    ...mapMutations(['SET_FCM_TOKEN', 'PUSH_NEW_NOTIFICATION']),

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

    if (process.env.NODE_ENV !== 'production') {
      console.log('Development mode, skip service worker registration');
      return;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission is denied.');
      return;
    }

    // Fetch FCM config then register service worker
    console.log('Production environment, configure fcm');
    const firebaseConfig = {
      apiKey: process.env.VUE_APP_FCM_APIKEY,
      authDomain: process.env.VUE_APP_FCM_AUTHDOMAIN,
      databaseURL: process.env.VUE_APP_FCM_DATABASEURL,
      projectId: process.env.VUE_APP_FCM_PROJECTID,
      storageBucket: process.env.VUE_APP_FCM_STORAGEBUCKET,
      messagingSenderId: process.env.VUE_APP_FCM_MESSAGINGSENDERID,
      appId: process.env.VUE_APP_FCM_APPID
    };
    firebase.initializeApp(firebaseConfig);
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

    // Request for token
    this.$messaging
      .requestPermission()
      .then(() => {
        console.log('Permission granted!');
        return this.$messaging.getToken();
      })
      .then(token => {
        console.log('Persisting FCM token: ', token);
        this.$http
          .post('/fcm/api/fcmdevices/', { token })
          .then(resp => {
            console.log(resp);
            this.SET_FCM_TOKEN(resp.data);
            console.log(this.fcmToken);
          })
          .catch(err => console.log(err));
      })
      .catch(err => {
        this.SET_FCM_TOKEN({});
        console.log('Permission denied', err);
      });

    this.$messaging.onMessage(payload => {
      // What happens when a notification should be done here
      console.log('onMessage', payload);
      if (payload.data) {
        this.PUSH_NEW_NOTIFICATION(payload.data);
        console.log(this.notificationTray);
        console.log('New transaction', this.newTransaction);

        // Show notification
        const { title, body, icon } = payload.notification;
        new Notification(title, { body, icon, vibrate: [200, 100, 200] });
      }
    });
  }
};
</script>

<style></style>
