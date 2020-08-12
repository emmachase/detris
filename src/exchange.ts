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

class Exchange {
    private prefix = "^"
    private prefixRoutes: Record<string, CommandHandler> = {}

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

    private handleReaction(reaction: Discord.MessageReaction, user: Discord.User) {
        // if (!isSelf(user)) {
        //     await reaction.users.remove(user);
        // }
    }

    // Bot configuration
    addCommand(prefix: string, handler: CommandHandler) {
        this.prefixRoutes[this.prefix + prefix] = handler;
    }

    // Bot interaction
    async addEmojiList(msg: Discord.Message, emoji: Discord.EmojiResolvable[]) {
        await Promise.all(emoji.map(e => msg.react(e)));
    }
};

export default new Exchange();
