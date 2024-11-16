import {ComponentBase, createEl} from "../../../framework"
import {AppHomeComponent} from "./appHome.ts";
import {RoutingService} from "../services/routingService.ts";
import {AppHeaderComponent} from "./appHeader.ts";
import { InsertName } from "./nameInsert.ts";

/*
Main app component, here you call for all the services and for header and home components
 */

export class AppComponent extends ComponentBase {
    private readonly routingService: RoutingService = new RoutingService();

    constructor() {
        super("App");

        this.updateContent();
    }

    public updateContent() {
        window.onpopstate = this.routingService.handleLocation
        if (this.routingService.validPaths.includes(window.location.pathname)) {
            this.replaceContent([
                [new AppHeaderComponent(this.routingService), []],
                [new AppHomeComponent(this.routingService), []],
                [new InsertName(), []]
            ])
        } else {
            this.replaceContent([
                [new AppHeaderComponent(this.routingService), []],
                [createEl("div", {className: "title"}, [`You have reached ${window.location.pathname}. Unfortunately there is nothing here.`]) ,[
                    [createEl("a", {onClick: () => history.back()}, ["Go Back"]),[]],
                ]]
                
            ])
        }
    }
}