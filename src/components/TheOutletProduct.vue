<template>
  <v-list-item class="px-1" @click.stop.prevent="$emit('onProductSelect')">
    <v-list-item-content>
      <v-list-item-title v-text="productData.code"></v-list-item-title>
      <v-list-item-subtitle v-text="productData.name"></v-list-item-subtitle>
    </v-list-item-content>

    <v-list-item-action>
      <v-tooltip left :open-on-click="true" :open-on-hover="false">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon color="grey lighten-1">mdi-information</v-icon>
          </v-btn>
        </template>
        <span v-text="productData.description"></span>
      </v-tooltip>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
export default {
  name: 'OutletProduct',

  props: {
    productData: {
      required: true
    }
  },

  data: () => ({
    showTooltip: false
  })
};
</script>

<style></style>
