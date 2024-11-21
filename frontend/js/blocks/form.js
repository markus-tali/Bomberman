import ComponentBase from "./component.js";

export default class Form extends ComponentBase {
  constructor(props, ...inputs) {
    super("form", props);
    this.props.className = "form";
    return this.init(...inputs);
  }

  init(...inputs) {
    const form = this.addElement(...inputs);
    return form;
  }
}
