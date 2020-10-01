<template>
  <v-card>
    <v-card-title class="headline">
      Login
      <v-spacer></v-spacer>
      <v-btn text icon @click="onLoginExit">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-form ref="loginForm" v-model="isLoginFormValid" lazy-validation>
        <v-text-field
          v-model="username"
          label="Username"
          prepend-inner-icon="mdi-account-circle"
          :rules="userNameRules"
          @click="onFieldClick"
          required
        ></v-text-field>
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          prepend-inner-icon="mdi-form-textbox-password"
          :rules="passwordRules"
          @click="onFieldClick"
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
        >Submit</v-btn
      >
    </v-card-text>
  </v-card>
</template>

<script>
import { axios } from '@/assets/scripts/api.service.js';

export default {
  name: 'LoginForm',
  data: () => ({
    dialog: false,
    isLoginFormValid: false,
    username: '',
    password: '',
    isCredentialsValid: false,
    nonFieldErrors: []
  }),
  computed: {
    ruleFuncFactory() {
      return this.nonFieldErrors.map(err => () => err);
    },
    userNameRules() {
      const rules = [];
      const required = v => !!v || 'Username is required';
      rules.push(required, ...this.ruleFuncFactory);
      return rules;
    },
    passwordRules() {
      const rules = [];
      const required = v => !!v || 'Password is required';
      rules.push(required, ...this.ruleFuncFactory);
      return rules;
    }
  },
  methods: {
    onFieldClick() {
      console.log(event.target);
      this.$refs.loginForm.validate();
    },
    onSubmit: async function() {
      if (!this.$refs.loginForm.validate()) {
        return;
      }
      try {
        const response = await axios.post('/auth/api/login/', {
          username: this.username,
          password: this.password
        });
        console.log(response.data);
        console.log(response.status);
        this.isLoginFormValid = true;
        this.isCredentialsValid = true;
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          this.nonFieldErrors = error.response.data.non_field_errors;
          this.isCredentialsValid = false;
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
        this.isLoginFormValid = false;
        this.$refs.loginForm.validate();
        return;
      }
    },
    onLoginExit() {
      this.$refs.loginForm.reset();
      this.$emit('exit');
    }
  }
};
</script>

<style></style>
