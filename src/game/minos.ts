import { Squares } from "../emojis";

export enum TileType {
    Empty, Garbage,
    I, O, T,
    L, J,
    S, Z
}

export enum PieceType {
    I, O, T,
    L, J,
    S, Z
}

export type KickList = 
    "01" | "10" | "12" | "21" | "23" | "32" | 
    "30" | "03" | "02" | "13" | "20" | "31";

type Designated<T> = Record<string, T>;

export enum RotationSystem {
    SRS = "SRS"
}

export const ColorScheme: Designated<Record<TileType, string>> = {
    SRS: {
        [TileType.Empty]: Squares.BG,
        [TileType.Garbage]: Squares.G,
        [TileType.I]: Squares.I,
        [TileType.O]: Squares.O,
        [TileType.T]: Squares.T,
        [TileType.L]: Squares.L, 
        [TileType.J]: Squares.J,
        [TileType.S]: Squares.S,
        [TileType.Z]: Squares.Z
    }
}

export type KickSet = Record<KickList, [number, number][]>
export const KickSets: Designated<Record<string, KickSet>> = {
    SRS: {
        TLJSZ: {
            ["01"]: [[ 0, 0], [-1, 0], [-1, 1], [ 0,-2], [-1,-2]],
            ["10"]: [[ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2]],
            ["12"]: [[ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2]],
            ["21"]: [[ 0, 0], [-1, 0], [-1, 1], [ 0,-2], [-1,-2]],
            ["23"]: [[ 0, 0], [ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2]],
            ["32"]: [[ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2]],
            ["30"]: [[ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2]],
            ["03"]: [[ 0, 0], [ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2]],
            ["02"]: [[ 0, 0], [ 0, 1], [ 1, 1], [-1, 1], [ 1, 0], [-1, 0]],
            ["13"]: [[ 0, 0], [ 1, 0], [ 1, 2], [ 1, 1], [ 0, 2], [ 0, 1]],
            ["20"]: [[ 0, 0], [ 0,-1], [-1,-1], [ 1,-1], [-1, 0], [ 1, 0]],
            ["31"]: [[ 0, 0], [-1, 0], [-1, 2], [-1, 1], [ 0, 2], [ 0, 1]],
        },

        I: {
            ["01"]: [[ 0, 0], [-2, 0], [ 1, 0], [-2,-1], [ 1, 2]],
            ["10"]: [[ 0, 0], [ 2, 0], [-1, 0], [ 2, 1], [-1,-2]],
            ["12"]: [[ 0, 0], [-1, 0], [ 2, 0], [-1, 2], [ 2,-1]],
            ["21"]: [[ 0, 0], [ 1, 0], [-2, 0], [ 1,-2], [-2, 1]],
            ["23"]: [[ 0, 0], [ 2, 0], [-1, 0], [ 2, 1], [-1,-2]],
            ["32"]: [[ 0, 0], [-2, 0], [ 1, 0], [-2,-1], [ 1, 2]],
            ["30"]: [[ 0, 0], [ 1, 0], [-2, 0], [ 1,-2], [-2, 1]],
            ["03"]: [[ 0, 0], [-1, 0], [ 2, 0], [-1, 2], [ 2,-1]],
            ["02"]: [[ 0, 0]],
            ["13"]: [[ 0, 0]],
            ["20"]: [[ 0, 0]],
            ["31"]: [[ 0, 0]],
        },

        O: {
            ["01"]: [[ 0, 0]],
            ["10"]: [[ 0, 0]],
            ["12"]: [[ 0, 0]],
            ["21"]: [[ 0, 0]],
            ["23"]: [[ 0, 0]],
            ["32"]: [[ 0, 0]],
            ["30"]: [[ 0, 0]],
            ["03"]: [[ 0, 0]],
            ["02"]: [[ 0, 0]],
            ["13"]: [[ 0, 0]],
            ["20"]: [[ 0, 0]],
            ["31"]: [[ 0, 0]],
        }
    }
}

export interface Piece {
    cellOffset: [number, number]
    cells: [number, number][]
    tile: TileType
    kicks: KickSet
}

export type PieceSet = Record<PieceType, Piece>;
export const PieceData: Designated<PieceSet> = {
    SRS: {
        [PieceType.I]: {
            cellOffset: [0.5, -0.5],
            cells: [[-1.5, 0.5], [-0.5, 0.5], [0.5, 0.5], [1.5, 0.5]],
            tile: TileType.I,
            kicks: KickSets.SRS.I
        },

        [PieceType.O]: {
            cellOffset: [0.5, 0.5],
            cells: [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]],
            tile: TileType.O,
            kicks: KickSets.SRS.O
        },

        [PieceType.T]: {
            cellOffset: [0, 0],
            cells: [[-1, 0], [0, 0], [1, 0], [0, 1]],
            tile: TileType.T,
            kicks: KickSets.SRS.TLJSZ
        },

        [PieceType.L]: {
            cellOffset: [0, 0],
            cells: [[-1, 0], [0, 0], [1, 0], [1, 1]],
            tile: TileType.L,
            kicks: KickSets.SRS.TLJSZ
        },

        [PieceType.J]: {
            cellOffset: [0, 0],
            cells: [[-1, 0], [0, 0], [1, 0], [-1, 1]],
            tile: TileType.J,
            kicks: KickSets.SRS.TLJSZ
        },

        [PieceType.S]: {
            cellOffset: [0, 0],
            cells: [[-1, 0], [0, 0], [0, 1], [1, 1]],
            tile: TileType.S,
            kicks: KickSets.SRS.TLJSZ
        },

        [PieceType.Z]: {
            cellOffset: [0, 0],
            cells: [[-1, 1], [0, 1], [0, 0], [1, 0]],
            tile: TileType.Z,
            kicks: KickSets.SRS.TLJSZ
        },
    }
}
