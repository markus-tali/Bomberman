import { nodeDifference, applyPatch, render } from "../runner/engine.js";
export default class ComponentBase {
  constructor(tag, props = {}, children = [], parent = null) {
    this.tag = tag;
    this.props = props;
    this.children = children;
    this.parent = parent;
    this.domNode = render(this);
  }
  addClassName(...classList) {
    this.props.className += " " + classList.join(" ");
  }

  rmClassName(cl) {
    this.props.className = this.props.className
      .split(" ")
      .filter((el) => {
        return el !== cl;
      })
      .join(" ");
  }

  addElement(...children) {
    this.children.push(...children);
  }

  removeElement(...children) {
    this.children = this.children.filter((child) => !children.includes(child));
  }

  replaceChildren(c1, c2) {
    this.children = this.children.filter((c) => c !== c1);
    this.addElement(c2);
  }

  render() {
    return "";
  }

  updateDOMNodes(callback = () => {}) {
    this.oldNode = this.domNode;
    callback();
    const patches = nodeDifference(this.oldNode, this);
    const rootNode = document.getElementById(this.props.id);
    applyPatch(rootNode, patches);
    this.domNode = render(this);
  }

  updateContent() {
    this.updateDOMNodes();
  }

  actionListener(eventType, func) {
    this.props[`on${eventType}`] = (event) => {
      event.preventDefault();
      if (eventType === "submit") {
        func(event.target);
        event.target.reset();
      } else {
        func(event);
      }
    };
  }

  delete(child) {
    this.children = this.children.filter(
      (element) => element.props.id !== child
    );
    this.updateContent();
  }

  clear() {
    this.children = [];
    this.updateContent();
  }

  clone() {
    const clone = new ComponentBase(this.tag, this.props, this.children);
    clone.children = this.children.map((child) => child.clone());
    clone.parent = this.parent;
    return clone;
  }

  updateStyle(style) {
    if (document.getElementById(this.props.id)) {
      document.getElementById(this.props.id).style = style;
    }
  }

  getParent() {
    return this.parent;
  }
}
