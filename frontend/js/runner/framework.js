import RouterBase from "../routing/routing.js";

import { virtualNode, render, nodeDifference, applyPatch } from "./engine.js";

export default class Framework {
  constructor() {
    this.validRoutes = [];

    this.router = new RouterBase(this);

    this._componentNodes = [];

    this.prevNode = {};
    this._initialize();
  }

  _initialize() {
    this.prevNode = virtualNode(
      "main",
      { id: "root" },
      ...this._componentNodes
    );
    const initNode = render(this.prevNode);
    document.body.appendChild(initNode);
  }

  setRoutes(routes) {
    this.router.init(routes);
  }

  bindLink(component, href) {
    const route = {};
    this.validRoutes.push((route[href] = component));
    component.actionListener("click", () => {
      this.router.navigateTo(href);
    });
  }

  async addComponent(component) {
    this._componentNodes.push(component);
    await this.renderNode(component);
  }

  async clear() {
    this._componentNodes.length = 0;
    await this.renderNode();
  }

  async replaceComponent(component) {
    this.clear();
    this.addComponent(component);
  }

  async renderNode() {
    const newNode = virtualNode(
      "main",
      { id: "root" },
      ...this._componentNodes
    );
    const patches = nodeDifference(this.prevNode, newNode);
    await applyPatch(document.body.lastChild, patches);
    this.prevNode = newNode;
  }
}
