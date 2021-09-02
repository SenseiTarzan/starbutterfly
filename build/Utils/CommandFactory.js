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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = require("../Commands/Command");
class CommandFactory {
    constructor(client, prefix) {
        this.commands = new discord_js_1.Collection();
        CommandFactory.prefix = prefix;
        client.on("messageCreate", (message) => __awaiter(this, void 0, void 0, function* () {
            if (!message.content.startsWith(prefix) || message.author.bot)
                return;
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            if (this.hasCommand(command)) {
                const commands = this.getCommand(command);
                if (commands instanceof Command_1.Commands) {
                    yield commands.execute(message.author, message, args);
                    return;
                }
            }
        }));
    }
    static getPrefix() {
        return this.prefix;
    }
    /**
     * Permet de d'erengistre des Commands Discord
     * @param Command
     * @param overide
     * @returns
     */
    registerCommands(Command, overide = false) {
        const CommandName = Command.getName();
        const CommandAlias = Command.getAlias();
        if (!this.hasCommand(CommandName)) {
            this.commands.set(CommandName, Command);
            console.log(`Command ${CommandFactory.prefix}${CommandName} a été enregistre`);
        }
        else {
            if (overide) {
                this.commands.set(CommandName, Command);
                console.log(`Command ${CommandFactory.prefix}${CommandName} a été enregistre`);
                return;
            }
            console.log(`Vous ne pouvez pas enregistre ${CommandName} car il est deja existante`);
        }
        CommandAlias.forEach((alias) => {
            if (!this.hasCommand(alias)) {
                console.log(`Command ${CommandFactory.prefix}${CommandName} a été enregistre avec avec l'alias: ${alias}`);
                this.commands.set(alias, Command);
            }
            else {
                console.log(`Vous ne pouvez pas enregistre ${alias} car il est deja existante`);
            }
        });
    }
    /**
     * Donne true si la commands existe sinon false
     * @param CommandName
     * @returns
     */
    hasCommand(CommandName) {
        return this.commands.has(CommandName);
    }
    /**
     * donnes la Classe de la commande si elle existe sinon null
     * @param CommandName
     * @returns
     */
    getCommand(CommandName) {
        try {
            return this.commands.get(CommandName);
        }
        catch (error) {
            return null;
        }
    }
}
exports.default = CommandFactory;
//# sourceMappingURL=CommandFactory.js.map