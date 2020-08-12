"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SevenBag = void 0;
const minos_1 = require("./minos");
const util_1 = require("../util");
class SevenBag {
    constructor() {
        this.state = [];
    }
    fillBag() {
        const pieces = Object.values(minos_1.PieceType).filter(x => typeof x === "number");
        this.state = this.state.concat(util_1.shuffle(pieces));
        // console.log(this.state);
    }
    getNextPiece() {
        while (this.state.length < 7) {
            this.fillBag();
        }
        return this.state.shift();
    }
}
exports.SevenBag = SevenBag;
