<template>
  <div v-if="transactions.length" class="pb-16">
    <v-row dense v-if="showList">
      <v-col
        class="mb-1 pa-0"
        cols="12"
        v-for="transaction in transactionList"
        :key="transaction.id"
      >
        <v-fab-transition>
          <TransactionItemComponent
            :transactionItem="transaction"
            @show-detail="onShowDetail"
          />
        </v-fab-transition>
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
              <v-list-item-subtitle
                v-text="detail.value"
              ></v-list-item-subtitle>
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
import TransactionItemComponent from '@/components/TheTransactionItem';
const ITEM_INCREMENT = 5;

export default {
  name: 'TransactionList',
  components: { TransactionItemComponent },
  props: {
    transactions: {
      required: true,
      default: [],
    },
    pageBottom: {
      required: true,
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    showList: false,
    showDetail: false,
    details: {},
    listed: [],
    lastItemListedIndex: 0,
    itemIncrement: ITEM_INCREMENT,
    appendItemIndex: 0,
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
      return this.transactions.map((el) => {
        return new TransactionItem(el);
      });
    },
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
    },
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
      const transaction = this.transactions.find((t) => t.id === transactionId);
      // Basic details
      let details = [
        { name: 'Confirmation code', value: transaction.confirmation_code },
        { name: 'Amount', value: transaction.amount },
        { name: 'Posted amount', value: transaction.posted_amount },
        { name: 'Status', value: transaction.status },
      ];

      if (transaction.transaction_type == 'sellorder') {
        details.push(
          { name: 'Phone number', value: transaction.phone_number },
          { name: 'Network', value: transaction.network }
        );
      } else {
        // Buy order
        details.push({
          name: 'Payment method',
          value: transaction.payment_method,
        });
      }

      if (this.isStaff) {
        // For admins
        details.splice(
          3,
          0,
          {
            name: 'Rebates',
            value: transaction.reward_amount,
          },
          {
            name: 'Running balance',
            value: transaction.running_balance,
          }
        );
        if (transaction.transaction_type === 'sellorder') {
          let retailer = this.retailers.find(
            (retailer) => retailer.id == transaction.retailer
          );
          retailer = retailer
            ? retailer.user
            : `Device ID ${transaction.device}`;

          details.splice(7, 0, { name: 'Retailer', value: retailer });
          details.splice(0, 0, { name: 'Order ID', value: transaction.id });
        }
      }

      details.push({
        name: 'Date',
        value: new Date(transaction.transaction_date).toLocaleString(),
      });

      this.details = details;
      this.showDetail = true;
    },

    onDetailClose() {
      this.showDetail = false;
      this.details = {};
    },
  },

  mounted() {
    if (this.transactions.length) this.onShowList();
  },
};
</script>

<style scoped></style>
