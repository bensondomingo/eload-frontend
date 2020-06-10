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
              @input="customRangeStep = 2"
              full-width
              no-title
            ></v-date-picker>
          </v-stepper-content>

          <v-stepper-content step="2">
            <div class="d-flex flex-column"></div>
            <v-date-picker v-model="customRangeEnd" full-width no-title></v-date-picker>
            <v-btn color="primary" @click="onApplyCustomRange">Apply</v-btn>
            <v-btn text @click="customRangeStep = 1">Back</v-btn>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'CustomRangePicker',
  
  date() {
    return {
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
          : new Date().toISOString().substr(0, 10)
    };
  }
};
</script>

<style>
</style>
