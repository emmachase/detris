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
const client_1 = __importDefault(require("./client"));
function isSelf(user) {
    return user.id === client_1.default.user.id;
}
function isUserMessage(msg) {
    return !msg.author.bot && msg.author.id !== client_1.default.user.id;
}
class Exchange {
    constructor() {
        this.prefix = "^";
        this.prefixRoutes = {};
        client_1.default.on("message", this.handleMessage.bind(this));
        client_1.default.on("messageReactionAdd", this.handleReaction.bind(this));
    }
    handleMessage(msg) {
        if (isUserMessage(msg)) {
            // Check if we have a prefix command for this message
            const cmdParts = msg.content.match(Exchange.commandRegex);
            const prefix = cmdParts === null || cmdParts === void 0 ? void 0 : cmdParts[0];
            if (this.prefixRoutes[prefix]) {
                this.prefixRoutes[prefix](msg, cmdParts.slice(1));
            }
        }
    }
    handleReaction(reaction, user) {
        // if (!isSelf(user)) {
        //     await reaction.users.remove(user);
        // }
    }
    // Bot configuration
    addCommand(prefix, handler) {
        this.prefixRoutes[this.prefix + prefix] = handler;
    }
    // Bot interaction
    addEmojiList(msg, emoji) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(emoji.map(e => msg.react(e)));
        });
    }
}
// Client handling
Exchange.commandRegex = /\S+/g;
;
exports.default = new Exchange();
