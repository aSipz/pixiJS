import { Tools } from "../system/Tools";
import { GameScene } from "./Game";

export const Config = {
    loader: Tools.massiveRequire(require["context"]('./../../sprites/', true, /\.(mp3|png|jpe?g)$/)),
    startScene: GameScene,
    bgSpeed: 2,
};