import ComponentBase from "../component.js";

export default class EndMenu extends ComponentBase {
  constructor(leaveButton, restartButton, winner) {
    super("div", { id: "end-menu" });
    this.winner = winner;
    this.leaveButton = leaveButton;
    this.restartButton = restartButton;
    this.initialize();
  }

  initialize() {
    const title = new ComponentBase("h2", { id: "end-title" }, [
      `Game over ${this.winner} wins!`,
    ]);
    const winText = new ComponentBase("p", { id: "end-prompt" }, [
      "Want to go again?",
    ]);
    const buttons = new ComponentBase("div", { id: "button-container" }, [
      this.restartButton,
      this.leaveButton,
    ]);
    this.addElement(title, winText, buttons);
  }
}
