class DateRange {
  constructor(name) {
    this.name = name;
    this.now = new Date();
    this.dateStart = new Date();
    this.dateEnd = new Date();
    this.queryObject = {};
  }

  get rangeStr() {
    if (this.dateEnd.getTime() - this.dateStart.getTime() === 0) {
      return this.dateStart.toLocaleDateString();
    } else {
      return `${this.dateStart.toLocaleDateString()} - ${this.dateEnd.toLocaleDateString()}`;
    }
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

class LastWeek extends DateRange {
  constructor() {
    super('Last Week');
    this.dateEnd.setDate(this.now.getDate() - this.now.getDay() - 1);
    this.dateStart.setDate(this.dateEnd.getDate() - 6);
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

class LastMonth extends DateRange {
  constructor() {
    super('Last Month');
    this.dateStart = new Date(this.now.getFullYear(), this.now.getMonth() - 1);
    this.dateEnd = new Date(
      this.now.getFullYear(),
      this.dateStart.getMonth() + 1
    );
    this.dateEnd.setDate(this.dateEnd.getDate() - 1);
    this.queryObject = {
      transaction_date__year: this.dateStart.getFullYear(),
      transaction_date__month: this.dateStart.getMonth() + 1
    };
  }
}

class CustomRange extends DateRange {
  constructor() {
    super('Custom Range');
    this.queryObject = {
      transaction_date__gte: this.dateStart.toLocaleDateString(),
      transaction_date__lt: this.dateEnd.toLocaleDateString()
    };
  }
  updateQueryObject() {
    if (this.dateEnd.getTime() - this.dateStart.getTime() > 0) {
      this.queryObject = {
        transaction_date__gte: this.dateStart.toLocaleDateString(),
        transaction_date__lt: this.dateEnd.toLocaleDateString()
      };
    } else {
      this.queryObject = {
        transaction_date__day: this.dateStart.getDate(),
        transaction_date__month: this.dateStart.getMonth() + 1,
        transaction_date__year: this.dateStart.getFullYear()
      };
    }
  }
}

const dateRangeList = [
  new Today(),
  new Yesterday(),
  new ThisWeek(),
  new LastWeek(),
  new ThisMonth(),
  new LastMonth(),
  new CustomRange()
];

export { dateRangeList };
