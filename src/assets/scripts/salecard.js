class SaleCardObject {
  constructor(ref, title, color, isDark) {
    this.ref = ref;
    this.title = title;
    this.color = color;
    this.isDark = isDark || true;
  }
}

export { SaleCardObject };
