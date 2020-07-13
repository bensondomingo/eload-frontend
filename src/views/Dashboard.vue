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
          :disabled="$store.getters.fetchTransactions"
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

        <v-card-text class="px-2 pb-2">
          <v-row dense>
            <!-- Retailer selector -->
            <v-col cols="12" v-if="isStaff">
              <v-select
                v-model="retailerFilter"
                :items="retailers"
                item-text="user"
                label="Retailer"
                return-object
                outlined
                dense
              ></v-select>
            </v-col>

            <!-- Transaction type filter -->
            <v-col v-if="isStaff" cols="12">
              <v-radio-group
                class="mt-0"
                v-model="transactionTypeFilter"
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
    <SummaryCardList :transactions="filteredTransactions" />
    <!-- Transactions list -->
    <TransactionList :transactions="filteredTransactions" :pageBottom="bottom" />
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { filter } from 'lodash';
import SummaryCardList from '@/components/TheSummaryCardList';
import CustomRangePicker from '@/components/CustomRangePicker';
import TransactionList from '@/components/TheTransactionList';
import { dateRangeList } from '@/assets/scripts/daterange.js';

let transactionsCache = [];
const DEFAULT_RETAILER_FILTER = { user: 'all', deviceHash: null };
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
    SummaryCardList,
    CustomRangePicker,
    TransactionList
  },

  data() {
    return {
      menuBtn: true,
      bottom: true,
      showFilter: false,
      retailerFilter: DEFAULT_RETAILER_FILTER,
      transactionTypeFilter: DEFAULT_TRANSACTION_TYPE_FILTER.value,
      transactionType: transactionType,
      selectedRange:
        localStorage.getItem('range') &&
        localStorage.getItem('range') !== 'undefined'
          ? localStorage.getItem('range')
          : dateRangeList[0].name,
      selectRangeErrors: [],
      filteredTransactions: [],
      rangeOptions: dateRangeList
    };
  },

  computed: {
    ...mapGetters(['user', 'profile', 'isStaff', 'transactions']),

    rangeSelectorMsg() {
      const selectedRange = this.rangeOptions.find(
        el => el.name === this.selectedRange
      );
      return selectedRange.rangeStr;
    },

    retailers() {
      return this.isStaff
        ? [DEFAULT_RETAILER_FILTER, ...this.$store.getters.retailers]
        : null;
    }
  },

  watch: {
    transactions() {
      /* Apply filter every time this.transactions got updates */
      this.onApplyFilter();
    },

    retailerFilter(newValue) {
      if (newValue.user === 'DEFAULT_RETAILER_FILTER') {
        this.transactionTypeFilter = DEFAULT_TRANSACTION_TYPE_FILTER.value;
      }
    }
  },

  methods: {
    async fetchTransactions(queryParams = null) {
      /*
        Fetch transactions from database.
      */
      const endpoint = '/cphapp/api/transactions/';
      let responseData = null;
      try {
        this.$store.commit('fetchTransactions', true);
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
        this.$store.commit('fetchTransactions', false);
        return;
      }

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
      this.$store.commit('fetchTransactions', false);
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

      if (this.isStaff) {
        // Filters for admin
        if (this.retailerFilter !== DEFAULT_RETAILER_FILTER) {
          // Filter by retailer
          objectFilter.user_agent = {};
          objectFilter.user_agent.device_hash = this.retailerFilter.device_hash;
        }
        if (
          this.transactionTypeFilter !== DEFAULT_TRANSACTION_TYPE_FILTER.value
        ) {
          objectFilter.transaction_type = this.transactionTypeFilter;
        }
      }

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

      try {
        this.fetchTransactions(range.queryObject);
      } catch (e) {
        alert(e);
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
    let queryObject = range.queryObject;
    this.fetchTransactions(queryObject);
  }
};
</script>
