import * as PIXI from "pixi.js";
import * as Matter from 'matter-js';

import { Loader } from "./Loader";
import { ScenesManager } from "./ScenesManager";

class Application {
    run(config) {
        this.config = config;
        this.app = new PIXI.Application({ resizeTo: window });
        globalThis.__PIXI_APP__ = this.app;
        document.body.appendChild(this.app.view);

        this.loader = new Loader(this.app.loader, this.config);
        this.loader.preload().then(() => this.start());

        this.scenes = new ScenesManager();
        this.app.stage.interactive = true;
        this.app.stage.addChild(this.scenes.container);

        this.createPhysics();
    }

    start() {
        this.scenes.start("Game");
    }

    sprite(key) {
        const res = this.res(key);
        return new PIXI.Sprite(res);
    }

    res(key) {
        return this.loader.resources[key].texture;
    }

    createPhysics() {
        this.physics = Matter.Engine.create();
        const runner = Matter.Runner.create();
        Matter.Runner.run(runner, this.physics);
    }
}

export const App = new Application();