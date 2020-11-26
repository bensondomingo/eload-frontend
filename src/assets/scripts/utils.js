import { v4 as uuidv4 } from 'uuid';

export default class CardObject {
  constructor(ref, title, color, isDark) {
    this.ref = ref;
    this.title = title;
    this.color = color;
    this.isDark = isDark || true;
  }
}

class TransactionItem {
  #title;
  #subtitle;
  #status;
  constructor(transaction) {
    this.id = transaction.id;
    this.parseTitle(transaction);
    this.parseSubtitle(transaction);
    this.status = transaction.status;
    this.date = new Date(transaction.transaction_date).toLocaleString();
    this.visible = true;
  }

  get title() {
    return this.#title;
  }
  parseTitle(transaction) {
    if (transaction.transaction_type === 'sellorder')
      this.#title = transaction.phone_number.replace('+63', '0');
    else this.#title = 'CASH_IN';
  }

  get subtitle() {
    return this.#subtitle;
  }
  parseSubtitle(transaction) {
    const subtitle =
      transaction.transaction_type == 'sellorder'
        ? transaction.network.split(' ')[0]
        : transaction.payment_method;
    this.#subtitle = `P${transaction.amount} - ${subtitle}`;
  }

  get status() {
    return this.#status;
  }
  set status(value) {
    if (value === 'settled' || value === 'released') this.#status = 'success';
    else if (value === 'pending_payment') this.#status = 'pending';
    else this.#status = 'error';
  }

  show(value) {
    this.visible = value;
  }
}

class PaymentOutlet {
  #products = [];
  #productCategories = [];
  constructor(rawData) {
    this.id = rawData.id;
    this.name = rawData.name;
    this.category = rawData.outlet_category;
    this.customAmountAllowed = rawData.custom_allowed;
    this.amountLimits = rawData.amount_limits;
    this.logoUrl = rawData.logo_url;

    rawData.denominations.forEach(product => this.addProduct(product));
    rawData.products.forEach(product => this.addProduct(product));
  }

  get products() {
    return this.#products;
  }

  getProducts(category) {
    this.products.filter(product => product.category === category);
  }

  get productCategories() {
    return this.#productCategories;
  }

  addProduct(product) {
    const productItem = new ProductItem(product, this.id, this.name);
    if (!this.productCategories.includes(productItem.category))
      this.productCategories.push(productItem.category);
    this.#products.push(productItem);
  }
}

class ProductItem {
  constructor(product, outletId, outletName) {
    this.id = uuidv4();
    this.amount = parseInt(product.amount);
    this.productCode = product.code || `REG ${this.amount}`;
    this.outletId = outletId;
    this.currency = product.currency;

    // Informative
    this.category = product.category || 'Regular';
    this.name = product.name || `Regular Load ${this.amount}`;
    this.description =
      product.description ||
      `Buy ${this.amount} ${this.currency} amount of regular load.`;
    this.outletName = outletName;
  }

  // getter
  get required() {
    const fields = {
      id: this.id,
      amount: this.amount,
      outlet_id: this.outletId
    };
    if (!this.productCode.startsWith('REG'))
      fields.product_code = this.productCode;
    return fields;
  }
}

const encodeParams = paramObject =>
  Object.entries(paramObject)
    .map(kv => kv.map(encodeURIComponent).join('='))
    .join('&');

export {
  CardObject,
  encodeParams,
  PaymentOutlet,
  ProductItem,
  TransactionItem
};
