<template>
  <v-alert
    class="mb-0"
    :color="color"
    :value="show"
    border="left"
    transition="scale-transition"
    outlined
    dense
  >
    <div class="d-flex">
      <!-- Number/Amount -->
      <div>
        <p class="heading-6 mb-0" v-text="transactionItem.title"></p>
        <p class="caption mb-0" v-text="transactionItem.subtitle"></p>
      </div>
      <v-spacer></v-spacer>
      <!-- Status/Date -->
      <div class="d-flex flex-column align-end">
        <v-btn
          @click="$emit('show-detail', transactionItem.id)"
          :color="color"
          small
          icon
        >
          <v-icon v-if="transactionItem.status === 'success'"
            >mdi-checkbox-marked-circle</v-icon
          >
          <v-icon v-else>mdi-alert-circle-outline</v-icon>
        </v-btn>
        <p class="caption mb-0" v-text="transactionItem.date"></p>
      </div>
    </div>
  </v-alert>
</template>

<script>
export default {
  name: 'TransactionItemComponent',
  props: {
    transactionItem: {
      required: true,
      type: Object,
    },
  },
  computed: {
    show() {
      return this.transactionItem.visible;
    },
    color() {
      const status = this.transactionItem.status;
      if (status === 'success') return 'success';
      else if (status === 'pending') return 'grey lighten-1';
      else return 'error';
    },
  },
};
</script>

<style>
</style>