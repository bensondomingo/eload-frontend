<template>
  <v-container>
    <NewTransactionForm class="mb-4" />
    <TransactionList :transactions="transactions" :pageBottom="false" />
  </v-container>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import NewTransactionForm from '@/components/forms/NewTransactionForm';
import TransactionList from '@/components/TheTransactionList';

export default {
  name: 'Home',
  components: { TransactionList, NewTransactionForm },

  data: () => ({
    isNumberValid: false,
    phoneNumber: '',
    phoneNumberErrors: [],
    rules: {
      required: value => !!value || 'Required.',
      isvalid: v =>
        (v.length == 11 && v.startsWith('0')) || 'Phone number is invalid'
    },
    loading: false,
    e1: 1,
    loadOffset: 0,
    transactions: [],
    newTransactionDialog: false
  }),

  computed: {
    ...mapGetters(['pageBottom', 'newTransaction']),

    phoneNumberRules() {
      const rules = [];
      const required = v => !!v || 'Phone number is required';
      const valid = v =>
        (v.length == 11 && v.startsWith('0')) || 'Phone number is invalid';
      rules.push(required, valid);
      return rules;
    }
  },

  watch: {
    pageBottom(newValue) {
      // Call onLoadMore when scrolling reached bottom
      if (newValue) {
        this.onLoadMore();
      }
    },

    newTransaction(newValue) {
      if (!newValue) return;
      this.transactions.splice(0, 0, newValue);
      this.CLEAR_NEW_TRANSACTION();
    }
  },

  methods: {
    ...mapMutations(['CLEAR_NEW_TRANSACTION']),

    fetchTransactions(queryParams = { limit: 10, offset: 0 }) {
      const endpoint = '/cphapp/api/transactions/';
      this.$http
        .get(endpoint, { params: queryParams })
        .then(resp => {
          console.log(resp);
          this.transactions.push(...resp.data.results);
        })
        .catch(err => console.log(err));
    },

    onLoadMore() {
      this.fetchTransactions({ limit: 10, offset: this.loadOffset });
      this.loadOffset += 10;
    },

    onShowActions() {},

    onCloseTransactionForm() {
      this.newTransactionDialog = false;
    },

    onScroll() {
      console.log('Scroll');
    }
  },

  created() {
    document.title = 'Home | ' + document.title;
    if (!this.transactions.length) {
      this.fetchTransactions();
      this.loadOffset += 1;
      0;
    }
  }
};
</script>

<style scoped>
.box {
  height: 2000px;
}
</style>
