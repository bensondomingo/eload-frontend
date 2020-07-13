<template>
  <div v-if="transactions.length">
    <v-row dense v-if="showList">
      <v-col class="mb-1 pa-0" cols="12" v-for="transaction in listed" :key="transaction.id">
        <v-alert
          class="mb-0"
          :color="transaction.status === 'refunded' ? 'error' : 'success'"
          :value="transaction.visible"
          border="left"
          transition="scale-transition"
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
                @click="onShowDetail(transaction.id)"
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

    <!-- Detail view -->
    <v-dialog v-model="showDetail" max-width="500" v-if="details">
      <v-card>
        <v-list flat two-line>
          <v-subheader>
            DETAILS
            <v-spacer></v-spacer>
            <v-btn icon @click="onDetailClose">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-subheader>
          <v-list-item v-for="(detail, index) in details" :key="index">
            <v-list-item-content>
              <v-list-item-title v-text="detail.name"></v-list-item-title>
              <v-list-item-subtitle v-text="detail.value"></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { TransactionItem } from '@/assets/scripts/utils.js';
const ITEM_INCREMENT = 5;

export default {
  name: 'TransactionList',
  components: {},
  props: {
    transactions: {
      required: true,
      default: []
    },
    pageBottom: {
      required: true,
      type: Boolean,
      default: false
    }
  },

  data: () => ({
    showList: false,
    showDetail: false,
    details: {},
    listed: [],
    lastItemListedIndex: 0,
    itemIncrement: ITEM_INCREMENT,
    appendItemIndex: 0
  }),

  computed: {
    ...mapGetters(['user', 'isStaff', 'retailers']),

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
      this.showList = false;
      this.listed = [];
      this.itemIncrement = 10;
      this.lastItemListedIndex = 0;
      this.onShowList();
    },

    pageBottom() {
      this.onShowList();
    }
  },

  methods: {
    onShowList() {
      this.showList = true;
      const start = this.lastItemListedIndex;
      const increment =
        this.lastItemListedIndex + this.itemIncrement <=
        this.transactionList.length
          ? this.itemIncrement
          : this.transactionList.length - this.lastItemListedIndex;
      const stop = start + increment;
      const items = this.transactionList.slice(start, stop);
      this.listed.push(...items);
      this.lastItemListedIndex = stop;
    },

    onShowDetail(transactionId) {
      console.log(transactionId);
      const transaction = this.transactions.find(t => t.id === transactionId);
      // Basic details
      let details = [
        { name: 'Transaction ID', value: transaction.id },
        { name: 'Amount', value: transaction.amount },
        { name: 'Posted amount', value: transaction.posted_amount },
        { name: 'Status', value: transaction.status }
      ];

      if (transaction.transaction_type == 'sell_order') {
        details.push(
          { name: 'Phone number', value: transaction.phone_number },
          { name: 'Network', value: transaction.network }
        );
      } else {
        // Buy order
        details.push({
          name: 'Payment method',
          value: transaction.payment_method
        });
      }

      if (this.isStaff) {
        // For admins
        details.splice(
          3,
          0,
          {
            name: 'Rebates',
            value: transaction.reward_amount
          },
          {
            name: 'Running balance',
            value: transaction.running_balance
          }
        );
        if (transaction.transaction_type === 'sell_order') {
          const { device_hash } = transaction.user_agent;
          const retailer = this.retailers.find(
            p => p.device_hash == device_hash
          ).user;
          details.splice(7, 0, { name: 'Retailer', value: retailer });
          details.push({ name: 'Order ID', value: transaction.order_id });
        }
      }

      details.push({
        name: 'Date',
        value: new Date(transaction.transaction_date).toLocaleString()
      });

      this.details = details;
      this.showDetail = true;
    },

    onDetailClose() {
      this.showDetail = false;
      this.details = {};
    }
  },

  mounted() {
    if (this.transactions.length) this.onShowList();
  }
};
</script>

<style scoped>
</style>
