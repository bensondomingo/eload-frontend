import Vue from 'vue';
import Vuex from 'vuex';

import { axios } from '@/assets/scripts/api.service';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    authStatus: '',
    authDetails: [],
    user: {},
    profile: {},
    token: localStorage.getItem('token') || null,
    retailers: [],
    transactions: [],
    fetchTransactions: false,
    cardLoading: false,
    pageBottom: false,
    fcmConfig: {},
    fcmToken: '',
    notificationTray: [],
    newTransaction: null
  },

  getters: {
    user: state => {
      if (Object.keys(state.user).length === 0) return null;
      const { username, email, first_name, last_name, is_staff } = state.user;
      return {
        username,
        email,
        firstName: first_name,
        lastName: last_name,
        isStaff: is_staff
      };
    },

    isStaff: (state, getters) => {
      return getters.user ? getters.user.isStaff : false;
    },

    profile: state => {
      if (Object.keys(state.user).length === 0) return null;
      else return state.user.profile;
    },

    userDataFetched: (state, getters) => {
      if (!getters.user) return false;

      if (!getters.isStaff) {
        return true;
      } else {
        return !!getters.profile;
      }
    },

    retailers: (state, getters) => {
      if (getters.user) {
        if (!getters.isStaff) return null;
      } else return null;

      return state.retailers;
    },

    isAuthenticated: state => !!state.token,
    fetchTransactions: state => state.fetchTransactions,
    cardLoading: state => state.fetchTransactions,
    transactions: state => state.transactions,
    pageBottom: state => state.pageBottom,
    fcmConfig: state => state.fcmConfig,
    fcmToken: state => state.fcmToken,
    notificationTray: state => state.notificationTray,
    newTransaction: state => state.newTransaction
  },

  mutations: {
    set_user(state, userObj) {
      state.user = userObj;
    },

    set_retailers(state, retailers) {
      if (!retailers) {
        state.retailers = null;
      }
      state.retailers.push(...retailers);
    },

    reset_state(state) {
      state.user = {};
      state.profiles = {};
      state.token = null;
      localStorage.clear();
      state.retailers = [];
      state.transactions = [];
      state.cardLoading = false;
    },

    auth_request(state) {
      state.authStatus = 'loading';
      state.authDetails = ['Waiting server to respond'];
    },

    auth_success(state, payload) {
      state.authStatus = 'authenticated';
      state.authDetails = ['Authentication successful'];
      if (payload.token) {
        state.token = payload.token;
      }
    },

    auth_signout(state, message) {
      state.authStatus = 'unauthorized';
      if (message instanceof Array) state.authDetails = [...message];
      else state.authDetails = [message];
    },

    auth_error(state, errorMsg) {
      state.authStatus = 'unauthorized';
      state.authDetails = errorMsg;
      state.user = {};
      state.token = '';
      state.transactions = [];
      // clear localStorage
      localStorage.setItem('token', '');
      // Delete authorization header
      axios.defaults.headers.common['Authorization'] = '';
    },

    transaction_update(state, payload) {
      state.transactions = [...payload.transactions];
    },

    profiles(state, payload) {
      state.profiles = payload.profiles;
    },

    card_loading(state, value) {
      state.cardLoading = value;
    },

    fetchTransactions(state, value) {
      state.fetchTransactions = value;
    },

    scrolledToBottom(state, value) {
      state.pageBottom = value;
    },

    SET_FCM_CONFIG(state, value) {
      state.fcmConfig = value;
    },

    SET_FCM_TOKEN(state, value) {
      state.fcmToken = value;
    },

    PUSH_NEW_NOTIFICATION(state, value) {
      state.notificationTray.push(value);
      if (value.notification_type === 'NEW_TRANSACTION') {
        const newTransaction = { ...value };
        delete newTransaction.notification_type;
        state.newTransaction = newTransaction;
      }
    },

    CLEAR_NOTIFICATION_TRAY(state) {
      state.newTransaction = null;
    },

    CLEAR_NEW_TRANSACTION(state) {
      // New transaction was set everytime a new push notification 
      // with 'NEW_TRANSACTION' type was received
      state.newTransaction = null;
    }
  },

  actions: {
    async fetchUser({ commit }) {
      return new Promise((resolve, reject) => {
        axios
          .get('/accounts/current-user/')
          .then(resp => {
            const userObj = resp.data;
            commit('set_user', userObj);
            resolve(userObj);
          })
          .catch(err => {
            reject(err);
          });
      });
    },

    fetchFCMConfig({ commit }) {
      return new Promise((resolve, reject) => {
        axios
          .get('/fcm/api/fcm-config/')
          .then(resp => {
            commit('SET_FCM_CONFIG', resp.data);
            resolve(resp.data);
            return resp.data;
          })
          .catch(err => {
            console.log(err);
            reject(err);
            return err;
          });
      });
    },

    async fetchRetailers({ getters, commit, dispatch }, queryParams = null) {
      return new Promise((resolve, reject) => {
        axios
          .get('/accounts/profiles/', { params: queryParams })
          .then(resp => {
            commit('set_retailers', resp.data.results);
            if (!resp.data.next) {
              resolve(getters.retailers);
            } else {
              const uri = decodeURIComponent(resp.data.next);
              const queryParams = Object.fromEntries(
                uri
                  .split('?')[1]
                  .split('&')
                  .map(el => el.split('='))
              );
              dispatch('fetchRetailers', queryParams)
                .then(resp => console.log(resp))
                .catch(err => console.log(err));
            }
          })
          .catch(err => reject(err));
      });
    },

    async login({ commit }, credentials) {
      commit('auth_request');
      return new Promise((resolve, reject) => {
        axios
          .post('/auth/api/login/', credentials)
          .then(authResp => {
            const token = authResp.data.key;
            commit({ type: 'auth_success', token: token });
            resolve(token);
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

    logout({ commit }) {
      commit('auth_request');
      return new Promise((resolve, reject) => {
        axios
          .post('/auth/api/logout/')
          .then(resp => {
            console.log(resp.data.detail);
            commit('auth_signout', resp.data.detail);
            commit('reset_state');
            resolve(resp);
          })
          .catch(err => {
            reject(err);
          });
      });
    }
  }
});
