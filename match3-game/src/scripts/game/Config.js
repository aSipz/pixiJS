import { Tools } from "../system/Tools";
import { Game } from "./Game";

export const Config = {
    loader: Tools.massiveRequire(require["context"]('./../../sprites/', true, /\.(mp3|png|jpe?g)$/)),
    startScene: Game,
    board: {
        rows: 8,
        cols: 8,
    },
    tilesColors: ['blue', 'green', 'orange', 'red', 'pink', 'yellow'],
    combinationRules: [[
        { col: 1, row: 0 }, { col: 2, row: 0 }
    ], [
        { col: 0, row: 1 }, { col: 0, row: 2 }
    ]],
    newTilesDelay: 0.2,
};