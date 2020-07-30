<template>
  <v-card v-bind:color="cardData.color" v-bind:dark="cardData.isDark">
    <v-card-title class="headline">
      <v-progress-circular indeterminate color="white" v-if="loading"></v-progress-circular>
      <span v-else>
        <!-- <v-icon>mdi-currency-php</v-icon> -->
        P<span v-text="value"></span>
      </span>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-subtitle>{{ cardData.title }}</v-card-subtitle>
    <v-card-actions>
      <v-btn text>View Report</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'SummaryCardItem',
  props: {
    cardData: {
      type: Object,
      required: true
    },
    value: {
      type: [Number, String],
      default: 0
    }
  },
  data: () => ({}),
  computed: {
    loading() {
      return this.$store.getters.fetchTransactions ? 'white' : false;
    }
  }
};
</script>

<style></style>
