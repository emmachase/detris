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

    constructor(public width: number, public height: number) {
        for (const row of range(this.height)) {
            this.lines[row] = [];
            for (const col of range(this.width)) {
                this.lines[row][col] = TileType.Empty;
            }
        }

        /*

　   　   　   　   　   　   :orange_square:　   　   　   
　   　   　   　   :orange_square::orange_square::orange_square:　   　   　   
　   　   　   　   　   　   :orange_square:　   　   　   
　   　   　   　   :orange_square::orange_square::orange_square:　   　   　   
　   　   　   　   :purple_square:　   　   　   　   　   
　   　   　   :purple_square::purple_square::purple_square:　   :red_square::red_square:　   
　   　   　   :green_square::green_square:　   :darkblue_square:　   :red_square::red_square:
　   　   :green_square::green_square:　   　   :darkblue_square::darkblue_square::darkblue_square:　  

        */
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
            const hdp = piece.getHardDropPosition(this);
            const ghostPiece = new FallingMino(options, piece.pieceType);
            ghostPiece.x = hdp[0]; ghostPiece.y = hdp[1]; 
            ghostPiece.rotation = piece.rotation;
            for (const [col, row] of ghostPiece.getCells()) {
                textGrid[row][col] = ColorScheme[options.rotationSystem][TileType.Ghost];
            }

            for (const [col, row] of piece.getCells()) {
                textGrid[row][col] = getStr(piece.pieceData.tile);
            }
        }

        const fullBoard = textGrid.slice(0, 19).map(l => l.join("")).reverse().join("\n");
        return `${fullBoard}`;
    }

    addPiece(piece: FallingMino, overrideTile?: TileType): number[] {
        const affectedRows = [];
        for (const [cx, cy] of piece.getCells()) {
            if (overrideTile !== undefined) {
                this.lines[cy][cx] = overrideTile;
            } else {
                this.lines[cy][cx] = piece.pieceData.tile;
            }

            affectedRows.push(cy);
        }

        affectedRows.sort();
        return affectedRows;
    }

    isTileOccupied(row: number, column: number) {
        column = Math.floor(column); row = Math.floor(row);
        return this.lines[row]?.[column] !== TileType.Empty;
    }

    willPieceBeObstructed(piece: FallingMino, offsetX = 0, offsetY = 0, rot = piece.rotation) {
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

    clear() {
        for (let y = 0; y < this.height; y++) {
            this.lines[y] = this.genEmptyLine();
        }
    }
    
    addGarbageLines(column: number, amount: number) {
        let survived = true;

        // First shift the board up by amount
        for (let row = this.height - 1; row >= 0; row--) {
            if (this.lines[row + amount]) {
                this.lines[row + amount] = this.lines[row];
            } else {
                if (!this.isLineEmpty(row)) {
                    survived = false;
                }
            }
        }

        console.log("col", column);

        // Now fill in the bottom rows
        for (let row = 0; row < amount; row++) {
            if (!this.lines[row]) return; // Sanity check
            this.lines[row] = this.genEmptyLine();
            for (let col = 0; col < this.width; col++) {
                if (col !== column) {
                    this.lines[row][col] = TileType.Garbage;
                }
            }
        }

        return true;
    }
}
