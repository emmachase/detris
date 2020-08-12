import { RotationSystem } from "./minos";

export class GameOptions {
    rotationSystem: RotationSystem = RotationSystem.SRS
    boardSize: [number, number] = [10, 40]

    rotateLock: number = 30
    translateLock: number = 30

    lockTimer: number = 60

    gravity: number = 2*0.016
}
