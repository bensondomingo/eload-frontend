<template>
  <div class="dashboard">
    <v-container>
      <v-row dense>
        <v-col class="d-flex" cols="12">
          <!-- Select Range -->
          <v-select
            outlined
            v-model="selectedRange"
            :items="selectRangeOptions"
            label="Select Range"
            append-icon="mdi-calendar-range"
            color="#044762"
            @change="onSelectRange"
          ></v-select>
        </v-col>
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
import Salecard from '@/components/Salecard';
import { apiService } from '@/assets/api.service.js';
import { encodeParams } from '@/assets/utils.js';
import {
  SaleCardObject,
  Today,
  Yesterday,
  ThisWeek,
  ThisMonth
} from '@/assets/modules.js';

const balanceCard = new SaleCardObject('balance', 'Running Balance', '#05668d');
const salesCard = new SaleCardObject('sales', 'Total Sales', '#028090');
const rebatesCard = new SaleCardObject('rebates', 'Rabates', '#00a896');
const topUpsCard = new SaleCardObject('topUps', 'Top-ups', '#02c39a');

// Date Ranges
const today = new Today();
const yesterday = new Yesterday();
const thisWeek = new ThisWeek();
const thisMonth = new ThisMonth();

const dateRangeOptions = [today, yesterday, thisWeek, thisMonth];

export default {
  name: 'Dashboard',
  components: { Salecard },
  data() {
    return {
      selectedRange: localStorage.getItem('range') || today.name,
      transactions: [],
      dummyCard: balanceCard,
      cardObjects: [balanceCard, salesCard, rebatesCard, topUpsCard],
      selectRangeOptions: dateRangeOptions.map(el => el.name)
    };
  },
  computed: {
    summary() {
      const success = this.transactions.filter(
        el => el.transaction_type === 'sell_order' && el.status === 'success'
      );
      const balance = success.length ? success[0].running_balance : 0;
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
      endpoint += queryParams ? `?${queryParams}` : '';
      console.log(endpoint);

      let data = await apiService(endpoint);
      this.transactions.push(...data.results);
      if (data.next) {
        const queryParams = data.next.split('?')[1];
        this.fetchTransactions(queryParams);
      } else {
        console.log(this.transactions);
      }
      this.setCardLoadingEffect(false);
    },

    onSelectRange() {
      this.transactions = [];
      localStorage.setItem('range', this.selectedRange);
      const range = dateRangeOptions.find(el => el.name === this.selectedRange);
      let queryObject = range.queryObject;
      queryObject.transaction_type = 'sell_order';
      console.log(queryObject);
      this.setCardLoadingEffect('white');
      try {
        this.fetchTransactions(encodeParams(queryObject));
      } catch (e) {
        console.log(e);
        this.setCardLoadingEffect(false);
      }
    }
  },

  mounted() {
    this.onSelectRange();
  }
};
</script>
