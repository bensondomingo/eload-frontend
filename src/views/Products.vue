<template>
  <v-container>
    <v-list two-line>
      <v-list-item
        v-for="product in productList"
        :key="product.id"
        @click.stop.prevent="onProductClick(product)"
      >
        <v-list-item-content>
          <v-list-item-title v-text="product.id"></v-list-item-title>
          <v-list-item-subtitle
            v-text="product.name + ' | ' + product.validity"
          ></v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action class="flex-row align align-center">
          <v-checkbox
            :ref="product.id"
            @click.stop.prevent="onIsActiveToggle(product)"
            :input-value="product.is_active"
          ></v-checkbox>
          <v-btn icon @click.stop.prevent="onProductDelete(product.id)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <v-dialog v-model="showDetail">
      <v-card flat>
        <v-card-title>
          <span>Product Detail</span>
          <v-spacer></v-spacer>
          <v-btn @click="onDetailClose" icon>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form flat>
            <v-text-field :value="product.name" label="Name"></v-text-field>
            <v-text-field :value="product.id" label="Code"></v-text-field>
            <v-text-field
              :value="product.outlet_id"
              label="Outlet"
            ></v-text-field>
            <v-text-field
              :value="product.validity"
              label="Validity"
            ></v-text-field>
            <v-textarea
              :value="product.description"
              label="Description"
              row-height="6"
              auto-grow
              readonly
            ></v-textarea>
            <v-text-field v-model="newCategory" label="Category"></v-text-field>
            <v-checkbox v-model="newState" label="Active"></v-checkbox>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="onDetailClose" text>Close</v-btn>
          <v-btn
            @click="onProductUpdate"
            :disabled="
              product.category === newCategory && product.is_active === newState
            "
            >Update</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'Products',

  data: () => ({
    showDetail: false,
    product: {},
    productList: [],
    newCategory: null,
    newState: null
  }),

  computed: {
    activeProducts() {
      return this.productList.filter(el => !!el.is_active);
    }
  },

  methods: {
    fetchProducts(queryParams = { limit: 300, offset: 0 }) {
      const endpoint = '/cphapp/api/products/';
      console.log(endpoint, queryParams);
      this.$http
        .get(endpoint, { params: queryParams })
        .then(resp => {
          console.log(resp);
          this.productList.push(...resp.data.results);

          if (resp.data.next) {
            const uri = decodeURIComponent(resp.data.next);
            const queryParams = Object.fromEntries(
              uri
                .split('?')[1]
                .split('&')
                .map(el => el.split('='))
            );
            this.fetchProducts(queryParams);
          }
        })
        .catch(err => console.log(err));
    },

    onProductClick(product) {
      console.log(product);
      this.newCategory = product.category;
      this.newState = product.is_active;
      this.product = product;
      this.showDetail = true;
    },

    onIsActiveToggle(product) {
      product.is_active = !product.is_active;
      this.$http
        .put(`/cphapp/api/products/${product.id}/`, product)
        .then(resp => console.log(resp))
        .catch(err => console.log(err));
    },

    onDetailClose() {
      this.showDetail = false;
      this.product = {};
    },

    onProductUpdate() {
      this.product.is_active = this.newState;
      this.product.category = this.newCategory;

      this.$http
        .put(`/cphapp/api/products/${this.product.id}/`, this.product)
        .then(resp => {
          console.log(resp);
          this.onDetailClose();
        })
        .catch(err => console.log(err));
    },

    onProductDelete(productID) {
      this.$http
        .delete(`/cphapp/api/products/${productID}/`)
        .then(resp => {
          console.log(resp);
          this.productList = this.productList.filter(p => p.id !== productID);
        })
        .catch(err => console.log(err));
    }
  },

  created() {
    this.productList = [];
    this.fetchProducts();
  }
};
</script>

<style></style>
