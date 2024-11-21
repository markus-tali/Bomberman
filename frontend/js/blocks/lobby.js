import ComponentBase from "./component.js";

export default class WaitingRoom extends ComponentBase {
  constructor(ws, currentPlayer) {
    super("section", { id: "waitingRoom" });
    this.ws = ws;
    this.playerList = new ComponentBase("ul", { id: "playerList" });
    this.playersCount = new ComponentBase("div", { id: "playersCount" });
    this.started = false;
    this.countDownID;
    this.countDown = 0;
    this.resolve;
    this.reject;
    this.currentPlayer = currentPlayer;
    this.counter = new ComponentBase("div", { className: "countDown" }, [""]);
  }

  #receive() {
    this.ws.onMessage((message) => {
      switch (message.type) {
        case "join":
        case "leave":
          if (!this.started) this.newPlayerJoin(message.connected);
          break;
        case "update-timer":
          if (!this.started) {
            console.log(message.body);
            if (message.body === 0) {
              this.started = true;
              this.resolve();
            }
            if (message.body === -1) {
              this.counter.children = [" "];
            } else {
              if (message.body <= 10) {
                this.counter.children = [message.body.toString()];
              } else {
                this.counter.children = [""];
              }
            }
            this.updateContent();
          }
          break;
      }
    });
  }

  initialize(resolve, reject) {
    this.resolve = resolve;
    this.reject = reject;
    this.#receive();
    this.addElement(this.playersCount);
    this.addElement(this.playerList);
    this.addElement(this.counter);
  }

  stopCountDown() {
    if (this.countDownID) {
      clearInterval(this.countDownID);
      this.countDownID = null;
      this.counter.children = [""];
      this.started = false;
      this.updateContent();
    }
  }

  newPlayerJoin(...players) {
    this.playerList.children = [];
    players.flat().forEach((playerUsername) => {
      const player = new ComponentBase("li", { className: "player" }, [
        playerUsername,
      ]);
      this.playerList.addElement(player);
      this.playerList.updateContent();
    });
    this.playersCount.updateContent();
  }
}
