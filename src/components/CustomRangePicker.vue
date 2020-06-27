<template>
  <div class="custom-range-picker">
    <v-dialog v-model="showTimePicker" class="d-flex justify-center" max-width="300">
      <v-time-picker v-model="timeStart" v-if="step === 1">
        <v-btn color="primary" @click="onTimeSelect" outlined rounded block>Apply</v-btn>
      </v-time-picker>

      <v-time-picker v-model="timeEnd" v-if="step === 2">
        <v-btn color="primary" @click="onTimeSelect" outlined rounded block>Apply</v-btn>
      </v-time-picker>
    </v-dialog>

    <v-dialog v-model="showRangePicker" max-width="300">
      <v-stepper v-model="step">
        <v-stepper-header>
          <v-stepper-step editable :complete="step > 1" step="1">Start</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 2" step="2">End</v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-date-picker v-model="dateStart" full-width no-title show-current="false">
              <v-row dense>
                <v-col class="d-flex" cols="12">
                  <v-btn icon @click="showTimePicker = true">
                    <v-icon>mdi-clock-outline</v-icon>
                  </v-btn>
                  <v-btn class="flex-grow-1 primary" @click="step = 2">Next</v-btn>
                </v-col>
                <v-col class="d-flex justify-center" cols="12">
                  <v-chip class="flew-grow-1" v-text="chipMessage.startMessage"></v-chip>
                </v-col>
              </v-row>
            </v-date-picker>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-date-picker v-model="dateEnd" full-width no-title show-current="false">
              <v-row dense>
                <v-col class="d-flex justify-center" cols="12">
                  <v-btn icon @click="showTimePicker = true">
                    <v-icon>mdi-clock-outline</v-icon>
                  </v-btn>
                  <v-btn class="flex-grow-1" color="primary" @click="onCustomRangeApply">Apply</v-btn>
                </v-col>
                <v-col class="d-flex justify-center" cols="12">
                  <v-chip class="flew-grow-1" v-text="chipMessage.endMessage"></v-chip>
                </v-col>
              </v-row>
            </v-date-picker>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-dialog>
  </div>
</template>

<script>
const DEFAULT_TIME_START = '00:00';
const DEFAULT_DATE_START = new Date().toISOString().substr(0, 10);
const DEFAULT_DATE_END = new Date().toISOString().substr(0, 10);
const DEFAULT_TIME_END = '23:59';
export default {
  name: 'CustomRangePicker',

  data: () => ({
    step: 1,
    showRangePicker: false,
    showTimePicker: false,
    timeStart: '',
    timeEnd: '',
    dateStart:
      localStorage.getItem('dateStart') &&
      localStorage.getItem('dateStart') !== 'undefined'
        ? localStorage.getItem('dateStart')
        : DEFAULT_DATE_START,
    dateEnd:
      localStorage.getItem('dateEnd') &&
      localStorage.getItem('dateEnd') !== 'undefined'
        ? localStorage.getItem('dateEnd')
        : DEFAULT_DATE_END
  }),

  computed: {
    customDateRange() {
      // Just convert the date time string to ISO 8601 format
      const start = `${this.dateStart}T${this.timeStart ||
        DEFAULT_TIME_START}+08:00`;
      const end = `${this.dateEnd}T${this.timeEnd || DEFAULT_TIME_END}+08:00`;
      const data = {
        start: new Date(start),
        end: new Date(end)
      };
      return data;
    },

    chipMessage() {
      return {
        startMessage: this.customDateRange.start.toLocaleString(),
        endMessage: this.customDateRange.end.toLocaleString()
      };
    }
  },

  watch: {
    showRangePicker() {
      // Make sure date time picking starts at step 1
      this.step = 1;
    }
  },

  methods: {
    onTimeSelect() {
      this.showTimePicker = false;
    },

    onCustomRangeNext() {
      this.chipColorStart = 'success';
      this.step = 2;
    },

    onCustomRangeApply() {
      this.showRangePicker = false;
      this.$emit('onCustomRangeApply', this.customDateRange);
      localStorage.setItem('dateStart', this.dateStart);
      localStorage.setItem('dateEnd', this.dateEnd);
      this.timeStart = null;
      this.timeEnd = null;
      this.step = 1;
    }
  }
};
</script>

<style>
</style>
