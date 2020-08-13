import { RotationSystem } from "./minos";

export class GameOptions {
    rotationSystem: RotationSystem = RotationSystem.SRS
    boardSize: [number, number] = [10, 40]

    chainB2Bs: boolean = true

    rotateLock: number = 30
    translateLock: number = 30

    lockTimer: number = 80

    gravity: number = 2*0.016

    backfire: number = 1
    garbageCap: number = 6
}
