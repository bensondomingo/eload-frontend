<template>
  <div class="dashboard">
    <v-container>
      <v-row dense>
        <!-- Select Range -->
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
        <div class="text-center">
          <v-dialog v-model="showRangePicker" width="500">
            <v-stepper v-model="customRangeStep">
              <v-stepper-header>
                <v-stepper-step editable :complete="customRangeStep > 1" step="1">Start</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step :complete="customRangeStep > 2" step="2">End</v-stepper-step>
              </v-stepper-header>

              <v-stepper-items>
                <v-stepper-content step="1">
                  <v-date-picker
                    v-model="customRangeStart"
                    @input="customRangeStep = 2"
                    full-width
                    no-title
                  ></v-date-picker>
                </v-stepper-content>

                <v-stepper-content step="2">
                  <div class="d-flex flex-column"></div>
                  <v-date-picker v-model="customRangeEnd" full-width no-title></v-date-picker>
                  <v-btn color="primary" @click="onApplyCustomRange">Apply</v-btn>
                  <v-btn text @click="customRangeStep = 1">Back</v-btn>
                </v-stepper-content>
              </v-stepper-items>
            </v-stepper>
          </v-dialog>
        </div>
      </v-row>
      <!-- Cards -->
      <Salecard
        ref="saleCards"
        v-for="cardData in cardObjects"
        :key="cardData.ref"
        :cardData="cardData"
        :amount="Object.keys(summary).length != 0 ? summary[cardData.ref] : 0"
      />
    </v-container>
  </div>
</template>

<script>
import { axios } from '@/assets/api.service.js';
import Salecard from '@/components/Salecard';
import { SaleCardObject } from '@/assets/modules.js';
import { dateRange } from '@/assets/helpers/daterange.js';

const balanceCard = new SaleCardObject('balance', 'Running Balance', '#05668d');
const salesCard = new SaleCardObject('sales', 'Total Sales', '#028090');
const rebatesCard = new SaleCardObject('rebates', 'Rabates', '#00a896');
const topUpsCard = new SaleCardObject('topUps', 'Top-ups', '#02c39a');

const dateRangeOptions = dateRange;

export default {
  name: 'Dashboard',
  components: { Salecard },

  data() {
    return {
      selectedRange:
        localStorage.getItem('range') &&
        localStorage.getItem('range') !== 'undefined'
          ? localStorage.getItem('range')
          : dateRangeOptions[0].name,
      showRangePicker: false,
      customRangeStep: 1,
      customRangeStart:
        localStorage.getItem('customRangeStart') &&
        localStorage.getItem('customRangeStart') !== 'undefined'
          ? localStorage.getItem('customRangeStart')
          : new Date().toISOString().substr(0, 10),
      customRangeEnd:
        localStorage.getItem('customRangeEnd') &&
        localStorage.getItem('customRangeEnd') !== 'undefined'
          ? localStorage.getItem('customRangeEnd')
          : new Date().toISOString().substr(0, 10),
      transactions: [],
      dummyCard: balanceCard,
      cardObjects: [balanceCard, salesCard, rebatesCard, topUpsCard],
      selectRangeOptions: dateRangeOptions
    };
  },

  computed: {
    customDateRange() {
      // Just convert the date string to Date object
      return {
        dateStart: new Date(this.customRangeStart),
        dateEnd: new Date(this.customRangeEnd)
      };
    },

    rangeSelectorMsg() {
      if (this.selectedRange !== 'Custom Range') {
        return '';
      }
      return (
        this.customDateRange.dateStart.toLocaleDateString() +
        '-' +
        this.customDateRange.dateEnd.toLocaleDateString()
      );
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

    onApplyCustomRange() {
      this.customRangeStep = 1;
      this.showRangePicker = false;
      localStorage.setItem('customRangeStart', this.customRangeStart);
      localStorage.setItem('customRangeEnd', this.customRangeEnd);
      const customRange = this.selectRangeOptions.find(
        el => el.name === 'Custom Range'
      );
      customRange.dateStart = this.customDateRange.dateStart;
      customRange.dateEnd = this.customDateRange.dateEnd;
      customRange.updateQueryObject();
      this.onSelectRange(null);
    },

    onSelectRange(selected) {
      this.transactions = [];
      let range = this.selectRangeOptions.find(
        el => el.name === this.selectedRange
      );

      if (selected === null) {
        // For page reloads or explicit calls
        if (this.selectedRange === 'Custom Range') {
          range.dateStart = this.customDateRange.dateStart;
          range.dateEnd = this.customDateRange.dateEnd;
          range.updateQueryObject();
        }
      } else {
        localStorage.setItem('range', selected);
        if (selected === 'Custom Range') {
          // Allow user to set range
          this.showRangePicker = true;
          return;
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
