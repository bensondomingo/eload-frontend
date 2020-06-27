import Vue from 'vue';
import Vuex from 'vuex';

import { axios } from '@/assets/scripts/api.service';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    authStatus: '',
    authDetails: [],
    user: localStorage.getItem('user') || '',
    token: localStorage.getItem('token') || '',
    profiles: [],
    transactions: [],
    summaryCardLoding: false
  },

  getters: {
    isAuthenticated: state => !!state.token,
    profiles: state => state.profiles,
    retailers: state => {
      return state.profiles.map(el => ({
        name: el.user.toUpperCase(),
        deviceHash: el.device_hash
      }));
    },
    ongoingFetch: state => !!state.summaryCardLoding,
    transactions: state => state.transactions
  },

  mutations: {
    clear_store(state) {
      state.user = '';
      state.token = '';
      state.profiles = [];
      state.transactions = [];
      // clear localStorage
      localStorage.setItem('token', '');
      localStorage.setItem('user', '');
      // Delete authorization header
      axios.defaults.headers.common['Authorization'] = '';
    },

    auth_request(state) {
      state.authStatus = 'loading';
      state.authDetails = ['Waiting server to respond'];
    },

    auth_success(state, payload) {
      state.authStatus = 'success';
      state.authDetails = ['Authentication successful'];
      state.user = payload.username;
      if (payload.token) {
        state.token = payload.token;
      }
      // Update localStorage and axios config
      localStorage.setItem('user', payload.username);
      localStorage.setItem('token', payload.token);
      axios.defaults.headers.common['Authorization'] = 'Token ' + payload.token;
    },

    auth_signout(state, message) {
      state.authStatus = 'error';
      if (message instanceof Array) state.authDetails = [...message];
      else state.authDetails = [message];
      state.user = '';
      state.token = '';
      state.transactions = [];
      // clear localStorage
      localStorage.setItem('token', '');
      localStorage.setItem('user', '');
      // Delete authorization header
      axios.defaults.headers.common['Authorization'] = '';
    },

    auth_error(state, errorMsg) {
      state.authStatus = 'error';
      state.authDetails = errorMsg;
      state.user = '';
      state.token = '';
      state.transactions = [];
      // clear localStorage
      localStorage.setItem('token', '');
      localStorage.setItem('user', '');
      // Delete authorization header
      axios.defaults.headers.common['Authorization'] = '';
    },

    transaction_update(state, payload) {
      state.transactions = [...payload.transactions];
    },

    profiles(state, payload) {
      state.profiles = payload.profiles;
    },

    card_loading(state, payload) {
      state.summaryCardLoding = payload.value;
    }
  },

  actions: {
    async getUser({ commit }) {
      return new Promise((resolve, reject) => {
        axios
          .get('/accounts/user/')
          .then(resp => {
            if (resp.data.is_authenticated) {
              commit({ type: 'auth_success', username: resp.data.username });
              resolve(resp);
            } else {
              commit('auth_signout', 'Authentication failed!');
              resolve(resp);
            }
          })
          .catch(err => {
            reject(err);
          });
      });
    },

    async login({ commit }, user) {
      commit('auth_request');
      return new Promise((resolve, reject) => {
        axios
          .post('/auth/api/login/', user)
          .then(response => {
            const token = response.data.key;
            const username = user.username;
            localStorage.setItem('token', token);
            localStorage.setItem('user', username);
            commit({ type: 'auth_success', token, username });
            resolve(response);
          })
          .catch(err => {
            let errors = [];
            if (err.response) errors = err.response.data.non_field_errors;
            else if (err.request) errors.push('Server not responding');
            else errors.push('Something went wrong');
            commit('auth_signout', errors);
            reject(errors);
          });
      });
    },

    async logout({ commit }) {
      commit('auth_request');
      return new Promise((resolve, reject) => {
        axios
          .post('/auth/api/logout/')
          .then(resp => {
            console.log(resp.data.detail);
            commit('auth_signout', resp.data.detail);
            resolve(resp);
          })
          .catch(err => {
            reject(err);
          });
      });
    },

    async fetchProfiles({ commit }) {
      return new Promise((resolve, reject) => {
        axios
          .get('/accounts/profiles/')
          .then(resp => {
            commit({ type: 'profiles', profiles: resp.data.results });
            resolve(resp.data);
          })
          .catch(err => reject(err));
      });
    }
  }
});
