import {ComponentBase, createEl} from "../../../framework";
import {ContentNode} from "../../../framework";
import {RoutingService} from "../services/routingService.ts";

export class AppHomeComponent extends ComponentBase {
    private readonly routingService: RoutingService;

    constructor( routingService: RoutingService) {
        super("AppHome");

        this.routingService = routingService;

        this.updateContent();

        //language=CSS
        this.injectStyle(`
        
        `);
    }

    public updateContent() {
        const content: Array<ContentNode> = [
            [createEl("div", {className: "title-large"}, [this.routingService.currentRoute.pathName]), []],
        ];

        this.replaceContent([
            [createEl("div", {className: "container container-narrow"}), content],
        ])
    }
}