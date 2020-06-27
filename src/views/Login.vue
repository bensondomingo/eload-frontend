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
            <v-form ref="loginForm" v-model="isLoginFormValid" lazy-validation>
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
              color="primary"
              class="mt-2"
              @click.stop="onSubmit"
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
    async onSubmit() {
      this.nonFieldErrors = [];
      if (!this.$refs.loginForm.validate()) {
        return;
      }

      this.$store
        .dispatch('login', {
          username: this.username,
          password: this.password
        })
        .then(() => {
          // Login successful
          this.isLoginFormValid = true;
          this.isCredentialsValid = true;
          this.$router.push({ name: 'dashboard' });
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
  }
};
</script>

<style>
</style>
