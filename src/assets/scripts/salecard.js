export default class Summary {
  constructor(ref, title, color, isDark) {
    this.ref = ref;
    this.title = title;
    this.color = color;
    this.isDark = isDark || true;
  }
}
