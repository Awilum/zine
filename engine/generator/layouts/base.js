export class Layout {
  constructor(name) {
    this.name = name;
  }
  validate() {}
  render() {
    throw new Error(`Layout ${this.name} must implement render()`);
  }
}
