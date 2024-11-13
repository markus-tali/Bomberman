import {RouteModel} from "./models.ts";

export class RouterBase {
    private _currentRoute: RouteModel = {pathName: "/"};
    private routeListeners: Map<number, (value: RouteModel) => void> = new Map();
    public validPaths: Array<string> = [];

    public get currentRoute(): RouteModel {
        return this._currentRoute;
    }

    public set currentRoute(value: RouteModel) {
        this._currentRoute = value
        this.routeListeners.forEach(listener => listener(value));
    }

    constructor() {
    }

    public setRoute(path: string) {
        this.currentRoute = {pathName: path};
        window.history.pushState({}, "", path);
    }

    public handleLocation = ()=> {
        const location = window.location.pathname;
        this.setRoute(location);
    }

    public attachRouteListener(id: number, callback: (value: RouteModel) => void) {
        this.routeListeners.set(id, callback);
    }

    public detachRouteListener(id: number) {
        this.routeListeners.delete(id);
    }
}