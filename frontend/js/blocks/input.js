import ComponentBase from "./component.js";

export default class Input extends ComponentBase {
  constructor(props) {
    super("input", props);
    this.props.className = "input";
  }
}
