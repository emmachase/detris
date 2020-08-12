"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PieceData = exports.KickSets = exports.ColorScheme = exports.RotationSystem = exports.PieceType = exports.TileType = void 0;
const emojis_1 = require("../emojis");
var TileType;
(function (TileType) {
    TileType[TileType["Empty"] = 0] = "Empty";
    TileType[TileType["Garbage"] = 1] = "Garbage";
    TileType[TileType["I"] = 2] = "I";
    TileType[TileType["O"] = 3] = "O";
    TileType[TileType["T"] = 4] = "T";
    TileType[TileType["L"] = 5] = "L";
    TileType[TileType["J"] = 6] = "J";
    TileType[TileType["S"] = 7] = "S";
    TileType[TileType["Z"] = 8] = "Z";
})(TileType = exports.TileType || (exports.TileType = {}));
var PieceType;
(function (PieceType) {
    PieceType[PieceType["I"] = 0] = "I";
    PieceType[PieceType["O"] = 1] = "O";
    PieceType[PieceType["T"] = 2] = "T";
    PieceType[PieceType["L"] = 3] = "L";
    PieceType[PieceType["J"] = 4] = "J";
    PieceType[PieceType["S"] = 5] = "S";
    PieceType[PieceType["Z"] = 6] = "Z";
})(PieceType = exports.PieceType || (exports.PieceType = {}));
var RotationSystem;
(function (RotationSystem) {
    RotationSystem["SRS"] = "SRS";
})(RotationSystem = exports.RotationSystem || (exports.RotationSystem = {}));
exports.ColorScheme = {
    SRS: {
        [TileType.Empty]: emojis_1.Squares.BG,
        [TileType.Garbage]: emojis_1.Squares.G,
        [TileType.I]: emojis_1.Squares.I,
        [TileType.O]: emojis_1.Squares.O,
        [TileType.T]: emojis_1.Squares.T,
        [TileType.L]: emojis_1.Squares.L,
        [TileType.J]: emojis_1.Squares.J,
        [TileType.S]: emojis_1.Squares.S,
        [TileType.Z]: emojis_1.Squares.Z
    }
};
exports.KickSets = {
    SRS: {
        TLJSZ: {
            ["01"]: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            ["10"]: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            ["12"]: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            ["21"]: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            ["23"]: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            ["32"]: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            ["30"]: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            ["03"]: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            ["02"]: [[0, 0], [0, 1], [1, 1], [-1, 1], [1, 0], [-1, 0]],
            ["13"]: [[0, 0], [1, 0], [1, 2], [1, 1], [0, 2], [0, 1]],
            ["20"]: [[0, 0], [0, -1], [-1, -1], [1, -1], [-1, 0], [1, 0]],
            ["31"]: [[0, 0], [-1, 0], [-1, 2], [-1, 1], [0, 2], [0, 1]],
        },
        I: {
            ["01"]: [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
            ["10"]: [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
            ["12"]: [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
            ["21"]: [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
            ["23"]: [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
            ["32"]: [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
            ["30"]: [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
            ["03"]: [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
            ["02"]: [[0, 0]],
            ["13"]: [[0, 0]],
            ["20"]: [[0, 0]],
            ["31"]: [[0, 0]],
        },
        O: {
            ["01"]: [[0, 0]],
            ["10"]: [[0, 0]],
            ["12"]: [[0, 0]],
            ["21"]: [[0, 0]],
            ["23"]: [[0, 0]],
            ["32"]: [[0, 0]],
            ["30"]: [[0, 0]],
            ["03"]: [[0, 0]],
            ["02"]: [[0, 0]],
            ["13"]: [[0, 0]],
            ["20"]: [[0, 0]],
            ["31"]: [[0, 0]],
        }
    }
};
exports.PieceData = {
    SRS: {
        [PieceType.I]: {
            cellOffset: [0.5, -0.5],
            cells: [[-1.5, 0.5], [-0.5, 0.5], [0.5, 0.5], [1.5, 0.5]],
            tile: TileType.I,
            kicks: exports.KickSets.SRS.I
        },
        [PieceType.O]: {
            cellOffset: [0.5, 0.5],
            cells: [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]],
            tile: TileType.O,
            kicks: exports.KickSets.SRS.O
        },
        [PieceType.T]: {
            cellOffset: [0, 0],
            cells: [[-1, 0], [0, 0], [1, 0], [0, 1]],
            tile: TileType.T,
            kicks: exports.KickSets.SRS.TLJSZ
        },
        [PieceType.L]: {
            cellOffset: [0, 0],
            cells: [[-1, 0], [0, 0], [1, 0], [1, 1]],
            tile: TileType.L,
            kicks: exports.KickSets.SRS.TLJSZ
        },
        [PieceType.J]: {
            cellOffset: [0, 0],
            cells: [[-1, 0], [0, 0], [1, 0], [-1, 1]],
            tile: TileType.J,
            kicks: exports.KickSets.SRS.TLJSZ
        },
        [PieceType.S]: {
            cellOffset: [0, 0],
            cells: [[-1, 0], [0, 0], [0, 1], [1, 1]],
            tile: TileType.S,
            kicks: exports.KickSets.SRS.TLJSZ
        },
        [PieceType.Z]: {
            cellOffset: [0, 0],
            cells: [[-1, 1], [0, 1], [0, 0], [1, 0]],
            tile: TileType.Z,
            kicks: exports.KickSets.SRS.TLJSZ
        },
    }
};
