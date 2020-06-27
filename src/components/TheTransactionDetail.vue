<template>
  <v-dialog v-model="show" max-width="500" v-if="details">
    <v-card>
      <v-list flat two-line>
        <v-subheader>
          DETAILS
          <v-spacer></v-spacer>
          <v-btn icon @click="onHide">
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
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'TransactionDetail',
  data: () => ({
    show: false,
    transactionId: null
  }),

  computed: {
    ...mapGetters(['transactions', 'profiles']),

    details() {
      const transaction = this.transactions.find(
        el => el.id === this.transactionId
      );
      if (!transaction) return null;

      let detail = [
        { name: 'Amount', value: transaction.amount },
        { name: 'Posted amount', value: transaction.posted_amount },
        { name: 'Running balance', value: transaction.running_balance },
        { name: 'Status', value: transaction.status },
        { name: 'Transaction type', value: transaction.transaction_type },
        { name: 'Transaction ID', value: transaction.id },
        { name: 'Order ID', value: transaction.order_id }
      ];

      if (transaction.transaction_type == 'sell_order') {
        const { device_hash } = transaction.user_agent;
        const retailer = this.profiles.find(p => p.device_hash == device_hash)
          .user;
        detail.splice(2, 0, {
          name: 'Rebates',
          value: transaction.reward_amount
        });
        detail.splice(
          5,
          0,
          { name: 'Phone number', value: transaction.phone_number },
          { name: 'Network', value: transaction.network },
          { name: 'Retailer', value: retailer }
        );
      } else {
        detail.splice(5, 0, {
          name: 'Payment method',
          value: transaction.payment_method
        });
      }
      detail.push({
        name: 'Date',
        value: new Date(transaction.transaction_date).toLocaleString()
      });

      return detail;
    }
  },

  methods: {
    onHide() {
      this.show = false;
      this.transactionId = null;
    }
  }
};
</script>
