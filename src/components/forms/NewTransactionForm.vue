<template>
  <v-row dense>
    <v-col cols="12">
      <v-form class="mb-4" v-model="isNumberValid" ref="numberForm" lazy-validation>
        <v-text-field
          ref="number"
          v-model="number"
          append-icon="mdi-send"
          label="Phone Number"
          hint="Enter 10 digit number"
          color="primary"
          prefix="+63"
          type="number"
          maxlength="10"
          counter
          clearable
          :loading="numberInputLoading"
          :error-messages="numberErrors"
          :disabled="numberInputDisabled"
          @click:clear="onClearNumber"
          @focus="onClearErrors"
          @click:append="onValidatenumber"
        ></v-text-field>
      </v-form>

      <!-- Snack bar for displaying custom messages -->
      <v-snackbar v-model="snackbar" timeout="-1">
        {{ snackbarText }}
        <template v-slot:action="{ attrs }">
          <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">Close</v-btn>
        </template>
      </v-snackbar>

      <!-- Select product -->
      <v-dialog
        v-model="selectProductDialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card>
          <!-- Toolbar section -->
          <v-toolbar color="#2a9d8f" dark>
            <v-toolbar-title>Select Product</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon dark @click="onCloseProductSelect">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <!-- Contents -->
          <div class="pa-4" v-if="paymentOutlet">
            <!-- Category Selector -->
            <v-img max-height="70" :src="paymentOutlet.logoUrl" contain></v-img>
            <v-form ref="categorySelectForm">
              <v-select
                class="text-uppercase"
                v-model="category"
                label="Product Category"
                hint="Select product category"
                persistent-hint
                :items="paymentOutlet.productCategories"
              ></v-select>
              <v-text-field
                v-model="customAmount"
                type="number"
                label="Amount"
                append-icon="mdi-send"
                :rules="customAmountRules"
                :hint="customAmountHint"
                v-if="paymentOutlet.customAmountAllowed && category === 'Regular'"
                @click:append="onProductSelect('0')"
              ></v-text-field>
            </v-form>

            <!-- Product Options -->
            <v-list id="product-list" max-height="60vh" two-line v-if="products">
              <v-list-item
                v-for="product in products"
                :key="product.id"
                color="grey darken-1"
                @click="onProductSelect(product.id)"
                dense
              >
                <!-- Product Info -->
                <v-list-item-content>
                  <v-list-item-title class="title" v-text="product.productCode"></v-list-item-title>
                  <v-list-item-subtitle v-text="product.description"></v-list-item-subtitle>
                </v-list-item-content>
                <!-- Show Description -->
                <v-list-item-action>
                  <v-btn icon @click.prevent.stop="onShowTooltip">
                    <v-icon color="grey lighten-1">mdi-information</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>

            <!-- Confirmation dialog -->
            <v-dialog v-model="confirmDialog" v-if="product">
              <v-card :loading="confirmCardLoading" max-length="300">
                <!-- Outlet image -->
                <v-img class="align-end" max-height="150px" :src="paymentOutlet.logoUrl" contain></v-img>
                <!-- Title -->
                <v-card-title>
                  <v-spacer></v-spacer>
                  <span class="headline">+63{{ number }}</span>
                </v-card-title>
                <v-card-subtitle class="text-right">{{ product.productCode }}</v-card-subtitle>
                <!-- Body -->
                <v-card-text v-if="!orderConfiremed">{{ product.name }}. {{ product.description }}</v-card-text>
                <v-card-text v-else>
                  <span class="text-h4">Success!</span>
                  <v-icon>check-circle-outline</v-icon>
                  <br />Thank you for using
                  <span class="font-weight-light">Load</span>
                  <span class="font-weight-bold">Ninja</span>. You will receive notification shortly.
                </v-card-text>
                <!-- Buttons -->
                <v-card-actions v-if="!orderConfiremed">
                  <v-spacer></v-spacer>
                  <v-btn color="grey darken-1" text @click="confirmDialog = false">Cancel</v-btn>
                  <v-btn color="green darken-1" text @click="onConfirmBuy">Confirm</v-btn>
                </v-card-actions>
                <v-card-actions v-else>
                  <v-spacer></v-spacer>
                  <v-btn color="green darken-1" text @click="onTransactionDone">Done</v-btn>
                </v-card-actions>
              </v-card>

              <v-card></v-card>
            </v-dialog>
          </div>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
import { PaymentOutlet, ProductItem } from '@/assets/scripts/utils.js';

export default {
  name: 'NewTransactionForm',
  data: () => ({
    isNumberValid: false,
    number: '',
    numberInputLoading: false,
    numberInputDisabled: false,
    numberErrors: [],
    snackbar: false,
    snackbarText: '',
    selectProductDialog: false,
    category: null,
    paymentOutlet: null,
    product: null,
    customAmount: null,
    confirmDialog: false,
    confirmCardLoading: false,
    orderConfiremed: false
  }),

  computed: {
    products() {
      if (!this.paymentOutlet.products) return null;
      return this.paymentOutlet.products.filter(
        product => product.category == this.category
      );
    },

    numberFormatted() {
      if (!this.number) return null;
      return `+63${this.number}`;
    },

    customAmountRules() {
      const rules = [];
      const minMax = v =>
        this.customAmountLimit.minimum <= v &&
        v <= this.customAmountLimit.maximum
          ? true
          : 'Invalid amount range';
      rules.push(minMax);
      return rules;
    },

    customAmountLimit() {
      if (!this.paymentOutlet.customAmountAllowed) return null;
      return this.paymentOutlet.amountLimits.find(
        limit => limit.currency === 'PHP'
      );
    },

    customAmountHint() {
      if (!this.paymentOutlet.customAmountAllowed) return '';
      return `Enter custom amount [${this.customAmountLimit.minimum} - ${this.customAmountLimit.maximum}]`;
    }
  },

  methods: {
    onValidatenumber() {
      this.numberErrors = [];
      if (!this.number) {
        this.numberErrors.push('Please enter phone number');
        return;
      }
      if (!this.number.startsWith('9'))
        this.numberErrors.push('Input should start with 9');
      if (this.number.length !== 10)
        this.numberErrors.push('Input should be 10 digit length');
      if (this.numberErrors.length) return;

      this.setNumberInputLoading(true);
      const params = { phone_number: this.numberFormatted };
      this.$http
        .get('/cphapp/api/buy-product/', { params })
        .then(resp => {
          setTimeout(() => {
            console.log(resp);

            // Update products
            this.paymentOutlet = new PaymentOutlet(resp.data);
            console.log(this.paymentOutlet);
            this.setNumberInputLoading(false);
            this.selectProductDialog = true;
          }, 2000);
        })
        .catch(err => {
          this.setNumberInputLoading(false);
          if (err.response) {
            console.log(err.response);
            if (err.response.status === 400) {
              this.numberErrors = [...err.response.data];
            } else if (err.response.status === 401) {
              // Handle non authenticated
            } else if (err.response.status === 500) {
              console.log(err.response.statusText);
              this.numberErrors.push('Something went wrong');
              this.snackbarText =
                err.response.statusText + '. Please try again later.';
              this.snackbar = true;
            } else {
              // Handle other errors here
            }
          } else if (err.request) {
            console.log(err.request);
          } else {
            console.log(err.message);
          }
        });
    },

    setNumberInputLoading(value) {
      this.numberInputLoading = value;
      this.numberInputDisabled = value;
    },

    onClearNumber() {
      this.$refs.numberForm.resetValidation();
      this.onClearErrors();
      this.dataReset();
    },

    onClearErrors() {
      this.snackbar = false;
      this.snackbarText = '';
      this.numberErrors = [];
    },

    onShowTooltip() {},

    onProductSelect(productId = null) {
      if (productId === '0') {
        console.log(this.customAmount);
        if (!this.$refs.categorySelectForm.validate()) {
          return;
        }
        const product = {
          amount: this.customAmount,
          outletId: this.paymentOutlet.id,
          currency: 'PHP'
        };
        this.product = new ProductItem(
          product,
          this.paymentOutlet.id,
          this.paymentOutlet.name
        );
      } else {
        this.product = this.products.find(product => product.id === productId);
      }
      console.log(this.product);
      this.confirmDialog = true;
    },

    onConfirmBuy() {
      this.confirmCardLoading = 'primary';

      // Make post request
      const endpoint = '/cphapp/api/transactions/';
      const data = {
        ...this.product.required,
        phone_number: this.numberFormatted
      };
      this.$http
        .post(endpoint, data)
        .then(resp => {
          console.log(resp);
          this.orderConfiremed = true;
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => (this.confirmCardLoading = false));
    },

    onCloseProductSelect() {
      this.selectProductDialog = false;
      this.dataReset();
    },

    onTransactionDone() {
      this.dataReset();
    },

    dataReset() {
      Object.assign(this.$data, this.$options.data());
    }
  }
};
</script>

<style scoped>
#product-list {
  overflow-y: scroll !important;
}
</style>