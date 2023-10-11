import * as PIXI from "pixi.js";
import { Loader } from "./Loader";

class Application {
    run(config) {
        this.config = config;
        this.app = new PIXI.Application({ resizeTo: window });
        globalThis.__PIXI_APP__ = this.app;
        document.body.appendChild(this.app.view);

        this.loader = new Loader(this.app.loader, this.config);
        this.loader.preload().then(() => this.start());
    }

    start() {
        this.scene = new this.config["startScene"]();
        this.app.stage.addChild(this.scene.container);
    }

    sprite(key) {
        const res = this.loader.resources[key].texture;
        return new PIXI.Sprite(res);
    }
}

export const App = new Application();