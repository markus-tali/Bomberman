import ComponentBase from "./component.js";
import Form from "./form.js";
import Input from "./input.js";
import { getFormValues } from "../runner/engine.js";

export default class BootMenu extends ComponentBase {
  constructor() {
    super("div", { className: "bootMenu" });
  }

  async initialize(resolve, reject) {
    const maxCharacters = 10;
    const title = new ComponentBase("h1", { id: "title" }, ["Bomberman"]);
    const errorMessage = new ComponentBase("p", {
      id: "error-msg",
      style: "color: red",
    });
    const text = `How do you want to be called?`;
    const queryText = new ComponentBase("p", {}, [text]);
    const message = new ComponentBase("span", {}, [
      `(max.${maxCharacters} characters)`,
    ]);
    const username = new Input({
      id: "field",
      type: "text",
      placeholder: "Username",
      name: "boot-menu-username",
      value: "",
    });
    const submit = new Input({
      id: "submitBtn",
      type: "submit",
      name: "boot-menu-submit",
      value: "Submit",
    });
    const bootForm = new Form(
      { id: "form" },
      title,
      queryText,
      message,
      errorMessage,
      username,
      submit
    );

    bootForm.actionListener("submit", (event) => {
      const username = getFormValues(event)["boot-menu-username"];
      this.sendUsername(username).then(async (res) => {
        if (res.ok) resolve(username);
        else {
          const errorText = await res.text();
          errorMessage.children = [errorText];
          errorMessage.updateContent();
        }
      });
    });

    this.addElement(bootForm);
    this.render();
  }

  async sendUsername(username) {
    return fetch(`http://localhost:8080/api/join`, {
      method: "POST",
      body: JSON.stringify({ username }),
    });
  }
}
