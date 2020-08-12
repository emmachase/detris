"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const exchange_1 = __importDefault(require("./exchange"));
const options_1 = require("./game/options");
const game_1 = __importDefault(require("./game"));
const emojis_1 = require("./emojis");
function initialize() {
    exchange_1.default.addCommand("startdetris", (msg) => __awaiter(this, void 0, void 0, function* () {
        const options = new options_1.GameOptions();
        const game = new game_1.default(options);
        const channel = msg.channel;
        const gMsg = yield channel.send(game.toDiscord());
        yield exchange_1.default.addEmojiList(gMsg, Object.values(emojis_1.Controls));
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < 60; i++) {
                game.tickEngine();
            }
            yield gMsg.edit(game.toDiscord());
            // console.log(game.toDiscord());
            // console.log(game.fallingMino.y);
        }), 2000);
    }));
}
exports.initialize = initialize;
