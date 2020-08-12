"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameOptions = void 0;
const minos_1 = require("./minos");
class GameOptions {
    constructor() {
        this.rotationSystem = minos_1.RotationSystem.SRS;
        this.boardSize = [10, 40];
        this.rotateLock = 30;
        this.translateLock = 30;
        this.lockTimer = 60;
        this.gravity = 2 * 0.016;
    }
}
exports.GameOptions = GameOptions;
