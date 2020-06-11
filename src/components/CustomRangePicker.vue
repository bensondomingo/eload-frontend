<template>
  <div class="custom-range-picker">
    <v-dialog v-model="showRangePicker" width="500">
      <v-stepper v-model="customRangeStep">
        <v-stepper-header>
          <v-stepper-step editable :complete="customRangeStep > 1" step="1">Start</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="customRangeStep > 2" step="2">End</v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-date-picker
              v-model="customRangeStart"
              full-width
              no-title
              show-current="false"
              @input="chipColorStart = 'success'"
            >
              <v-btn class="flex-grow-1" color="primary" @click="customRangeStep = 2">Next</v-btn>
              <v-btn class="flex-grow-1" text @click="showRangePicker = false">Cancel</v-btn>
            </v-date-picker>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-date-picker
              v-model="customRangeEnd"
              full-width
              no-title
              show-current="false"
              @input="chipColorEnd = 'success'"
            >
              <v-btn class="flex-grow-1" color="primary" @click="onApplyCustomRange">Apply</v-btn>
              <v-btn class="flex-grow-1" text @click="customRangeStep = 1">Back</v-btn>
            </v-date-picker>
          </v-stepper-content>

          <div class="d-flex justify-space-around align-center pb-3">
            <v-chip
              class="flew-grow-1"
              :color="chipColorStart"
            >{{ new Date(customRangeStart).toLocaleDateString() }}</v-chip>
            <v-chip
              class="flew-grow-1"
              :color="chipColorEnd"
            >{{ new Date(customRangeEnd).toLocaleDateString() }}</v-chip>
          </div>
        </v-stepper-items>
      </v-stepper>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'CustomRangePicker',

  data: () => ({
    showRangePicker: false,
    customRangeStep: 1,
    customRangeStart:
      localStorage.getItem('customRangeStart') &&
      localStorage.getItem('customRangeStart') !== 'undefined'
        ? localStorage.getItem('customRangeStart')
        : new Date().toISOString().substr(0, 10),
    customRangeEnd:
      localStorage.getItem('customRangeEnd') &&
      localStorage.getItem('customRangeEnd') !== 'undefined'
        ? localStorage.getItem('customRangeEnd')
        : new Date().toISOString().substr(0, 10),
    chipColorStart: 'grey lighten-3',
    chipColorEnd: 'grey lighten-3'
  }),

  computed: {
    customDateRange() {
      // Just convert the date string to Date object
      return {
        start: new Date(this.customRangeStart),
        end: new Date(this.customRangeEnd)
      };
    }
  },

  methods: {
    onApplyCustomRange() {
      this.customRangeStep = 1;
      this.showRangePicker = false;
      localStorage.setItem('customRangeStart', this.customRangeStart);
      localStorage.setItem('customRangeEnd', this.customRangeEnd);
      this.chipColorStart = 'grey lighten-3';
      this.chipColorEnd = 'grey lighten-3';

      this.$emit('onApplyCustomRange', this.customDateRange);
    }
  }
};
</script>

<style>
</style>
