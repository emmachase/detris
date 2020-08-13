import { Piece, PieceType, PieceData } from "./minos";
import { GameOptions } from "./options";
import Board from "./board";

export class FallingMino {
    pieceData: Piece

    x: number
    y: number
    rotation: number  = 0
    lockTimer: number = 0

    remainingRotations: number
    remainingTranslations: number

    constructor(options: GameOptions, public pieceType: PieceType) {
        this.pieceData = PieceData[options.rotationSystem][pieceType];

        const [width, height] = options.boardSize;
        this.x = Math.floor(width  / 2) - 1; //Math.floor(Math.random()*(width-4))+2;
        this.y = Math.floor(height / 2) - 3 + 0.01;

        this.remainingRotations = options.rotateLock;
        this.remainingTranslations = options.translateLock;
    }

    private cellRotate(x: number, y: number, r: number) {
        switch (r) {
            case 0: return [ x,  y];
            case 1: return [ y, -x];
            case 2: return [-x, -y];
            case 3: return [-y,  x];
            default: throw new Error("Rotation is in invalid state")
        }
    }

    getCellsExact(x: number, y: number, rot: number) {
        const cells = [];
        const [aox, aoy] = this.pieceData.cellOffset;
        for (let [cx, cy] of this.pieceData.cells) {
            [cx, cy] = this.cellRotate(cx, cy, rot);

            cells.push([           aox + cx + x
                       , Math.ceil(aoy + cy + y) ]);
        }

        return cells;
    }

    getCells(offsetX = 0, offsetY = 0, rot = this.rotation) {
        return this.getCellsExact(offsetX + this.x, offsetY + this.y, rot);
    }

    getHardDropPosition(board: Board) {
        let offset = 0;
        while (!board.willPieceBeObstructed(this, 0, offset - 1)) {
            offset--;
        }

        return [this.x, Math.ceil(this.y + offset), -offset];
    }
}
