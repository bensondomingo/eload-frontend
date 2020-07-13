export default class CardObject {
  constructor(ref, title, color, isDark) {
    this.ref = ref;
    this.title = title;
    this.color = color;
    this.isDark = isDark || true;
  }
}

class TransactionItem {
  constructor(transaction) {
    this.id = transaction.id;
    this.title =
      transaction.transaction_type == 'sell_order'
        ? transaction.phone_number.replace('+63', '0')
        : 'CASH IN';
    const subtitle =
      transaction.transaction_type == 'sell_order'
        ? transaction.network.split(' ')[0]
        : transaction.payment_method;
    this.subtitle = subtitle + ' / P' + transaction.amount;
    this.status = transaction.status === 'success' ? 'success' : 'refunded';
    this.date = new Date(transaction.transaction_date).toLocaleString();
    this.visible = true;
  }

  show(value) {
    this.visible = value;
  }
}

const encodeParams = paramObject =>
  Object.entries(paramObject)
    .map(kv => kv.map(encodeURIComponent).join('='))
    .join('&');

export { CardObject, TransactionItem, encodeParams };
