<template>
  <v-container>
    <v-row dense>
      <v-col cols="12">
        <v-card flat :loading="loading">
          <v-card-title class="headline justify-center">Login</v-card-title>
          <v-card-text>
            <v-container v-if="nonFieldErrors ? !!nonFieldErrors.length : false">
              <v-row dense>
                <v-col v-for="(err, index) in nonFieldErrors" :key="index" cols="12">
                  <v-alert type="error">{{ err }}</v-alert>
                </v-col>
              </v-row>
            </v-container>
            <v-form ref="loginForm" v-model="isLoginFormValid">
              <v-text-field
                v-model="username"
                label="Username"
                prepend-inner-icon="mdi-account-circle"
                :rules="userNameRules"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                prepend-inner-icon="mdi-shield-key"
                :rules="passwordRules"
                required
                @keyup.enter="onSubmit"
              ></v-text-field>
            </v-form>
            <v-btn
              type="submit"
              color="primary"
              class="mt-2"
              @click="onSubmit"
              block
              depressed
              rounded
            >Submit</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Login',
  data: () => ({
    dialog: false,
    isLoginFormValid: false,
    username: '',
    password: '',
    isCredentialsValid: false,
    nonFieldErrors: [],
    loading: false
  }),
  computed: {
    userNameRules() {
      const rules = [];
      const required = v => !!v || 'Username is required';
      rules.push(required);
      return rules;
    },
    passwordRules() {
      const rules = [];
      const required = v => !!v || 'Password is required';
      rules.push(required);
      return rules;
    }
  },
  methods: {
    onSubmit() {
      this.loading = 'primary';
      this.nonFieldErrors = [];
      if (!this.$refs.loginForm.validate()) {
        return;
      }

      this.$store
        .dispatch('login', {
          username: this.username,
          password: this.password
        })
        .then(token => {
          // Login successful
          this.isLoginFormValid = true;
          this.isCredentialsValid = true;
          localStorage.setItem('token', token);
          this.$http.defaults.headers.common['Authorization'] =
            'Token ' + token;

          const redirect = this.$router.currentRoute.query.redirect
            ? this.$router.currentRoute.query.redirect
            : '/home';

          if (this.$store.getters.userDataFetch) {
            this.$router.push({ path: redirect });
          } else {
            this.$router.push({ name: 'datafetch', query: { redirect } });
          }
        })
        .catch(err => {
          // Login failed
          this.isLoginFormValid = true;
          this.isCredentialsValid = true;
          this.nonFieldErrors = err;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onLoginExit() {
      this.$refs.loginForm.reset();
      this.$emit('exit');
    }
  },
  created() {
    if (this.$store.getters.isAuthenticated) {
      this.$router.replace({ name: 'datafetch' });
    }
  }
};
</script>

<style>
</style>
