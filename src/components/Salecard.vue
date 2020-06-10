<template>
  <v-card
    v-bind:loading="loading"
    v-bind:color="cardData.color"
    v-bind:dark="cardData.isDark"
  >
    <v-card-title class="headline">
      <v-icon>mdi-currency-php</v-icon>
      {{ amount }}
    </v-card-title>
    <v-card-subtitle>{{ cardData.title }}</v-card-subtitle>
    <v-card-actions>
      <v-btn text>View Report</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'Salecard',
  props: {
    amount: Number,
    cardData: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    loading: false
  })
};
</script>

<style></style>
