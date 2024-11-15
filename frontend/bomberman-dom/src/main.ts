import {AppComponent} from "./components/app";
import { setUpWebSocket } from "./services/setupWebsocket";

/*
This file connects to app and mounts app component to app element in html file
 */

const appEl = document.getElementById("app")!;
const appComponent = new AppComponent();
appComponent.mount(appEl)

setUpWebSocket();