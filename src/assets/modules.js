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

export { SaleCardObject };
