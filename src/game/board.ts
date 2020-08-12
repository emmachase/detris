import { TileType, ColorScheme } from "./minos";
import { range } from "../util";
import { FallingMino } from "./mino";
import { GameOptions } from "./options";

export type Line = TileType[];
export default class Board {
    lines: Line[] = []

    get empty(): boolean {
        for (const line of this.lines) {
            for (const cell of line) {
                if (cell !== TileType.Empty) {
                    return false;
                }
            }
        }

        return true;
    }

    constructor(private width: number, private height: number) {
        for (const row of range(this.height)) {
            this.lines[row] = [];
            for (const col of range(this.width)) {
                this.lines[row][col] = TileType.Empty;
            }
        }
    }

    toDiscord(options: GameOptions, piece?: FallingMino) {
        const getStr = (t: TileType) => 
            ColorScheme[options.rotationSystem][t];

        const textGrid = [];
        for (const row of this.lines) {
            const line = [];

            for (const cell of row) {
                line.push(getStr(cell))
            }

            textGrid.push(line);
        }

        if (piece) {
            for (const [col, row] of piece.getCells()) {
                // console.log(piece.pieceData.tile);
                textGrid[row][col] = getStr(piece.pieceData.tile);
            }
        }

        return textGrid.slice(0, 19).map(l => l.join("")).reverse().join("\n");
    }

    addPiece(piece: FallingMino): number[] {
        const affectedRows = [];
        for (const [cx, cy] of piece.getCells()) {
            // console.log(cy, cx);
            this.lines[cy][cx] = piece.pieceData.tile;
            affectedRows.push(cy);
        }

        affectedRows.sort();
        return affectedRows;
    }

    isTileOccupied(row: number, column: number) {
        return this.lines[row]?.[column] !== TileType.Empty;
    }

    willPieceBeObstructed(piece: FallingMino, offsetX = 0, offsetY = 0, rot = 0) {
        for (const cell of piece.getCells(offsetX, offsetY, rot)) {
            const [x, y] = cell;
            if (this.isTileOccupied(y, x)) {
                return true;
            }
        }

        return false;
    }

    isLineEmpty(row: number) {
        for (const cell of this.lines[row]) {
            if (cell !== TileType.Empty) {
                return false;
            }
        }

        return true;
    }

    shouldLineClear(row: number) {
        for (const cell of this.lines[row]) {
            if (cell === TileType.Empty) {
                return false;
            }
        }

        return true;
    }

    private genEmptyLine() {
        return new Array(this.width).fill(TileType.Empty);
    }

    clearLine(row: number) {
        for (let y = row; y < this.height; y++) {
            this.lines[y] = this.lines[y + 1] || this.genEmptyLine();
        }
    }
}
