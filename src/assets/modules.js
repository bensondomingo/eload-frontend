String.prototype.capitalize = function() {
  return this.split(' ').forEach(el => el[0].toUpperCase + this.slice(1));
};

class SaleCardObject {
  constructor(ref, title, color, isDark) {
    this.ref = ref;
    this.title = title;
    this.color = color;
    this.isDark = isDark || true;
  }
}

class DateRange {
  constructor(name) {
    this.name = name;
    this.now = new Date();
    this.dateStart = new Date();
    this.dateEnd = new Date();
    this.queryObject = {};
  }
}

class Today extends DateRange {
  constructor() {
    super('Today');
    this.queryObject = {
      transaction_date__day: this.dateStart.getDate(),
      transaction_date__month: this.dateStart.getMonth() + 1,
      transaction_date__year: this.dateStart.getFullYear()
    };
  }
}

class Yesterday extends DateRange {
  constructor() {
    super('Yesterday');
    this.dateStart.setDate(this.now.getDate() - 1);
    this.dateEnd = this.dateStart;
    this.queryObject = {
      transaction_date__day: this.dateStart.getDate(),
      transaction_date__month: this.dateStart.getMonth() + 1,
      transaction_date__year: this.dateStart.getFullYear()
    };
  }
}

class ThisWeek extends DateRange {
  constructor() {
    super('This Week');
    this.dateStart.setDate(this.now.getDate() - this.now.getDay());
    this.dateEnd.setDate(this.now.getDate() + (6 - this.now.getDay()));
    this.queryObject = {
      transaction_date__gte: this.dateStart.toLocaleDateString(),
      transaction_date__lt: this.dateEnd.toLocaleDateString()
    };
  }
}

class ThisMonth extends DateRange {
  constructor() {
    super('This Month');
    this.dateStart = new Date(this.now.getFullYear(), this.now.getMonth());
    this.dateEnd = new Date(this.now.getFullYear(), this.now.getMonth() + 1, 0);
    this.queryObject = {
      transaction_date__year: this.dateStart.getFullYear(),
      transaction_date__month: this.dateStart.getMonth() + 1
    };
  }
}

export { SaleCardObject, Today, Yesterday, ThisWeek, ThisMonth };
