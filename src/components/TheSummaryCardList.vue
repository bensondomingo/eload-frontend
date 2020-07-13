<template>
  <v-row dense>
    <v-col v-for="obj in cardObjects" :key="obj.ref" cols="12">
      <SummaryCardItem
        :cardData="obj"
        :value="summary[obj.ref] || 0"
      />
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex';
import SummaryCardItem from '@/components/TheSummaryCardItem';
import { CardObject } from '@/assets/scripts/utils.js';

export default {
  name: 'SummaryCardList',

  components: {
    SummaryCardItem
  },

  props: {
    transactions: {
      type: Array,
      required: true
    }
  },

  data: () => ({
    cardObjects: []
  }),

  computed: {
    ...mapGetters(['profile']),

    summary() {
      const transactions = this.transactions;
      console.log(transactions);
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
        cash_in: cashIn,
        sales: sales,
        rebates: rebates,
        top_ups: topUps
      };
    }
  },

  created() {
    // Create cards
    this.profile.cards.forEach(card => {
      this.cardObjects.push(
        new CardObject(card.name, card.title, card.color, card.is_dark)
      );
    });
  }
};
</script>

<style>
</style>