<template>
  <div v-if="transactions.length">
    <v-row dense v-if="show">
      <v-col
        class="mb-1 pa-0"
        cols="12"
        v-for="(transaction, index) in listed"
        :key="transaction.id"
      >
        <v-alert
          class="mb-0"
          :color="transaction.status === 'refunded' ? 'error' : 'success'"
          :dark="!!(index % 2)"
          border="left"
          outlined
          dense
        >
          <div class="d-flex">
            <!-- Number/Amount -->
            <div>
              <p class="heading-6 mb-0" v-text="transaction.title"></p>
              <p class="caption mb-0" v-text="transaction.subtitle"></p>
            </div>
            <v-spacer></v-spacer>
            <!-- Status/Date -->
            <div class="d-flex flex-column align-end">
              <v-btn
                @click="$emit('transactionClick', transaction.id)"
                :color="transaction.status === 'refunded' ? 'error' : 'success'"
                small
                icon
              >
                <v-icon v-if="transaction.status === 'success'">mdi-checkbox-marked-circle</v-icon>
                <v-icon v-else>mdi-alert-circle-outline</v-icon>
              </v-btn>
              <p class="caption mb-0" v-text="transaction.date"></p>
            </div>
          </div>
        </v-alert>
      </v-col>
    </v-row>
    <v-row dense v-if="showButton">
      <v-col cols="12">
        <v-btn class="primary" @click="onShowList" block depressed rounded>
          <v-badge bordered :content="badgeContent">
            <span>Load More</span>
          </v-badge>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
const ITEM_INCREMENT = 20;

class TransactionItem {
  constructor(transaction) {
    this.id = transaction.id;
    this.title =
      transaction.transaction_type == 'sell_order'
        ? transaction.phone_number.replace('+63', '0')
        : 'CASH IN';
    const subtitle =
      transaction.transaction_type == 'sell_order'
        ? transaction.network.split(' ')[0]
        : transaction.payment_method;
    this.subtitle = subtitle + ' / P' + transaction.amount;
    this.status = transaction.status === 'success' ? 'success' : 'refunded';
    this.date = new Date(transaction.transaction_date).toLocaleString();
  }
}

export default {
  name: 'TransactionList',
  components: {},
  props: {
    transactions: {
      required: true,
      default: []
    }
  },

  data: () => ({
    show: false,
    listed: [],
    lastItemListedIndex: 0,
    itemIncrement: ITEM_INCREMENT
  }),

  computed: {
    badgeContent() {
      return this.transactionList.length - this.listed.length;
    },

    showButton() {
      return this.listed.length < this.transactionList.length;
    },

    transactionList() {
      return this.transactions.map(el => {
        return new TransactionItem(el);
      });
    }
  },

  watch: {
    transactions(/*newValue, oldValue*/) {
      this.show = false;
      this.listed = [];
      this.itemIncrement = 10;
      this.lastItemListedIndex = 0;
      this.onShowList();
    }
  },

  methods: {
    onShowList() {
      this.show = true;
      const start = this.lastItemListedIndex;
      const increment =
        this.lastItemListedIndex + this.itemIncrement <=
        this.transactionList.length
          ? this.itemIncrement
          : this.transactionList.length - this.lastItemListedIndex;
      const stop = start + increment;
      this.listed.push(...this.transactionList.slice(start, stop));
      this.lastItemListedIndex = stop;
    }
  }
};
</script>

<style scoped>
</style>
