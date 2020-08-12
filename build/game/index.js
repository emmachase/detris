"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const board_1 = __importDefault(require("./board"));
const mino_1 = require("./mino");
const bags_1 = require("./bags");
class MinoGame {
    constructor(options) {
        this.options = options;
        this.holdLock = false;
        this.bag = new bags_1.SevenBag();
        this.board = new board_1.default(...options.boardSize);
    }
    toDiscord() {
        return this.board.toDiscord(this.options, this.fallingMino);
    }
    spawnNewPiece() {
        const pieceType = this.bag.getNextPiece();
        console.log("Spawning " + pieceType);
        const newPiece = new mino_1.FallingMino(this.options, pieceType);
        if (this.board.willPieceBeObstructed(newPiece)) {
            // TODO: Lose
        }
        this.fallingMino = newPiece;
        // Once a new piece has spawned, we reallow hold
        this.holdLock = false;
    }
    tickEngine() {
        if (!this.fallingMino) {
            this.spawnNewPiece();
        }
        const fallAmt = this.options.gravity;
        const startY = this.fallingMino.y;
        const destY = this.fallingMino.y - fallAmt;
        let locked = false;
        for (let transY = 0; transY < fallAmt; transY++) {
            if (this.board.willPieceBeObstructed(this.fallingMino, 0, -1)) {
                this.fallingMino.y = Math.ceil(startY) - transY;
                this.lockPiece();
                locked = true;
                // console.log(this.fallingMino.y);
                break;
            }
            else {
                if (transY > 0) {
                    this.fallingMino.y -= 1;
                }
            }
        }
        if (!locked) {
            if (destY !== this.fallingMino.y) {
                this.fallingMino.y = destY;
            }
            this.fallingMino.lockTimer = 0;
        }
        // TODO
    }
    lockPiece(ignoreLockTimer = false) {
        if (!ignoreLockTimer && (this.fallingMino.lockTimer < this.options.lockTimer)) {
            this.fallingMino.lockTimer += 1;
            return;
        }
        const affectedRows = this.board.addPiece(this.fallingMino);
        for (const row of affectedRows.reverse()) {
            if (this.board.shouldLineClear(row)) {
                this.board.clearLine(row);
            }
        }
        this.spawnNewPiece();
    }
    tryRotate(delta) {
        if (!this.fallingMino)
            return;
        const newRotation = (this.fallingMino.rotation + delta) % 4;
        const listKey = `${this.fallingMino.rotation}${newRotation}`;
        const kicklist = this.fallingMino.pieceData.kicks[listKey];
        for (const [kx, ky] of kicklist) {
            if (!this.board.willPieceBeObstructed(this.fallingMino, kx, ky, newRotation)) {
                this.fallingMino.x += kx;
                this.fallingMino.y += ky;
                this.fallingMino.rotation = newRotation;
                this.fallingMino.remainingRotations -= 1;
                if (this.fallingMino.remainingRotations >= 0) {
                    this.fallingMino.lockTimer = 0;
                }
            }
        }
    }
    getHardDropPosition() {
        let offset = 0;
        while (!this.board.willPieceBeObstructed(this.fallingMino, 0, offset)) {
            offset++;
        }
        return [this.fallingMino.x, this.fallingMino.y + offset];
    }
}
exports.default = MinoGame;
