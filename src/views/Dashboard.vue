<template>
  <div class="dashboard">
    <!-- Range selector -->
    <v-row dense>
      <v-col class="d-flex" cols="12">
        <v-select
          outlined
          dense
          v-model="selectedRange"
          item-text="name"
          :items="selectRangeOptions"
          label="Date Range"
          color="#044762"
          :messages="rangeSelectorMsg"
          @input="onSelectRange"
          autofocus
        ></v-select>
      </v-col>
      <!-- Custom range picker -->
      <CustomRangePicker ref="customRangePicker" @onApplyCustomRange="onApplyCustomRange" />
    </v-row>

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
  </div>
</template>

<script>
import { axios } from '@/assets/scripts/api.service.js';
import Salecard from '@/components/Salecard';
import CustomRangePicker from '@/components/CustomRangePicker';
import { SaleCardObject } from '@/assets/scripts/salecard.js';
import { dateRangeList } from '@/assets/scripts/daterange.js';

const balanceCard = new SaleCardObject('balance', 'Running Balance', '#05668d');
const salesCard = new SaleCardObject('sales', 'Total Sales', '#028090');
const rebatesCard = new SaleCardObject('rebates', 'Rabates', '#00a896');
const topUpsCard = new SaleCardObject('topUps', 'Top-ups', '#02c39a');

export default {
  name: 'Dashboard',
  components: { Salecard, CustomRangePicker },

  data() {
    return {
      selectedRange:
        localStorage.getItem('range') &&
        localStorage.getItem('range') !== 'undefined'
          ? localStorage.getItem('range')
          : dateRangeList[0].name,
      transactions: [],
      cardObjects: [balanceCard, salesCard, rebatesCard, topUpsCard],
      selectRangeOptions: dateRangeList
    };
  },

  computed: {
    rangeSelectorMsg() {
      const selectedRange = this.selectRangeOptions.find(
        el => el.name === this.selectedRange
      );
      return selectedRange.rangeStr;
    },

    summary() {
      const balance = this.transactions.length
        ? this.transactions[0].running_balance
        : 0;
      const success = this.transactions.filter(
        el => el.transaction_type === 'sell_order' && el.status === 'success'
      );
      const sales = success.reduce((acc, prev) => {
        return acc + prev.amount;
      }, 0);
      const rebates = success.reduce((acc, prev) => {
        return acc + prev.reward_amount;
      }, 0);
      const topUps = success.length * 2;

      return {
        balance: balance,
        sales: sales,
        rebates: rebates,
        topUps: topUps
      };
    }
  },

  methods: {
    setCardLoadingEffect(loadingVal) {
      /* 
        Turn on/off Salecards loading effect
        loadingVal -- String | Boolean
      */
      this.$refs.saleCards.forEach(card => (card.loading = loadingVal));
    },

    fetchTransactions: async function(queryParams = null) {
      /*
        Fetch transactions from database.
      */
      let endpoint = '/cphapp/api/transactions/';
      let responseData = null;
      try {
        const response = await axios.get(endpoint, { params: queryParams });
        responseData = response.data;
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
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
        return;
      }

      this.transactions.push(...responseData.results);
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
        console.log(this.transactions);
      }
      this.setCardLoadingEffect(false);
    },

    onApplyCustomRange(range) {
      const customRange = this.selectRangeOptions.find(
        el => el.name === 'Custom Range'
      );
      customRange.dateStart = range.start;
      customRange.dateEnd = range.end;
      customRange.updateQueryObject();
      this.onSelectRange(null);
    },

    onSelectRange(selected) {
      this.transactions = [];
      let range = this.selectRangeOptions.find(
        el => el.name === this.selectedRange
      );

      if (this.selectedRange === selected) {
        localStorage.setItem('range', selected);
        if (selected === 'Custom Range') {
          // Allow user to set range
          this.$refs.customRangePicker.showRangePicker = true;
          return;
        }
      } else {
        if (this.selectedRange === 'Custom Range') {
          range.dateStart = this.$refs.customRangePicker.customDateRange.start;
          range.dateEnd = this.$refs.customRangePicker.customDateRange.end;
          range.updateQueryObject();
        }
      }

      let queryObject = range.queryObject;
      this.setCardLoadingEffect('white');
      try {
        this.fetchTransactions(queryObject);
      } catch (e) {
        alert(e);
        this.setCardLoadingEffect(false);
      }
    }
  },

  mounted() {
    this.onSelectRange(null);
  }
};
</script>
