import * as Matter from 'matter-js';

import { App } from '../system/App';
import { Background } from "./Background";
import { Scene } from '../system/Scene';
import { Hero } from "./Hero";
import { Platforms } from "./Platforms";
import { LabelScore } from './LabelScore';

export class GameScene extends Scene {
    create() {
        this.score = 0;
        this.createBackground();
        this.createPlatforms();
        this.createHero();
        this.setEvents();
        this.createUI();
    }

    createUI() {
        this.labelScore = new LabelScore();
        this.container.addChild(this.labelScore);
    }

    createBackground() {
        this.bg = new Background();
        this.container.addChild(this.bg.container);
    }

    createPlatforms() {
        this.platforms = new Platforms();
        this.container.addChild(this.platforms.container);
    }

    createHero() {
        this.hero = new Hero();
        this.container.addChild(this.hero.sprite);
        this.container.interactive = true;

        this.container.on("pointerdown", () => {
            this.hero.startJump();
        });

        this.hero.sprite.once("die", () => {
            App.scenes.start("Game");
        });
    }

    update(dt) {
        this.bg.update(dt);
        this.platforms.update(dt);
        this.hero.update(dt);
    }

    setEvents() {
        Matter.Events.on(App.physics, 'collisionStart', this.onCollisionStart.bind(this));
    }

    onCollisionStart(event) {
        const colliders = [event.pairs[0].bodyA, event.pairs[0].bodyB];
        const hero = colliders.find(body => body.gameHero);
        const platform = colliders.find(body => body.gamePlatform);
        const diamond = colliders.find(body => body.gameDiamond);

        if (hero && platform) {
            this.hero.stayOnPlatform(platform.gamePlatform);
        }

        if (hero && diamond) {
            this.score++;
            this.hero.collectDiamond(diamond.gameDiamond);
            this.labelScore.renderScore(this.score);
        }
    }

    destroy() {
        Matter.Events.off(App.physics, 'collisionStart', this.onCollisionStart.bind(this));
        App.app.ticker.remove(this.update, this);
        this.bg.destroy();
        this.hero.destroy();
        this.platforms.destroy();
        this.labelScore.destroy();
    }
}