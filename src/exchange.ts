import * as Discord from "discord.js";
import client from "./client";
import { Controls } from "./emojis";

function isSelf(user: Discord.User) {
    return user.id === client.user.id;
}

function isUserMessage(msg: Discord.Message) {
    return !msg.author.bot && msg.author.id !== client.user.id;
}

export type CommandHandler = (msg: Discord.Message, args: string[]) => void;
export type EmojiCommandHandler = (which: number, emoji: string, msg: Discord.Message) => void;

class Exchange {
    public prefix = "^"
    private prefixRoutes: Record<string, CommandHandler> = {}

    private emojiCommandRoutes: Record<string, [Discord.EmojiResolvable[], EmojiCommandHandler]> = {}

    constructor() {
        client.on("message", this.handleMessage.bind(this));
        client.on("messageReactionAdd", this.handleReaction.bind(this));
    }

    // Client handling
    private static commandRegex = /\S+/g;
    private handleMessage(msg: Discord.Message) {
        if (isUserMessage(msg)) {
            // Check if we have a prefix command for this message
            const cmdParts = msg.content.match(Exchange.commandRegex);
            const prefix = cmdParts?.[0];
            if (this.prefixRoutes[prefix]) {
                this.prefixRoutes[prefix](msg, cmdParts.slice(1));
            }
        }
    }

    private async handleReaction(reaction: Discord.MessageReaction, user: Discord.User) {
        if (!isSelf(user)) {
            const route = this.emojiCommandRoutes[reaction.message.id];
            if (route) {
                const [routedEmojis, handler] = route;
                const which = routedEmojis.findIndex(x => x == reaction.emoji.identifier);
                if (which !== -1) {
                    await reaction.users.remove(user);
                    handler(which, reaction.emoji.identifier, reaction.message);
                }
            }
        }
    }

    // Bot configuration
    addCommand(prefix: string, handler: CommandHandler) {
        this.prefixRoutes[this.prefix + prefix] = handler;
    }

    emojiCommands(msg: Discord.Message, emoji: Discord.EmojiResolvable[], handler: EmojiCommandHandler) {
        emoji = emoji.map(e => client.emojis.resolveIdentifier(e));
        this.emojiCommandRoutes[msg.id] = [emoji, handler];
        return this.addEmojiList(msg, emoji);
    }

    clearEmojiHandler(msg: Discord.Message) {
        this.emojiCommandRoutes[msg.id] = undefined;
    }

    // Bot interaction
    async addEmojiList(msg: Discord.Message, emoji: Discord.EmojiResolvable[]) {
        await Promise.all(emoji.map(e => msg.react(e)));
    }
};

export class EmojiCommandBuilder {
    private emojiList: Discord.EmojiResolvable[] = [];
    private handlers: Function[] = [];

    private workingMessage: Discord.Message;

    constructor(private exchange: Exchange) {}

    addCommand(emoji: Discord.EmojiResolvable, callback: (msg: Discord.Message) => void) {
        this.emojiList.push(emoji);
        this.handlers.push(callback);

        return this;
    }

    async execute(msg: Discord.Message) {
        this.workingMessage = msg;
        await this.exchange.emojiCommands(msg, this.emojiList, this.handleReaction.bind(this));

        return this;
    }

    async finish() {
        this.exchange.clearEmojiHandler(this.workingMessage);
        await this.workingMessage.reactions.removeAll();
    }

    private handleReaction(which: number, _emoji: string, msg: Discord.Message) {
        this.handlers[which](msg);
    }
}

export default new Exchange();
