import {ComponentBase, ContentNode, createEl} from "../../../framework";
import {RoutingService} from "../services/routingService.ts";

export class AppHeaderComponent extends ComponentBase {

    constructor(routingService: RoutingService) {
        super("AppHeader");

        const headerContent: Array<ContentNode> = [
            [createEl("div", {className: "logo"}, [
                createEl("a", {onClick: () => routingService.setRoute("/")}, ["bomberman_dom"]),
            ]), []],

        ]

        this.replaceContent([
            [createEl('div', {className: "container container-wide"}), headerContent],
        ])

        //language=CSS
        this.injectStyle(`
            & {
                background: #ffffff;
            }
            
            a {
                margin-left: 20px;
            }

            .container {
                display: flex;
                height: 80px;
                align-items: center;
            }

            .logo {
                font-size: 20px;
                font-weight: bold;
                color: #5910c8;
                flex: 0 0 auto;
            }

            .spacer {
                flex: 1 1 auto;
            }
            
            .name {
                margin-right: 10px;
            }

            .button {
                flex: 0 0 auto;
            }
        `);
    }
}