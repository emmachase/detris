"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallingMino = void 0;
const minos_1 = require("./minos");
class FallingMino {
    constructor(options, piece) {
        this.rotation = 0;
        this.lockTimer = 0;
        this.pieceData = minos_1.PieceData[options.rotationSystem][piece];
        const [width, height] = options.boardSize;
        this.x = Math.floor(width / 2) - 1;
        this.y = Math.floor(height / 2) - 3 + 0.01;
        this.remainingRotations = options.rotateLock;
        this.remainingTranslations = options.translateLock;
    }
    cellRotate(x, y, r) {
        switch (r) {
            case 0: return [x, y];
            case 1: return [y, -x];
            case 2: return [-x, -y];
            case 3: return [-y, x];
            default: throw new Error("Rotation is in invalid state");
        }
    }
    getCells(offsetX = 0, offsetY = 0, rot = this.rotation) {
        const cells = [];
        const [aox, aoy] = this.pieceData.cellOffset;
        for (let [cx, cy] of this.pieceData.cells) {
            [cx, cy] = this.cellRotate(cx, cy, rot);
            cells.push([aox + offsetX + cx + this.x,
                aoy + offsetY + cy + Math.ceil(this.y)]);
        }
        return cells;
    }
}
exports.FallingMino = FallingMino;
