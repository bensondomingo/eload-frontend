<template>
  <v-container>
    <v-row dense>
      <v-col cols="12">
        <v-card flat>
          <v-card-title class="headline justify-center">Login</v-card-title>
          <v-card-text>
            <v-container :class="{'d-none': !nonFieldErrors.length}">
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
    nonFieldErrors: []
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
            : '/dashboard';

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
        });
    },

    onLoginExit() {
      this.$refs.loginForm.reset();
      this.$emit('exit');
    }
  },
  created() {
    console.log(this.$router);
  }
};
</script>

<style>
</style>
