import { PieceType } from "./minos";
import { shuffle } from "../util";

export interface BagGenerator {
    getNextPiece(): PieceType
    peekPiece(n: number): PieceType
}

export class SevenBag implements BagGenerator {
    private state: PieceType[] = []

    private fillBag() {
        const pieces = Object.values(PieceType).filter(x => typeof x === "number");
        this.state = this.state.concat(shuffle(pieces));
        // console.log(this.state);
    }

    getNextPiece(): PieceType {
        while (this.state.length < 7) {
            this.fillBag();
        }

        return this.state.shift();
    }

    peekPiece(n: number): PieceType {
        while (this.state.length <= n) {
            this.fillBag();
        }

        return this.state[n];
    }
}
