"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minos_1 = require("./minos");
const util_1 = require("../util");
class Board {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.lines = [];
        for (const row of util_1.range(this.height)) {
            this.lines[row] = [];
            for (const col of util_1.range(this.width)) {
                this.lines[row][col] = minos_1.TileType.Empty;
            }
        }
    }
    get empty() {
        for (const line of this.lines) {
            for (const cell of line) {
                if (cell !== minos_1.TileType.Empty) {
                    return false;
                }
            }
        }
        return true;
    }
    toDiscord(options, piece) {
        const getStr = (t) => minos_1.ColorScheme[options.rotationSystem][t];
        const textGrid = [];
        for (const row of this.lines) {
            const line = [];
            for (const cell of row) {
                line.push(getStr(cell));
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
    addPiece(piece) {
        const affectedRows = [];
        for (const [cx, cy] of piece.getCells()) {
            // console.log(cy, cx);
            this.lines[cy][cx] = piece.pieceData.tile;
            affectedRows.push(cy);
        }
        affectedRows.sort();
        return affectedRows;
    }
    isTileOccupied(row, column) {
        var _a;
        return ((_a = this.lines[row]) === null || _a === void 0 ? void 0 : _a[column]) !== minos_1.TileType.Empty;
    }
    willPieceBeObstructed(piece, offsetX = 0, offsetY = 0, rot = 0) {
        for (const cell of piece.getCells(offsetX, offsetY, rot)) {
            const [x, y] = cell;
            if (this.isTileOccupied(y, x)) {
                return true;
            }
        }
        return false;
    }
    isLineEmpty(row) {
        for (const cell of this.lines[row]) {
            if (cell !== minos_1.TileType.Empty) {
                return false;
            }
        }
        return true;
    }
    shouldLineClear(row) {
        for (const cell of this.lines[row]) {
            if (cell === minos_1.TileType.Empty) {
                return false;
            }
        }
        return true;
    }
    genEmptyLine() {
        return new Array(this.width).fill(minos_1.TileType.Empty);
    }
    clearLine(row) {
        for (let y = row; y < this.height; y++) {
            this.lines[y] = this.lines[y + 1] || this.genEmptyLine();
        }
    }
}
exports.default = Board;
