<template>
  <v-container id="dashboard" v-scroll.self="onScroll">
    <v-fab-transition>
      <v-btn
        v-show="menuBtn"
        @click="showFilter=true"
        color="pink lighten-1"
        dark
        fab
        bottom
        right
        fixed
      >
        <v-icon>mdi-filter-outline</v-icon>
      </v-btn>
    </v-fab-transition>
    <v-fab-transition>
      <v-btn
        v-show="!menuBtn && !bottom"
        @click="$vuetify.goTo('#dashboard')"
        color="pink lighten-1"
        dark
        bottom
        right
        fixed
        fab
      >
        <v-icon>mdi-chevron-up</v-icon>
      </v-btn>
    </v-fab-transition>

    <!-- Range selector -->
    <v-row dense>
      <v-col id="range-selector" cols="12">
        <v-select
          outlined
          dense
          v-model="selectedRange"
          item-text="name"
          :items="rangeOptions"
          label="Date Range"
          color="#044762"
          :messages="rangeSelectorMsg"
          :error-messages="selectRangeErrors"
          :disabled="ongoingFetch"
          @input="onRangeSelect"
          @change="selectRangeErrors=[]"
        ></v-select>
      </v-col>
      <CustomRangePicker ref="customRangePicker" @onCustomRangeApply="onCustomRangeApply" />
    </v-row>

    <!-- Filter Dialog -->
    <v-dialog v-model="showFilter" class="d-flex justify-center" max-width="800">
      <v-card>
        <v-card-title class="text-center">
          <v-icon>mdi-filter-outline</v-icon>Filter
        </v-card-title>

        <!-- Retailer selector -->
        <v-card-text class="px-2 pb-2">
          <v-row dense>
            <v-col cols="12">
              <v-select
                v-model="retailerFilter"
                :items="retailers"
                item-text="name"
                label="Retailer"
                return-object
                outlined
                dense
              ></v-select>
            </v-col>
            <v-col v-if="retailerFilter.name === 'ADMIN'" cols="12">
              <v-radio-group
                class="mt-0"
                v-model="transactionTypeFilter"
                :disabled="transactionTypeFilterDisabled"
                label="Transaction Type"
                row
              >
                <v-radio
                  v-for="(item, index) in transactionType"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                ></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="onApplyFilter" depressed>Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Sale cards -->
    <v-row dense>
      <v-col v-for="cardData in cardObjects" :key="cardData.ref" cols="12" sm="6" md="3">
        <Salecard
          ref="saleCards"
          :key="cardData.ref"
          :cardData="cardData"
          :amount="Object.keys(summary).length != 0 ? summary[cardData.ref] : 0"
        />
      </v-col>
    </v-row>
    <!-- Transactions list -->
    <v-row>
      <v-col cols="12">
        <TransactionList
          :transactions="filteredTransactions"
          @transactionClick="showTransactionDetail"
        />
      </v-col>
    </v-row>

    <TransactionDetail ref="transactionDetail" />
  </v-container>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import { filter } from 'lodash';
import Salecard from '@/components/Salecard';
import CustomRangePicker from '@/components/CustomRangePicker';
import TransactionList from '@/components/TheTransactionList';
import TransactionDetail from '@/components/TheTransactionDetail';
import Summary from '@/assets/scripts/salecard.js';
import { dateRangeList } from '@/assets/scripts/daterange.js';

const cashInCard = new Summary('cashIn', 'Cash In', '#05668d');
// const balanceCard = new Summary('balance', 'Running Balance', '#05668d');
const salesCard = new Summary('sales', 'Sales', '#028090');
const rebatesCard = new Summary('rebates', 'Rabates', '#00a896');
const topUpsCard = new Summary('topUps', 'Top-ups', '#02c39a');

let transactionsCache = [];
const DEFAULT_RETAILER_FILTER = { name: 'ADMIN', deviceHash: null };
const DEFAULT_TRANSACTION_TYPE_FILTER = { label: 'ALL', value: 'all' };
const transactionType = [
  DEFAULT_TRANSACTION_TYPE_FILTER,
  {
    label: 'SELL',
    value: 'sell_order'
  },
  {
    label: 'CASH IN',
    value: 'buy_order'
  }
];

export default {
  name: 'Dashboard',
  components: {
    Salecard,
    CustomRangePicker,
    TransactionList,
    TransactionDetail
  },

  data() {
    return {
      menuBtn: true,
      bottom: true,
      showFilter: false,
      retailerFilter: DEFAULT_RETAILER_FILTER,
      transactionTypeFilter: DEFAULT_TRANSACTION_TYPE_FILTER.value,
      transactionTypeFilterDisabled: false,
      // retailers: RETAILERS,
      transactionType: transactionType,
      selectedRange:
        localStorage.getItem('range') &&
        localStorage.getItem('range') !== 'undefined'
          ? localStorage.getItem('range')
          : dateRangeList[0].name,
      selectRangeErrors: [],
      // transactions: [],
      filteredTransactions: [],
      cardObjects: [
        cashInCard,
        // balanceCard,
        salesCard,
        rebatesCard,
        topUpsCard
      ],
      rangeOptions: dateRangeList
    };
  },

  computed: {
    ...mapGetters(['ongoingFetch', 'transactions']),

    rangeSelectorMsg() {
      const selectedRange = this.rangeOptions.find(
        el => el.name === this.selectedRange
      );
      return selectedRange.rangeStr;
    },

    retailers() {
      return [DEFAULT_RETAILER_FILTER, ...this.$store.getters.retailers];
    },

    summary() {
      let balance;
      const transactions = this.filteredTransactions;
      console.log(transactions);
      if (this.retailerFilter.name === DEFAULT_RETAILER_FILTER.name) {
        balance = transactions.length ? transactions[0].running_balance : 0;
      } else {
        balance = NaN;
      }
      const cashIn = transactions
        .filter(el => el.transaction_type === 'buy_order')
        .reduce((acc, prev) => {
          return acc + prev.amount;
        }, 0);
      const success = transactions.filter(
        el => el.transaction_type === 'sell_order' && el.status === 'success'
      );
      const sales = success.reduce((acc, prev) => {
        return acc + prev.amount;
      }, 0);
      const rebates = success.reduce((acc, prev) => {
        return acc + prev.reward_amount;
      }, 0);
      const topUps = success.filter(el => el.amount < 100).length * 2;

      return {
        cashIn: cashIn,
        balance: balance,
        sales: sales,
        rebates: rebates,
        topUps: topUps
      };
    }
  },

  watch: {
    transactions() {
      /* Apply filter every time this.transactions got updates */
      this.onApplyFilter();
    },

    retailerFilter(newValue) {
      if (newValue === DEFAULT_RETAILER_FILTER) {
        this.transactionTypeFilter = DEFAULT_TRANSACTION_TYPE_FILTER.value;
      }
    }
  },

  methods: {
    ...mapMutations(['card_loading']),

    showTransactionDetail(transactionId) {
      console.log(transactionId);
      this.$refs.transactionDetail.show = true;
      this.$refs.transactionDetail.transactionId = transactionId;
    },

    fetchTransactions: async function(queryParams = null) {
      /*
        Fetch transactions from database.
      */
      const endpoint = '/cphapp/api/transactions/';
      let responseData = null;
      try {
        const response = await this.$http.get(endpoint, {
          params: queryParams
        });
        responseData = response.data;
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            this.$store.commit('auth_signout', error.response.data.detail);
            this.$router.push({
              name: 'login',
              query: { redirect: '/' }
            });
          } else {
            this.selectRangeErrors.push(error.response.data.detail);
          }
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
          this.selectRangeErrors.push('Connection error!');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
          this.selectRangeErrors.push(error.message);
        }
        this.$store.commit({ type: 'card_loading', value: false });
        return;
      }

      // this.transactions.push(...responseData.results);
      transactionsCache.push(...responseData.results);
      if (responseData.next) {
        const uri = decodeURIComponent(responseData.next);
        const queryParams = Object.fromEntries(
          uri
            .split('?')[1]
            .split('&')
            .map(el => el.split('='))
        );
        this.fetchTransactions(queryParams);
      } else {
        this.$store.commit({
          type: 'transaction_update',
          transactions: transactionsCache
        });
        transactionsCache = [];
      }
      // this.setCardLoadingEffect(false);
      this.$store.commit({ type: 'card_loading', value: false });
    },

    onScroll() {
      this.menuBtn = window.pageYOffset <= 80;
      this.bottom =
        window.pageYOffset + window.innerHeight >=
        document.documentElement.offsetHeight - 5;
    },

    onApplyFilter() {
      this.showFilter = false;

      if (!this.transactions.length) {
        this.filteredTransactions = [];
        return;
      }

      const objectFilter = {};
      // Filter by retailer
      if (this.retailerFilter !== DEFAULT_RETAILER_FILTER) {
        objectFilter.user_agent = {};
        objectFilter.user_agent.device_hash = this.retailerFilter.deviceHash;
      } else {
        // Filter by transaction_type only allowed when admin is selected
        if (
          this.transactionTypeFilter !== DEFAULT_TRANSACTION_TYPE_FILTER.value
        ) {
          objectFilter.transaction_type = this.transactionTypeFilter;
        }
      }

      console.log(objectFilter);
      this.filteredTransactions = filter(this.transactions, {
        ...objectFilter
      });
    },

    onCustomRangeApply(range) {
      const customRange = this.rangeOptions.find(
        el => el.name === 'Custom Range'
      );
      customRange.dateStart = range.start;
      customRange.dateEnd = range.end;
      customRange.updateQueryObject();
      this.onRangeSelect(null);
    },

    onRangeSelect(selected) {
      // this.transactions = [];
      transactionsCache = [];
      let range = this.rangeOptions.find(el => el.name === this.selectedRange);

      localStorage.setItem('range', this.selectedRange);
      if (selected && this.selectedRange === 'Custom Range') {
        // Allow user to set range
        this.$refs.customRangePicker.showRangePicker = true;
        return;
      }

      // this.$store.commit({ type: 'card_loading', value: 'white' });
      this.card_loading({ value: 'white' });
      try {
        this.fetchTransactions(range.queryObject);
      } catch (e) {
        alert(e);
        this.card_loading({ value: false });
      }
    }
  },

  mounted() {
    /* Pre-fetch transactions data from the server */
    // 1. Get selectedRange from localStorage
    const range = this.rangeOptions.find(el => el.name === this.selectedRange);
    if (this.selectedRange === 'Custom Range') {
      range.dateStart = this.$refs.customRangePicker.customDateRange.start;
      range.dateEnd = this.$refs.customRangePicker.customDateRange.end;
      range.updateQueryObject();
    }

    // Fetch data based on selected range
    // this.$store.commit({ type: 'card_loading', value: 'white' });
    this.card_loading({ value: 'white' });
    let queryObject = range.queryObject;
    this.fetchTransactions(queryObject);
  },

  created() {
    // Fetch profiles
    this.$store
      .dispatch('fetchProfiles')
      .then(data => console.log(data))
      .catch(err => {
        if (err.respone) {
          if (err.response.status === 401) {
            this.$store.commit('auth_signout', err.response.data.detail);
            this.$router.push({ name: 'login' });
          }
        }
      });
  }
};
</script>
