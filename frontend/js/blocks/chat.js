import ComponentBase from "./component.js";
import Input from "./input.js";
import Form from "./form.js";
import { getFormValues } from "../runner/engine.js";

export default class Chat extends ComponentBase {
  constructor(props, ws, username) {
    super("section", props);
    this.ws = ws;
    this.username = username;
    this.messages = [];
    this.#init();
    this.#receive();
    return this;
  }

  #init() {
    const input = new Input({
      id: "chat-input",
      placeholder: "Enter message",
      type: "text",
      name: "input",
    });
    input.actionListener("focus", () => this.ws.sendMessage({ type: "lock" }));
    input.actionListener("blur", () => this.ws.sendMessage({ type: "unlock" }));
    const form = new Form({ id: "chat-form" }, input);
    form.actionListener("submit", (e) => {
      const data = getFormValues(e).input;
      this.ws.sendMessage({ type: "chat", body: data, sender: this.username });
    });
    this.addElement(form);
  }

  #receive() {
    const chatBox = new ComponentBase("div", { id: "chat-box" });
    this.ws.onMessage((data) => {
      let chatElement;
      switch (data.type) {
        case "join":
          chatElement = new ComponentBase("p", {
            id: "chat-element",
            className: "chat-element-join",
          });
          chatElement.children.push(data.body);
          break;
        case "leave":
          chatElement = new ComponentBase("p", {
            id: "chat-element",
            className: "chat-element-leave",
          });
          chatElement.children.push(data.body);
          break;
        case "chat":
          chatElement = new ComponentBase("p", {
            id: "chat-element",
            className: "chat-element",
          });
          const sender = new ComponentBase(
            "span",
            { className: "chat-sender" },
            [`<${data.sender}> : `]
          );
          chatElement.addElement(sender, data.body);
          break;
        default:
          return;
      }
      chatBox.addElement(chatElement);
      chatBox.updateContent();
    });
    this.addElement(chatBox);
  }
}
