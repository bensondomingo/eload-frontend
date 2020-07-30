<template>
  <v-content>
    <h1 class="display-1">dummy page -- {{ $router.currentRoute.name}}</h1>

    <v-row dense>
      <v-col v-for="cardData in cardObjects" :key="cardData.ref" cols="12" sm="6" md="3">
        <SummaryCard
          ref="saleCards"
          :key="cardData.ref"
          :cardData="cardData"
        />
      </v-col>
    </v-row>
  </v-content>
</template>

<script>
import { mapGetters } from 'vuex';
import SummaryCard from '@/components/TheSummaryCard';
import CardObject from '@/assets/scripts/utils.js';
export default {
  name: 'DummyView',

  components: {
    SummaryCard
  },

  data: () => ({
    cardObjects: []
  }),
  computed: {
    ...mapGetters(['profile'])
  },

  mounted() {
    console.log(this.cardObjects);
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