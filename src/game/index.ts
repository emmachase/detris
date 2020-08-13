import Board from "./board";
import { GameOptions } from "./options";
import { FallingMino } from "./mino";
import { PieceType, KickList, TileType } from "./minos";
import { BagGenerator, SevenBag } from "./bags";
import { normalMod, range, capitalize } from "../util";
import ScoreTable from "./scoretable";

export default class MinoGame {
    score: number = 0
    linesCleared: number = 0

    lost: boolean = false
    loseReason: string

    private board: Board
    private fallingMino?: FallingMino

    private heldPiece?: PieceType
    private holdLock: boolean = false

    private b2b: number = 0;
    private combo: number = 0;
    private lockWasSpin: boolean = false
    private spinWasMini: boolean = false

    private garbageQueue: {column: number, amount: number}[] = []
    private smashing: boolean = false;

    private messages: string[] = []

    private bag: BagGenerator = new SevenBag()

    constructor(public options: GameOptions) {
        this.board = new Board(...options.boardSize);
    }

    consumeMessage(): string | undefined {
        if (this.messages.length > 1) {
            this.messages.shift();
        }

        return this.messages[0];
    }

    boardToDiscord() {
        return this.board.toDiscord(this.options, this.fallingMino);
    }

    heldToDiscord() {
        const tempBoard = new Board(4, 2);
        if (this.heldPiece !== undefined) {
            const piece = new FallingMino(this.options, this.heldPiece);
            piece.x = 1;
            piece.y = 0;
            if (this.holdLock) {
                tempBoard.addPiece(piece, TileType.Garbage);
            } else {
                tempBoard.addPiece(piece);
            }
        }

        return tempBoard.toDiscord(this.options)
    }

    nextToDiscord(count: number) {
        const pieces = new Array(count).fill(0)
            .map((_, i) => this.bag.peekPiece(i));

        const tempBoard = new Board(4*count, 2);
        for (const i of range(count)) {
            const piece = pieces[i];
            const mino = new FallingMino(this.options, piece);
            mino.x = 1 + 4*i;
            mino.y = 0;

            tempBoard.addPiece(mino);
        }

        return tempBoard.toDiscord(this.options);
    }

    spawnNewPiece(pieceType?: PieceType) {
        if (pieceType === undefined) pieceType = this.bag.getNextPiece();
        const newPiece = new FallingMino(this.options, pieceType);

        if (this.board.willPieceBeObstructed(newPiece)) {
            // We can't spawn a piece, so lose
            this.lost = true;
            this.loseReason = this.smashing ? "Garbage-Smash" : "Top-out";
            this.board.addPiece(this.fallingMino, TileType.Garbage);
            this.fallingMino = undefined;
            return;
        }

        this.fallingMino = newPiece;

        // Reset states
        this.lockWasSpin = false;
        this.holdLock = false;
        this.smashing = false;
    }

    tickEngine() {
        if (!this.fallingMino) {
            this.spawnNewPiece();
            if (this.lost) return;
        }

        const fallAmt = this.options.gravity;
        const startY = this.fallingMino.y;
        const destY = this.fallingMino.y - fallAmt;

        let locked = false;
        for (let transY = 0; transY < fallAmt; transY++) {
            if (this.board.willPieceBeObstructed(this.fallingMino, 0, -1)) {
                this.fallingMino.y = Math.ceil(startY) - transY;
                this.lockPiece();
                locked = true;
                break;
            } else {
                if (transY > 0) {
                    this.fallingMino.y -= 1;
                    this.lockWasSpin = false;
                }
            }
        }

        if (!locked) {
            if (destY !== this.fallingMino.y) {
                this.fallingMino.y = destY;
                this.lockWasSpin = false;
            }

            this.fallingMino.lockTimer = 0;
            this.fallingMino.remainingRotations = this.options.rotateLock;
            this.fallingMino.remainingTranslations = this.options.translateLock;
        }
    }


    wasDifficult(linesCleared: number) {
        return linesCleared >= 4 || this.lockWasSpin;
    }

    calculateScoring(linesCleared: number) {
        let score = 0, garbageToSend = 0;
        if (linesCleared > 2 // T-Spin Triples aren't counted as minis
            || (linesCleared === 2 // Backwards T-Spin Double isn't either
                && this.fallingMino.rotation === 2)) {
            this.spinWasMini = false;
        }

        if (linesCleared === 0) {
            if (this.lockWasSpin) {
                if (this.spinWasMini) {
                    score = ScoreTable.scoring.TSPIN_MINI
                    garbageToSend = ScoreTable.garbage.TSPIN_MINI
                } else {
                    score = ScoreTable.scoring.TSPIN
                    garbageToSend = ScoreTable.garbage.TSPIN
                }
            }
        } else {
            const clearTypes = ["SINGLE", "DOUBLE", "TRIPLE", "QUAD"];
            const clearType = clearTypes[linesCleared - 1];

            if (this.lockWasSpin) {
                if (this.spinWasMini) {
                    score = ScoreTable.scoring["TSPIN_MINI_" + clearType];
                    garbageToSend = ScoreTable.garbage["TSPIN_MINI_" + clearType];
                } else {
                    score = ScoreTable.scoring["TSPIN_" + clearType];
                    garbageToSend = ScoreTable.garbage["TSPIN_" + clearType];
                }
            } else {
                score = ScoreTable.scoring[clearType];
                garbageToSend = ScoreTable.garbage[clearType];
            }

            let clearMessage = capitalize(clearType);
            if (this.lockWasSpin) {
                clearMessage = "T-Spin " + clearMessage;
                if (this.spinWasMini) {
                    clearMessage = "Mini " + clearMessage;
                }
            }

            this.messages.push(clearMessage);
        }

        // Process b2b's and combos
        if (linesCleared > 0) {
            if (this.wasDifficult(linesCleared)) {
                this.b2b += 1;
            } else {
                this.b2b = 0;
            }

            this.combo += 1;
        } else {
            this.combo = 0;
        }

        // Score b2bs
        if (linesCleared > 0) {
            if (this.b2b > 1) {
                score *= ScoreTable.scoring.BACKTOBACK_MULTIPLIER;

                if (this.options.chainB2Bs) {
                    let nonSingleBonus = 0;
                    if (this.b2b > 2) {
                        nonSingleBonus = 1 + Math.log1p((this.b2b - 1) * 
                            ScoreTable.garbage.BACKTOBACK_BONUS_LOG) % 1;
                    }

                    const singleBonus = Math.floor(1 + Math.log1p((this.b2b - 1) 
                        * ScoreTable.garbage.BACKTOBACK_BONUS_LOG));

                    const logBonus = ScoreTable.garbage.BACKTOBACK_BONUS
                        * (singleBonus + (nonSingleBonus / 3));

                    garbageToSend += logBonus;
                } else {
                    garbageToSend += ScoreTable.garbage.BACKTOBACK_BONUS;
                }
            }
        }

        if (this.combo > 1) {
            score += ScoreTable.scoring.COMBO * (this.combo - 1);
            garbageToSend *= ScoreTable.garbage.COMBO_BONUS * (this.combo - 1);
        }

        if (this.combo > 2) {
            const minimizedCombo = Math.log1p((this.combo - 1) * 
                ScoreTable.garbage.COMBO_MINIFIER *
                ScoreTable.garbage.COMBO_MINIFIER_LOG);

            garbageToSend = Math.max(minimizedCombo, garbageToSend);
        }

        return [score, Math.floor(garbageToSend)];
    }

    addGarbage() {
        let totalAdded = 0;
        while (totalAdded < this.options.garbageCap) {
            const garbage = this.garbageQueue.shift();
            if (!garbage || garbage.amount <= 0) break;

            if (totalAdded + garbage.amount > this.options.garbageCap) {
                const usedAmount = this.options.garbageCap - totalAdded;
                this.garbageQueue.push({
                    column: garbage.column,
                    amount: garbage.amount - usedAmount
                });

                garbage.amount = usedAmount;
            }

            let ok = this.board.addGarbageLines(garbage.column, garbage.amount);
            if (!ok) {
                this.lost = true;
                this.loseReason = "Garbage-Smash";
                this.smashing = true;
            }

            totalAdded += garbage.amount;
        }
    }

    countQueuedGarbage() {
        return this.garbageQueue.reduce((acc, x) => acc + x.amount, 0);
    }

    sendAttack(lines: number) {
        // Backfire
        const backfire = Math.floor(lines * this.options.backfire);
        this.garbageQueue.push({
            column: Math.floor((Math.random()*this.board.width) % this.board.width),
            amount: backfire
        });
    }

    lockPiece(ignoreLockTimer: boolean = false) {
        if (!this.fallingMino) return;

        if (!ignoreLockTimer && (this.fallingMino.lockTimer < this.options.lockTimer)) {
            this.fallingMino.lockTimer += 1;
            return;
        }

        let numCleared = 0;
        const affectedRows = this.board.addPiece(this.fallingMino);
        for (const row of affectedRows.reverse()) {
            if (this.board.shouldLineClear(row)) {
                this.board.clearLine(row);
                numCleared += 1;
            }
        }
        
        this.linesCleared += numCleared;
        
        let [score, garbage] = this.calculateScoring(numCleared);
        this.score += score;

        if (numCleared === 0) {
            this.addGarbage();
        } else {
            while (garbage > 0) {
                const queuedGarbage = this.garbageQueue.shift();
                if (!queuedGarbage) break;

                if (garbage > queuedGarbage.amount) {
                    garbage -= queuedGarbage.amount;
                } else {
                    // Couldn't cancel this bit of garbage, put it back
                    queuedGarbage.amount -= garbage;
                    garbage = 0;

                    this.garbageQueue.unshift(queuedGarbage);
                }
            }
        }

        this.sendAttack(garbage);

        this.spawnNewPiece();
    }

    tryRotate(delta: number) {
        if (!this.fallingMino) return;

        const newRotation = normalMod(this.fallingMino.rotation + delta, 4);
        const listKey = `${this.fallingMino.rotation}${newRotation}` as KickList;

        let willBeMini = false;

        const kicklist = this.fallingMino.pieceData.kicks[listKey];
        for (const [kx, ky] of kicklist) {
            if (!this.board.willPieceBeObstructed(this.fallingMino, kx, ky, newRotation)) {
                this.fallingMino.x += kx;
                this.fallingMino.y += ky;
                this.fallingMino.rotation = newRotation;
                this.fallingMino.remainingRotations -= 1;
                if (this.fallingMino.remainingRotations >= 0) {
                    this.fallingMino.lockTimer = 0;
                }

                if (this.fallingMino.pieceType == PieceType.T) {
                    // Check for T-Spin by 3-corner method
                    let numCorners = 0;
                    for (let i = -1; i <= 1; i += 2) {
                        for (let j = -1; j <= 1; j += 2) {
                            if (this.board.isTileOccupied(
                                    this.fallingMino.y + j,
                                    this.fallingMino.x + i)) {
                                numCorners += 1;
                            }
                        }
                    }

                    if (numCorners >= 3) {
                        this.lockWasSpin = true;
                        this.spinWasMini = willBeMini;
                    }
                }

                break;
            }

            willBeMini = true;
        }
    }

    tryMove(delta: number) {
        if (!this.fallingMino) return;

        while (delta !== 0 && !this.board.willPieceBeObstructed(this.fallingMino, Math.sign(delta))) {
            this.fallingMino.x += Math.sign(delta);
            delta += -Math.sign(delta);

            this.lockWasSpin = false;
            if (this.fallingMino.lockTimer > 0) {
                this.fallingMino.remainingTranslations -= 1;
                if (this.fallingMino.remainingTranslations >= 0) {
                    this.fallingMino.lockTimer = 0;
                }
            }
        }
    }

    dropPiece(hard: boolean) {
        if (!this.fallingMino) return;

        const [px, py, score] = this.fallingMino.getHardDropPosition(this.board);
        if (Math.ceil(py) !== Math.ceil(this.fallingMino.y)) {
            this.lockWasSpin = false;
        }

        this.fallingMino.x = px;
        this.fallingMino.y = py;

        this.score += score;
        if (hard) {
            this.lockPiece(true);
        }
    }

    tryHold() {
        if (this.holdLock) return;
        if (!this.fallingMino) return;

        if (this.heldPiece !== undefined) {
            const pieceToSpawn = this.heldPiece;
            this.heldPiece = this.fallingMino.pieceType;
            this.spawnNewPiece(pieceToSpawn);
        } else {
            this.heldPiece = this.fallingMino.pieceType;
            this.spawnNewPiece();
        }

        this.holdLock = true;
    }
}
