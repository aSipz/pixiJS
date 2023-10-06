import * as PIXI from "pixi.js";
import { App } from "../system/App";
import { Board } from "./Board";
import { CombinationManager } from "./CombinationManager";

export class Game {
    constructor() {
        this.container = new PIXI.Container();
        this.createBackground();

        this.board = new Board();
        this.container.addChild(this.board.container);

        this.combinationManager = new CombinationManager(this.board);
        this.removeStartMatches();

        this.board.container.on('tile-touch-start', this.onTileClick.bind(this));
    }

    createBackground() {
        this.bg = App.sprite("bg");
        this.bg.width = window.innerWidth;
        this.bg.height = window.innerHeight;
        this.container.addChild(this.bg);
    }

    onTileClick(tile) {
        if (this.disabled) {
            return;
        }

        if (this.selectedTile) {
            if (!this.selectedTile.isNeighbour(tile)) {
                this.clearSelection(tile);
                this.selectTile(tile);
            } else {
                this.swapTiles(this.selectedTile, tile);
            }
        } else {
            this.selectTile(tile)
        }
    }

    swapTiles(selectedTile, tile, reverse) {
        this.disabled = true;
        this.clearSelection();
        selectedTile.sprite.zIndex = 2;

        selectedTile.moveTo(tile.field.position, 0.2);
        tile.moveTo(selectedTile.field.position, 0.2).then(() => {
            this.board.swap(selectedTile, tile);

            if (!reverse) {
                // if this is the main swap, then we are looking for combinations
                const matches = this.combinationManager.getMatches();
                if (matches.length) {
                    this.processMatches(matches);
                } else {
                    this.swapTiles(tile, selectedTile, true);
                }
            } else {
                this.disabled = false;
            }
        });
    }

    removeStartMatches() {
        let matches = this.combinationManager.getMatches();

        while (matches.length) {
            this.removeMatches(matches);

            const fields = this.board.fields.filter(field => field.tile === null);

            fields.forEach(field => {
                this.board.createTile(field);
            });

            matches = this.combinationManager.getMatches();
        }
    }

    processMatches(matches) {
        this.removeMatches(matches);
        this.processFallDown()
            .then(() => this.addTiles())
            .then(() => this.onFallDownOver());
    }

    onFallDownOver() {
        const matches = this.combinationManager.getMatches();

        if (matches.length) {
            this.processMatches(matches)
        } else {
            this.disabled = false;
        }
    }

    addTiles() {
        return new Promise(resolve => {
            // get all fields that don't have tiles
            const fields = this.board.fields.filter(field => field.tile === null);
            let total = fields.length;
            let completed = 0;

            // for each empty field
            fields.forEach(field => {
                // create a new tile
                const tile = this.board.createTile(field);
                // put it above the board
                tile.sprite.y = -500;
                const delay = Math.random() * App.config.newTilesDelay + 0.3 / (field.row + 1);
                // const delay = App.config.newTilesDelay / (field.row + 1);
                // start the movement of the tile in the given empty field with the given delay
                tile.fallDownTo(field.position, delay).then(() => {
                    ++completed;
                    if (completed >= total) {
                        resolve();
                    }
                });
            });
        });
    }

    processFallDown() {
        return new Promise(resolve => {
            let completed = 0;
            let started = 0;

            // check all fields of the board, starting from the bottom row
            for (let row = this.board.rows - 1; row >= 0; row--) {
                for (let col = this.board.cols - 1; col >= 0; col--) {
                    const field = this.board.getField(row, col);

                    // if there is no tile in the field
                    if (!field.tile) {
                        ++started;

                        // shift all tiles that are in the same column in all rows above
                        this.fallDownTo(field).then(() => {
                            ++completed;
                            if (completed >= started) {
                                resolve();
                            }
                        });
                    }
                }
            }
        });
    }

    fallDownTo(emptyField) {
        // checking all board fields in the found empty field column, but in all higher rows
        for (let row = emptyField.row - 1; row >= 0; row--) {
            let fallingField = this.board.getField(row, emptyField.col);
            // find the first field with a tile
            if (fallingField.tile) {
                // the first found tile will be placed in the current empty field
                const fallingTile = fallingField.tile;
                fallingTile.field = emptyField;
                emptyField.tile = fallingTile;
                fallingField.tile = null;
                // run the tile move method and stop searching a tile for that empty field
                return fallingTile.fallDownTo(emptyField.position);
            }
        }

        return Promise.resolve();
    }

    removeMatches(matches) {
        matches.forEach(match => {
            match.forEach(tile => {
                tile.remove();
            });
        });
    }

    clearSelection() {
        if (this.selectedTile) {
            this.selectedTile.field.unselect();
            this.selectedTile = null;
        }
    }

    selectTile(tile) {
        this.selectedTile = tile;
        this.selectedTile.field.select();
    }
}