import {RouterBase} from "../../../framework";
import { InsertName } from "../components/nameInsert";

export class RoutingService extends RouterBase {
    public validPaths = ["/", "/lobby"];
    private routes: Map<string, () => void> = new Map();


    constructor() {
        super();
       //route to /
        this.addRoute("/", () => {
            const insertNameComponent = new InsertName();
            insertNameComponent.render(); // Renderdab InsertName komponenti
        });

        // // Mängu lobby tee ja renderdamisfunktsioon
        // this.addRoute("/lobby", () => {
        //     const gameLobbyComponent = new GameLobby();
        //     gameLobbyComponent.render(); // Renderdab GameLobby komponendi
        // });
    }

    //adds a path 
    public addRoute(path: string, renderFunction: () => void): void {
        this.routes.set(path, renderFunction);
        if (!this.validPaths.includes(path)) {
            this.validPaths.push(path); //add it to validpaths
        }
    }
    public navigate(path: string): void {
        if (this.validPaths.includes(path)) {
            this.setRoute(path); 
            const route = this.routes.get(path);
            if (route) {
                route(); 
            }
        } else {
            console.error(`Path ${path} is not valid.`);
        }
    }
}